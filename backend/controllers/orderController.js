const pool = require('../dataBase.js');

  const createOrder = async (req, res) => {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      const { user_id, customer_info, delivery_info, payment_info, items, subtotal, shipping_cost, total_amount, notes,status} = req.body;

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
          delivery_info.method === 'speedyAddress' ? delivery_info.address : null,
          delivery_info.method === 'speedyAddress' ? delivery_info.city : 
          delivery_info.method === 'speedyOffice' ? delivery_info.city : null,
          delivery_info.method === 'speedyAddress' ? delivery_info.postalCode : null,
          delivery_info.method === 'speedyAddress' ? delivery_info.addressDetails : null,
          delivery_info.method === 'speedyOffice' ? delivery_info.office : null,
          delivery_info.method === 'freshBalance' ? delivery_info.store : null,
          payment_info.method,
          payment_info.status,
          subtotal,
          shipping_cost,
          total_amount,
          notes || null,
          status || 'pending'
        ]
      );

      const orderId = orderResult.insertId;

      for (const item of items) {
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, quantity, price) 
           VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price]
        );

        await connection.execute(
          `UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?`,
          [item.quantity, item.product_id, item.quantity]
        );
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
    } 
    catch (error) {
      if (connection) await connection.rollback();
      console.error('Error creating order:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'An error occurred while creating your order' 
      });
    } 
    finally {
      if (connection) connection.release();
    }
  }

  /*----------------------GET-ORDER-BY-ID-----------------------*/
  const getOrderById = async (req, res) => {
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
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'An error occurred while fetching the order' 
      });
    }
  }

  /*-------------------------GET-USER-ORDERS-----------------------------*/
  const getUserOrders = async (req, res) => {
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
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'An error occurred while fetching orders' 
      });
    }
  }

  /*------------------------UPDATE-ORDER-STATUS--------------------------*/
  const updateOrderStatus = async (req, res) => {
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
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'An error occurred while updating order status' 
      });
    }
  }
  /*---------------------------SPEEDY-OFFICESS----------------------------*/
  const getSpeedyOffices = async (req, res) => {
    try {
      const { city } = req.query;
      
      if (!city) {
        return res.status(400).json({ 
          success: false, 
          message: 'City parameter is required' 
        });
      }

      const officesByCity = {
        'София': ['Office Sofia 1', 'Office Sofia 2', 'Office Sofia 3', 'Central Sofia Office'],
        'Пловдив': ['Office Plovdiv 1', 'Office Plovdiv 2'],
        'Варна': ['Office Varna 1', 'Office Varna 2', 'Office Varna 3'],
        'Burgas': ['Office Burgas 1', 'Office Burgas 2'],
        'Stara Zagora': ['Office Stara Zagora 1']
      };

      res.json({
        success: true,
        offices: officesByCity[city] || []
      });
    } catch (error) {
      console.error('Error fetching offices:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'An error occurred while fetching offices' 
      });
    }
  }

  /*-----------------------------FRESH-BALANCE-STORES------------------------------*/
  const getFreshBalanceStores = async (req, res) => {
    try {
      const stores = [
        'FreshBalance Sofia Mall',
        'FreshBalance Paradise Center',
        'FreshBalance The Mall',
        'FreshBalance Serdika Center'
      ];

      res.json({
        success: true,
        stores
      });
    } catch (error) {
      console.error('Error fetching stores:', error);
      res.status(500).json({ 
        success: false, 
        message: error.message || 'An error occurred while fetching stores' 
      });
    }
  }

module.exports = {
  createOrder,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  getSpeedyOffices,
  getFreshBalanceStores
}