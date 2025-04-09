const pool = require("../dataBase.js");

const addProduct = async (req, res) => {
  console.log("Add product request received");
  console.log("Form data:", req.body);
  console.log("File received:", req.file);
  
  try {
    const { name, description, price, stock, details, categories } = req.body;
    
    // Get the image buffer instead of filename
    const imageBuffer = req.file ? req.file.buffer : null;
    
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required." });
    }
    
    // Log before database operation
    console.log("Attempting database insert with:", {
      name, description, price, stock, details, 
      image: imageBuffer ? `[Binary data - ${imageBuffer.length} bytes]` : null
    });
    
    try {
      const [result] = await pool.query(
        "INSERT INTO products (name, description, price, stock, details, image) VALUES (?, ?, ?, ?, ?, ?)",
        [name, description, price, stock, details, imageBuffer]
      );
      console.log("Database insert successful:", result);
      
      const productId = result.insertId;
      
      if (categories && JSON.parse(categories).length > 0) {
        console.log("Processing categories:", categories);
        const categoryIds = JSON.parse(categories);
        for (const categoryId of categoryIds) {
          await pool.query(
            "INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)",
            [productId, categoryId]
          );
        }
        console.log("Categories processed successfully");
      }
      
      res.status(201).json({ message: "Product added successfully." });
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      return res.status(500).json({ message: "Database error: " + dbError.message });
    }
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ message: "Server error: " + err.message });
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

const getCategoryGroupsWithCategories = async (req, res) => {
  try {
    const [groups] = await pool.query("SELECT * FROM category_groups ORDER BY display_order");
    const [categories] = await pool.query("SELECT * FROM categories ORDER BY display_order");

    const groupedCategories = groups.map(group => {
      return {
        ...group,
        categories: categories.filter(category => category.group_id === group.id)
      };
    });

    res.json(groupedCategories);
  } catch (err) {
    console.error("Error fetching category groups with categories:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  addProduct,
  removeProduct,
  getProducts,
  getProductsByCategory,
  getCategories,
  getCategoryGroupsWithCategories,
};