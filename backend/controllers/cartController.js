const pool = require("../dataBase.js");
const { z } = require("zod");

/*-------------------------------ZOD-VALIDATION----------------------------------*/
const productIdSchema = z.string({required_error: "Product ID is required.",invalid_type_error: "Product ID must be a string.",})
  .regex(/^\d+$/, { message: "Product ID must contain only digits." })
  .transform(Number);

const quantitySchema = z.number({required_error: "Quantity is required.",invalid_type_error: "Quantity must be a number.",})
  .int({ message: "Quantity must be an integer." })
  .min(1, { message: "Quantity must be at least 1." });

const cartItemSchema = z.object({
  productId: productIdSchema,
  quantity: quantitySchema,
});
  
/*---------------------------------GET-AVAILABLE-STOCK--------------------------------------*/
const getAvailableStock = async (req, res) => {
  console.log("getAvailableStock function has been called!");

  try {
    const productIdValidation = productIdSchema.safeParse(req.params.productId);

    if(!productIdValidation.success){
      return res.status(400).json({message:"Invalid cart item data!", error:productIdValidation.error.issues});
    }

    const productId = productIdValidation.data;

    const [[product], [cartItem]] = await Promise.all([
      pool.query("SELECT stock FROM products WHERE id = ?", [productId]),
      pool.query("SELECT quantity FROM user_cart WHERE user_id = ? AND product_id = ?", [req.user.userId, productId])
    ]);

    if (!product || product.length === 0) {
      return res.status(404).json({ message: "Product not found!" });
    }
    
    const notAvailable = product[0].stock === 0;
    const available = product[0].stock - (cartItem[0]?.quantity || 0);
    
    res.json({
      availableStock: available,
      productNotAvailable: notAvailable,
    });
  } 
  catch (error) {
    console.error("Error getting stock:", error);
    res.status(500).json({ message: "Server error!", error: error.message});
  }
};

/*-----------------------------ADD-TO-CART------------------------------*/
const addToCart = async (req, res) => {
  console.log("addToCart function has been called!");

  try {
    const validation = cartItemSchema.safeParse({
      productId: req.params.productId,
      quantity: parseInt(req.body.quantity) || 1
    });

    if (!validation.success) {
      return res.status(400).json({ message: "Invalid cart item data!", errors: validation.error.issues });
    }

    const productId = validation.data.productId;
    const quantity = validation.data.quantity;

    const [product] = await pool.query(
      "SELECT stock FROM products WHERE id = ?",
      [productId]
    );

    if (!product || product.length === 0) {
      return res.status(404).json({ message: "Product not found!" });
    }

    const [cartItem] = await pool.query(
      "SELECT quantity FROM user_cart WHERE user_id = ? AND product_id = ?",
      [req.user.userId, productId]
    );

    const currentInCart = cartItem[0]?.quantity || 0;
    const requestedTotal = currentInCart + quantity;

    if (requestedTotal > product[0].stock) {
      return res.status(400).json({
        message: `Only ${product[0].stock - currentInCart} available (you have ${currentInCart} in cart)`,
        code: "STOCK_LIMIT"
      });
    }

    await pool.query(
      `INSERT INTO user_cart (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
       quantity = quantity + ?`,
      [req.user.userId, productId, quantity, quantity]
    );

    res.json({ success: true });
  } 
  catch(error){
    console.error("Error adding to cart: ", error);
    res.status(500).json({ message: "Server error!", error:error.message });
  }
};

/*----------------------------------GET-CART-----------------------------------*/
const getCart = async (req, res) => {
  console.log("getCart function has been called!");

  try {
    const [cartItems] = await pool.query(
      `SELECT c.product_id, c.quantity, p.name, p.price, p.image, p.stock,
      (p.price * c.quantity) as subtotal
      FROM user_cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?`,
      [req.user.userId]
    );
    
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    const formattedItems = cartItems.map(item => {
      if (item.image) {
        return {
          ...item,
          image: {
            data: item.image.toString("base64")
          }
        };
      }
      return item;
    });
    
    res.json({
      items: formattedItems,
      totalItems,
      totalAmount
    });
  } 
  catch(error){
    console.error("Error getting cart: ", error);
    res.status(500).json({ message: "Server error!", error:error.message });
  }
};

/*---------------------------------UPDATE-ITEM-------------------------------------*/
const updateCartItem = async (req, res) => {
  console.log("updateCartItem function has been called!");

  try {
    const validation = cartItemSchema.safeParse({
      productId: req.params.productId,
      quantity: parseInt(req.body.quantity) || 1
    })

    if (!validation.success) {
      return res.status(400).json({ message: "Invalid cart item data!", errors: validation.error.issues });
    }
    
    const productId = validation.data.productId;
    const quantity = validation.data.quantity;

    const [product] = await pool.query(
      "SELECT stock FROM products WHERE id = ?",
      [productId]
    );

    if (!product || product.length === 0) {
      return res.status(404).json({ message: "Product not found!" });
    }

    if (product[0].stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock available!" });
    }
    
    const [result] = await pool.query(
      `UPDATE user_cart 
       SET quantity = ?
       WHERE user_id = ? 
       AND product_id = ?`,
      [quantity, req.user.userId, productId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found in cart!" });
    }
    
    res.json({ success: true });
  } 
  catch (error) {
    console.error("Error updating cart: ", error);
    res.status(500).json({ message: "Server error!", error:error.message });
  }
};

/*----------------------------REMOVE-ITEM-----------------------------------*/
const removeFromCart = async (req, res) => {
  console.log("removeFromCart function has been called!");

  try {
    const productIdValidation = productIdSchema.safeParse(req.params.productId);

    if(!productIdValidation.success){
      return res.status(400).json({message:"Error removing item: ", error:productIdValidation.error.issues});
    }

    const productId = productIdValidation.data;
    
    const [item] = await pool.query(
      "SELECT * FROM user_cart WHERE user_id = ? AND product_id = ?",
      [req.user.userId, productId]
    );
    
    if (!item.length) {
      return res.status(404).json({ message: "Item not found in cart!" });
    }
    
    await pool.query(
      "DELETE FROM user_cart WHERE user_id = ? AND product_id = ?",
      [req.user.userId, productId]
    );
    
    res.json({ 
      success: true,
      removedItem: item[0]
    });
  } 
  catch(error){
    console.error("Error removing from cart: ", error);
    res.status(500).json({ message: "Server error!", error:error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  getAvailableStock,
};