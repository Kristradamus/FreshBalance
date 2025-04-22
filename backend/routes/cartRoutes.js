const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const cartController = require("../controllers/cartController.js");

router.use((req, res, next) => {
  console.log(`Favorites API Request: ${req.method} ${req.originalUrl}`);
  next();
});

router.use(authMiddleware.authenticateJWT);

router.get("/stock/:productId", cartController.getAvailableStock);
router.get("/", cartController.getCart);
router.post("/add/:productId", cartController.addToCart);
router.put("/update/:productId", cartController.updateCartItem);
router.delete("/remove/:productId", cartController.removeFromCart);

module.exports = router;