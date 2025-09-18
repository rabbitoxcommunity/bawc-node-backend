const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { createCategory, getCategories, updateCategory, deleteCategory, getCategoryById } = require('../controllers/categoryController');

const router = express.Router();
router.post('/', protect, createCategory);
router.get('/', getCategories);
router.put('/', protect, updateCategory);
router.delete('/', protect, deleteCategory);
router.get('/:id', getCategoryById);

module.exports = router;