const pool = require("../dataBase.js");

const addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, details, categories } = req.body;
    const image = req.file ? req.file.filename : null; // Get filename from multer

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required." });
    }

    const [result] = await pool.query(
      "INSERT INTO products (name, description, price, stock, details, image) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, price, stock, details, image]
    );

    const productId = result.insertId;

    if (categories && JSON.parse(categories).length > 0) {
      const categoryIds = JSON.parse(categories);
      for (const categoryId of categoryIds) {
        await pool.query(
          "INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)",
          [productId, categoryId]
        );
      }
    }

    res.status(201).json({ message: "Product added successfully." });
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "Server error." });
  }
};

const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ message: "Product removed successfully." });
  } catch (err) {
    console.error("Error removing product:", err);
    res.status(500).json({ message: "Server error." });
  }
};

const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error." });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { link } = req.params;
    const [rows] = await pool.query(
      `SELECT p.* FROM products p
       JOIN product_categories pc ON p.id = pc.product_id
       JOIN categories c ON pc.category_id = c.id
       WHERE c.link = ?`,
      [link]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching products by category:", err);
    res.status(500).json({ message: "Server error." });
  }
};

const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  addProduct,
  removeProduct,
  getProducts,
  getProductsByCategory,
  getCategories,
};