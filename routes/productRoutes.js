const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');

const router = express.Router();
router.post('/', protect, createProduct);
router.get('/', getProducts); // Public for frontend listing/filtering
router.get('/:id', getProductById); // Public for product details
router.put('/', protect, updateProduct);
router.delete('/', protect, deleteProduct);

module.exports = router;