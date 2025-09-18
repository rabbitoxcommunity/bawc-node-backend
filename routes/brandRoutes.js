const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createBrand, getBrands, updateBrand, deleteBrand, getBrandById } = require('../controllers/brandController');

const router = express.Router();
router.post('/', protect, createBrand);
router.get('/', getBrands); // Public for frontend filtering
router.put('/', protect, updateBrand);
router.delete('/', protect, deleteBrand);
router.get('/:id', getBrandById);

module.exports = router;