const pool = require("../dataBase.js");

/*---------------------------------GET-AVAILABLE-STOCK--------------------------------------*/
const getAvailableStock = async (req, res) => {
  try {
    const { productId } = req.params;

    const [[product], [cartItem]] = await Promise.all([
      pool.query("SELECT stock FROM products WHERE id = ?", [productId]),
      pool.query("SELECT quantity FROM user_cart WHERE user_id = ? AND product_id = ?", [req.user.userId, productId])
    ]);

    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    const available = product[0].stock - (cartItem[0]?.quantity || 0);
    
    res.json({
      availableStock: available
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/*-----------------------------ADD-TO-CART------------------------------*/
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = parseInt(req.body.quantity) || 1;

    const [product] = await pool.query(
      "SELECT stock FROM products WHERE id = ?",
      [productId]
    );

    if (!product.length) {
      return res.status(404).json({ message: "Product not found" });
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/*----------------------------------GET-CART-----------------------------------*/
const getCart = async (req, res) => {
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
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/*---------------------------------UPDATE-ITEM-------------------------------------*/
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1"});
    }
    
    const [product] = await pool.query(
      "SELECT stock FROM products WHERE id = ?",
      [productId]
    );
    
    if (product.length === 0 || product[0].stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }
    
    const [result] = await pool.query(
      `UPDATE user_cart 
       SET quantity = ?
       WHERE user_id = ? 
       AND product_id = ?`,
      [quantity, req.user.userId, productId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    
    res.json({ success: true });
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/*----------------------------REMOVE-ITEM-----------------------------------*/
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const [item] = await pool.query(
      "SELECT * FROM user_cart WHERE user_id = ? AND product_id = ?",
      [req.user.userId, productId]
    );
    
    if (!item.length) {
      return res.status(404).json({ message: "Item not found in cart" });
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
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  getAvailableStock,
};