const pool = require("../dataBase.js");
const { z } = require("zod");

/*----------------------------ZOD-VALIDATION-------------------------------*/
const productSchema = z.object({
  name: z.string().min(1, "Name is required!"),
  description: z.string().optional().nullish(),
  price: z.coerce.number().positive("Price is required!"),
  stock: z.coerce.number().nonnegative().default(0),
  details: z.string().optional().nullish(),
  categories: z.preprocess(
    val => {
      try { return typeof val === 'string' ? JSON.parse(val) : val; }
      catch { return []; }
    },
    z.array(z.number()).default([])
  )
});

/*-------------------------------ADDING-PRODUCTS----------------------------------------*/
const addProduct = async (req, res) => {
  console.log("addProduct function has been called!");
  console.log("Form data:", req.body);
  console.log("File received:", req.file);
  
  try {
    const validation = productSchema.safeParse(req.body);

    if (!validation.success) {
      const errorMessages = validation.error.errors.map(err => err.message);
      return res.status(400).json({
        message: "Validation failed",
        errors: errorMessages
      });
    }

    const validatedData = validation.data;

    if (req.file) {
      const maxSize = 5 * 1024 * 1024;
      if (req.file.size > maxSize) {
        console.error("Image is bigger than 5MB!");
        return res.status(400).json({
          message: "Validation failed!",
          errors: ["Max image size is 5MB"]
        });
      }
    }
    
    const imageBuffer = req.file ? req.file.buffer : null;
    const { name, description, price, stock, details, categories } = validatedData;

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
  console.log("removeProduct function has been called!");

  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid product ID!"});
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
        return res.status(404).json({ message: "Product not found!"});
      }

      await connection.commit();
      return res.status(200).json({ 
        success: true,
        message: "Product removed successfully" 
      });
    } 
    catch (error) {
      await connection.rollback();
      console.error("Database error:", error); 
    } 
    finally {
      connection.release();
    }
  } 
  catch (error) {
    console.error("Remove error:", error);
    res.status(500).json({message: "Server error during removal: " + error.message});
  }
};

/*------------------------------------GET-ALL-PRODUCTS----------------------------------------*/
const getProducts = async (req, res) => {
  console.log("getProducts function has been called!");

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
  catch(error){
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/*------------------------------------GET-PRODUCTS-BY-CATEGORY----------------------------------------*/
const getProductsByCategory = async (req, res) => {
  console.log("getProductsByCategory function has been called!");

  try {
    const { link } = req.params;
    const fullLink = `/product/${link}`;
    
    console.log("Looking for products with category link:", fullLink);
    
    const [categoryExists] = await pool.query(
      "SELECT id FROM categories WHERE link = ?",
      [fullLink]
    );
    
    if (categoryExists.length === 0) {
      return res.status(404).json({ message: "Category not found!"});
    }
    
    const [rows] = await pool.query(
      `SELECT p.* FROM products p
       JOIN product_categories pc ON p.id = pc.product_id
       JOIN categories c ON pc.category_id = c.id
       WHERE c.link = ?`,
      [fullLink]
    );
    
    console.log(`Found ${rows.length} products in category.`);
    
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
  catch(error){
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/*------------------------------------GET-ALL-CATEGORIES----------------------------------------*/
const getCategories = async (req, res) => {
  console.log("getCategories function has been called!");

  try {
    const [rows] = await pool.query("SELECT * FROM categories");
    res.json(rows);
  } 
  catch(error){
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/*------------------------------------GET-ALL-GROUPS-AND-ALL-CATEGORIES----------------------------------------*/
const getCategoryGroupsWithCategories = async (req, res) => {
  console.log("getCategoryGroupsWithCategories function has been called!");

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
  catch(error){
    console.error("Error fetching category groups with categories:", error);
    res.status(500).json({ message: "Server error." });
  }
};

/*-------------------------------GET-PRODUCT-BY-ID-----------------------------------*/
const getProductById = async (req, res) => {
  console.log("getProductsById function has been called!");

  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: "Product ID is required!" });
    }

    const [product] = await pool.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found!" });
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
  catch(error){
    console.error("Error fetching product by ID:", error);
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