const express = require('express');
const router = express.Router();
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware.js');
const productController = require('../controllers/productController.js');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use((req, res, next) => {
  console.log(`Product API Request: ${req.method} ${req.originalUrl}`);
  next();
});

router.post('/admin/products', authMiddleware.authenticateJWT, authMiddleware.verifyAdmin, upload.single('image'), productController.addProduct);
router.delete('/:id', authMiddleware.authenticateJWT, authMiddleware.verifyAdmin, productController.removeProduct);

router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/category-groups', productController.getCategoryGroupsWithCategories);
router.get('/category/:link', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

module.exports = router;