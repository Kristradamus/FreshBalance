const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const orderController = require("../controllers/orderController.js");

router.use((req, res, next) => {
  console.log(`Orders API Request: ${req.method} ${req.originalUrl}`);
  next();
});

router.get("/stores", authMiddleware.authenticateJWT, orderController.getStores);

router.get("/cities", authMiddleware.authenticateJWT, orderController.getCities);
router.get("/speedy-offices", authMiddleware.authenticateJWT, orderController.getSpeedyOffices);
router.post("/", orderController.createOrder);
router.get("/:orderId", orderController.getOrderById);
router.get("/", authMiddleware.authenticateJWT, orderController.getUserOrders);
router.patch("/:orderId/status", authMiddleware.authenticateJWT, authMiddleware.verifyAdmin, orderController.updateOrderStatus);

module.exports = router;