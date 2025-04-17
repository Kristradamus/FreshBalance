const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware.js");
const favoriteController = require("../controllers/favoriteController.js");

router.use((req, res, next) => {
  console.log(`Favorites API Request: ${req.method} ${req.originalUrl}`);
  next();
});

router.use(authMiddleware.authenticateJWT);

router.post('/:productId', favoriteController.addFavorite);
router.delete('/:productId', favoriteController.removeFavorite);
router.get('/check/:productId', favoriteController.checkFavorite);
router.get('/', favoriteController.getUserFavorites);

module.exports = router;