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

/*----------------------------FINISHING-ORDER-----------------------------------*/
const checkout = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { shippingAddress, paymentMethod } = req.body;
    
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: "Shipping address and payment method are required" });
    }
    
    const [cartItems] = await connection.query(
      `SELECT c.product_id, c.quantity, p.price, p.stock
       FROM user_cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [req.user.userId]
    );
    
    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Your cart is empty" });
    }

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await connection.rollback()
        return res.status(400).json({ message: `Not enough stock for product ID ${item.product_id}` });
      }
    }
    
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, payment_method)
       VALUES (?, ?, ?, ?)`,
      [req.user.userId, totalAmount, shippingAddress, paymentMethod]
    );
    
    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );
      
      await connection.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    await connection.query(
      "DELETE FROM user_cart WHERE user_id = ?", 
      [req.user.userId]
    );
    
    await connection.commit();
    
    res.json({
      success: true,
      orderId,
      totalAmount
    });
  } 
  catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error" });
  } 
  finally {
    connection.release();
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  getAvailableStock,
  checkout
};