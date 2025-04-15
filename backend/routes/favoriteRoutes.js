const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const favoriteController = require("../controllers/favoriteController.js");

router.use((req, res, next) => {
  console.log(`Favorites API Request: ${req.method} ${req.originalUrl}`);
  next();
});

router.post('/:productId', authMiddleware.authenticateJWT, favoriteController.addFavorite);
router.delete('/:productId', authMiddleware.authenticateJWT, favoriteController.removeFavorite);
router.get('/check/:productId', authMiddleware.authenticateJWT, favoriteController.checkFavorite);
router.get('/', authMiddleware.authenticateJWT, favoriteController.getUserFavorites);

module.exports = router;