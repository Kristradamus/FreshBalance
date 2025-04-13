const pool = require("../dataBase.js");

/*-------------------------------ADDING-PRODUCTS----------------------------------------*/
const addProduct = async (req, res) => {
  console.log("Add product request received");
  console.log("Form data:", req.body);
  console.log("File received:", req.file);
  
  try {
    const { name, description, price, stock, details, categories } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;
    
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required." });
    }
    
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
    } 
    catch (dbError) {
      console.error("Database operation failed:", dbError);
      return res.status(500).json({ message: "Database error: " + dbError.message });
    }
  } 
  catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

/*-------------------------------REMOVING-PRODUCTS----------------------------------------*/
const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      await connection.query(
        "DELETE FROM product_categories WHERE product_id = ?",
        [id]
      );

      const [result] = await connection.query(
        "DELETE FROM products WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "Product not found" });
      }

      await connection.commit();
      return res.status(200).json({ 
        success: true,
        message: "Product removed successfully" 
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Remove error:", err);
    
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ 
        message: "Cannot delete - product exists in categories" 
      });
    }
    
    return res.status(500).json({ 
      message: "Server error during removal",
      error: err.message 
    });
  }
};

/*------------------------------------GET-ALL-PRODUCTS----------------------------------------*/
const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    const processedProducts = rows.map(product => {
      if (product.image) {
        return {
          ...product,
          image: {
            data: product.image.toString('base64')
          }
        };
      }
      return product;
    });
    
    res.json(processedProducts);
  } 
  catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/*------------------------------------GET-PRODUCTS-BY-CATEGORY----------------------------------------*/
const getProductsByCategory = async (req, res) => {
  try {
    const { link } = req.params;
    
    const fullLink = `/product/${link}`;
    
    console.log("Looking for products with category link:", fullLink);
    
    const [categoryExists] = await pool.query(
      "SELECT id FROM categories WHERE link = ?",
      [fullLink]
    );
    
    if (categoryExists.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    const [rows] = await pool.query(
      `SELECT p.* FROM products p
       JOIN product_categories pc ON p.id = pc.product_id
       JOIN categories c ON pc.category_id = c.id
       WHERE c.link = ?`,
      [fullLink]
    );
    
    console.log(`Found ${rows.length} products in category`);
    
    const processedProducts = rows.map(product => {
      if (product.image) {
        return {
          ...product,
          image: {
            data: product.image.toString('base64')
          }
        };
      }
      return product;
    });
  
    res.json(processedProducts);
  } 
  catch (err) {
    console.error("Error fetching products by category:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/*------------------------------------GET-ALL-CATEGORIES----------------------------------------*/
const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories");
    res.json(rows);
  } 
  catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/*------------------------------------GET-ALL-GROUPS-AND-ALL-CATEGORIES----------------------------------------*/
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
  } 
  catch (err) {
    console.error("Error fetching category groups with categories:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/*-------------------------------GET-PRODUCT-BY-ID-----------------------------------*/
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const [product] = await pool.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productData = product[0];
    
    if (productData.image) {
      productData.image = {
        data: productData.image.toString('base64')
      };
    }
    
    const [categories] = await pool.query(
      `SELECT c.name, c.link 
       FROM categories c
       JOIN product_categories pc ON c.id = pc.category_id
       WHERE pc.product_id = ?`,
      [id]
    );
    
    productData.categories = categories;
    res.json(productData);
  } 
  catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  addProduct,
  getProductById,
  removeProduct,
  getProducts,
  getProductsByCategory,
  getCategories,
  getCategoryGroupsWithCategories,
};