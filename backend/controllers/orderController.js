const pool = require("../dataBase.js");
const { z } = require("zod");

/*-----------------------ZOD-VALIDATION-SCHEMAS----------------------*/
const customerInfoSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z.string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  email: z.string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(100, "Email must be less than 100 characters"),
  phone: z.string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^\+?[0-9\s\-()]{6,20}$/, "Invalid phone number format")
});

const deliveryInfoSchema = z.object({
  method: z.enum(["speedyAddress", "speedyOffice", "freshBalance"], {
    errorMap: () => ({ message: "Invalid delivery method" })
  }),
  country: z.string().optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  addressDetails: z.string().trim().optional(),
  office: z.string().trim().optional(),
  store: z.union([z.string(), z.number()]).optional()
}).superRefine((data, ctx) => {
  if (data.method === "speedyAddress") {
    if (!data.address || data.address.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Address is required for address delivery",
        path: ["address"]
      });
    }
    if (!data.city || data.city.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "City is required for address delivery",
        path: ["city"]
      });
    }
    if (!data.postalCode || data.postalCode.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Postal code is required for address delivery",
        path: ["postalCode"]
      });
    }
    if (!data.addressDetails || data.addressDetails.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Address details are required for address delivery",
        path: ["addressDetails"]
      });
    }
  } else if (data.method === "speedyOffice") {
    if (!data.city || data.city.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "City is required for office delivery",
        path: ["city"]
      });
    }
    if (!data.office || data.office.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Office selection is required for office delivery",
        path: ["office"]
      });
    }
  } else if (data.method === "freshBalance") {
    if (!data.store) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Store selection is required for store pickup",
        path: ["store"]
      });
    }
  }
});

const paymentInfoSchema = z.object({
  method: z.enum(["cash", "card"], {
    errorMap: () => ({ message: "Invalid payment method" })
  }),
  status: z.enum(["pending", "processing", "completed", "failed"], {
    errorMap: () => ({ message: "Invalid payment status" })
  }).optional()
});

const orderItemSchema = z.object({
  product_id: z.coerce.number()
    .int("Product ID must be an integer")
    .positive("Product ID must be positive"),
  quantity: z.coerce.number()
    .int("Quantity must be an integer")
    .positive("Quantity must be positive")
    .max(100, "Quantity cannot exceed 100"),
  price: z.coerce.number()
    .positive("Price must be positive")
    .max(10000, "Price cannot exceed 10000")
});

const orderSchema = z.object({
  user_id: z.number().int().positive().optional().nullable(),
  customer_info: customerInfoSchema,
  delivery_info: deliveryInfoSchema,
  payment_info: paymentInfoSchema,
  items: z.array(orderItemSchema)
    .min(1, "Order must contain at least one item")
    .max(50, "Order cannot contain more than 50 items"),
  subtotal: z.number()
    .nonnegative("Subtotal cannot be negative")
    .max(100000, "Subtotal cannot exceed 100000"),
  shipping_cost: z.number()
    .nonnegative("Shipping cost cannot be negative")
    .max(1000, "Shipping cost cannot exceed 1000"),
  total_amount: z.number()
    .positive("Total amount must be positive")
    .max(100000, "Total amount cannot exceed 100000"),
  notes: z.string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .nullable(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"], {
    errorMap: () => ({ message: "Invalid order status" })
  }).optional()
}).superRefine((data, ctx) => {
  const calculatedTotal = Number((data.subtotal + data.shipping_cost).toFixed(2));
  const providedTotal = Number(data.total_amount.toFixed(2));
  
  if (Math.abs(calculatedTotal - providedTotal) > 0.01) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Total amount mismatch. Expected: ${calculatedTotal}, Received: ${providedTotal}`,
      path: ["total_amount"]
    });
  }
});

/*-----------------------VALIDATION-MIDDLEWARE----------------------*/
const validateOrderData = async (req, res, next) => {
  try {
    console.log("Validating order data:", req.body);
    
    const validatedData = orderSchema.parse(req.body);
    
    const connection = await pool.getConnection();
    
    try {
      for (const item of validatedData.items) {
        const [productRows] = await connection.execute(
          'SELECT id, name, stock, price FROM products WHERE id = ?',
          [item.product_id]
        );
        
        if (productRows.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Product with ID ${item.product_id} does not exist`
          });
        }
        
        const product = productRows[0];
        
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
          });
        }
        
        if (Math.abs(product.price - item.price) > 0.01) {
          return res.status(400).json({
            success: false,
            message: `Price mismatch for product "${product.name}". Expected: ${product.price}, Received: ${item.price}`
          });
        }
      }

      let calculatedSubtotal = 0;
      for (const item of validatedData.items) {
        calculatedSubtotal += item.price * item.quantity;
      }
      
      if (Math.abs(calculatedSubtotal - validatedData.subtotal) > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Subtotal mismatch. Expected: ${calculatedSubtotal.toFixed(2)}, Received: ${validatedData.subtotal.toFixed(2)}`
        });
      }
      
      if (validatedData.user_id) {
        const [userRows] = await connection.execute(
          'SELECT user_id FROM users WHERE user_id = ?',
          [validatedData.user_id]
        );
        
        if (userRows.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Invalid user ID'
          });
        }
      }
      
    } finally {
      connection.release();
    }

    req.validatedOrder = validatedData;
    next();
    
  } catch (error) {
    console.error('Order validation error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error during validation'
    });
  }
};

/*-----------------------CREATE-ORDER----------------------*/
const createOrder = async (req, res) => {
  console.log("createOrder function has been called!");

  let connection;
  try {
    const { user_id, customer_info, delivery_info, payment_info, items, subtotal, shipping_cost, total_amount, notes, status } = req.validatedOrder;
    
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderResult] = await connection.execute(
      `INSERT INTO orders (
        user_id, first_name, last_name, email, phone,
        delivery_method, delivery_address, delivery_city, delivery_postal_code, 
        delivery_address_details, delivery_office, delivery_store,
        payment_method, payment_status, subtotal, shipping_cost, total_amount, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id || null,
        customer_info.firstName,
        customer_info.lastName,
        customer_info.email,
        customer_info.phone,
        delivery_info.method,
        delivery_info.method === "speedyAddress" ? delivery_info.address : null,
        delivery_info.method === "speedyAddress" ? delivery_info.city : 
        delivery_info.method === "speedyOffice" ? delivery_info.city : null,
        delivery_info.method === "speedyAddress" ? delivery_info.postalCode : null,
        delivery_info.method === "speedyAddress" ? delivery_info.addressDetails : null,
        delivery_info.method === "speedyOffice" ? delivery_info.office : null,
        delivery_info.method === "freshBalance" ? delivery_info.store : null,
        payment_info.method,
        payment_info.status || (payment_info.method === "cash" ? "pending" : "processing"),
        subtotal,
        shipping_cost,
        total_amount,
        notes || null,
        status || "pending"
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );

      const [updateProduct] = await connection.execute(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );

      if (updateProduct.affectedRows === 0) {
        throw new Error(`Failed to update stock for product: ${item.product_id}`);
      }

      const [cartEntries] = await connection.execute(
        `SELECT user_id, quantity FROM user_cart WHERE product_id = ?`,
        [item.product_id]
      );

      const [[product]] = await connection.execute(
        `SELECT stock FROM products WHERE id = ?`,
        [item.product_id]
      );

      const currentStock = product.stock;

      for (const cartEntry of cartEntries) {
        if (cartEntry.quantity > currentStock) {
          const newQuantity = currentStock > 0 ? currentStock : 0;
          
          if (newQuantity > 0) {
            await connection.execute(
              `UPDATE user_cart SET quantity = ? WHERE user_id = ? AND product_id = ?`,
              [newQuantity, cartEntry.user_id, item.product_id]
            );
          } else {
            await connection.execute(
              `DELETE FROM user_cart WHERE user_id = ? AND product_id = ?`,
              [cartEntry.user_id, item.product_id]
            );
          }
        }
      }
    }

    if (user_id) {
      await connection.execute(
        `DELETE FROM user_cart WHERE user_id = ?`,
        [user_id]
      );
    }

    await connection.commit();
    
    res.json({ 
      success: true, 
      message: 'Order created successfully', 
      order_id: orderId 
    });
    
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error creating order:', error);
    
    res.status(500).json({ 
      success: false, 
      message: "An error occurred while creating your order", 
      error: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
};

/*-----------------------GET-CITIES--------------------------*/
const getCities = async (req, res) => {
  console.log("getCities function has been called!");

  try {
    const [results] = await pool.query(
      `SELECT DISTINCT city FROM speedy_offices GROUP BY city`
    );
    
    if (results.length === 0) {
      console.log("No cities found in database");
      return res.json([]);
    }
    
    const cities = results.map(row => row.city);
    console.log("Sending cities to client:", cities);
    res.json(cities);
  } 
  catch (error) {
    console.error("Database error when fetching cities:", error);
    res.status(500).json({ error: "Failed to load cities" });
  }
};

/*-----------------------GET-SPEEDY-OFFICES--------------------------*/
const getSpeedyOffices = async (req, res) => {
  console.log("getSpeedyOffices function has been called!");
  
  try {
    const city = req.params.city;
    
    const [result] = await pool.query(
      `SELECT office_name, address FROM speedy_offices WHERE city = ?`,
      [city]
    );
    
    if (result.length === 0) {
      console.log("No offices found in database!");
      return res.json([]);
    }
    
    const offices = result.map(row => ({
      name: row.office_name,
      address: row.address
    }));
    
    return res.json(offices);
  }
  catch (error) {
    console.error("Error fetching speedy offices:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/*-----------------------GET-STORES--------------------------*/
const getStores = async (req, res) => {
  console.log("getStores function has been called!");
  try {
    const [results] = await pool.query(
      `SELECT store_id, store_name, address FROM freshbalance_stores`
    );

    if (results.length === 0) {
      return res.json([]);
    }

    const stores = results.map(row => ({
      id: row.store_id,
      displayText: `${row.store_name} - ${row.address}`,
      originalData: {
        store_name: row.store_name,
        address: row.address
      }
    }));

    res.json(stores);
  } 
  catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to load stores" });
  }
};

/*----------------------GET-ORDER-BY-ID-----------------------*/
const getOrderById = async (req, res) => {
  console.log("getOrderById function has been called!");

  try {
    const { orderId } = req.params;
    
    const [orderRows] = await pool.execute(
      `SELECT * FROM orders WHERE order_id = ?`,
      [orderId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    const order = orderRows[0];
    const [itemRows] = await pool.execute(
      `SELECT oi.*, p.name, p.image 
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    if (order.user_id && req.user && order.user_id !== req.user.userId) {
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this order'
        });
      }
    }
    res.json({
      success: true,
      order: {
        ...order,
        items: itemRows
      }
    });
  } 
  catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'An error occurred while fetching the order' 
    });
  }
}

/*-------------------------GET-USER-ORDERS-----------------------------*/
const getUserOrders = async (req, res) => {
  console.log("getUserOrders function has been called!");

  try {
    const userId = req.user.userId;
    const [orderRows] = await pool.execute(
      `SELECT order_id, first_name, last_name, email, 
              delivery_method, payment_method, payment_status,
              total_amount, status, created_at 
       FROM orders WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );
    const orders = [];
    
    for (const order of orderRows) {
      const [itemRows] = await pool.execute(
        `SELECT oi.*, p.name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.order_id]
      );
      
      orders.push({
        ...order,
        items: itemRows
      });
    }

    res.json({
      success: true,
      orders
    });
  } 
  catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'An error occurred while fetching orders' 
    });
  }
}

/*------------------------UPDATE-ORDER-STATUS--------------------------*/
const updateOrderStatus = async (req, res) => {
  console.log("updateOrderStatus function has been called!");

  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const [result] = await pool.execute(
      `UPDATE orders SET status = ? WHERE order_id = ?`,
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`
    });
  } 
  catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'An error occurred while updating order status' 
    });
  }
}

module.exports = {
  createOrder,
  validateOrderData,
  getCities,
  getStores,
  getSpeedyOffices,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
}