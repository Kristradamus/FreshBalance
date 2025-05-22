const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const orderController = require("../controllers/orderController.js");

router.use((req, res, next) => {
  console.log(`Orders API Request: ${req.method} ${req.originalUrl}`);
  next();
});

router.use(authMiddleware.authenticateJWT);

router.get("/stores", orderController.getStores);
router.get("/cities", orderController.getCities);
router.get("/speedy-offices/:city", orderController.getSpeedyOffices);
router.post("/", orderController.validateOrderData, orderController.createOrder);
router.get("/:orderId", orderController.getOrderById);
router.get("/", orderController.getUserOrders);
router.patch("/:orderId/status", authMiddleware.verifyAdmin, orderController.updateOrderStatus);

module.exports = router;