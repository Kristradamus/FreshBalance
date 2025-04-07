const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware.js');
const productController = require('../controllers/productController.js');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Product routes
router.post('/admin/products', authMiddleware.authenticateJWT, upload.single('image'), productController.addProduct);
router.delete('/:id', authMiddleware.authenticateJWT, productController.removeProduct);
router.get('/', productController.getProducts);
router.get('/category/:link', productController.getProductsByCategory);
router.get('/categories', productController.getCategories);

module.exports = router;