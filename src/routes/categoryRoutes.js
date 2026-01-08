const express = require('express');
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/auth');
const { categoryValidation } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected routes (Admin only)
router.post('/', protect, admin, categoryValidation, createCategory);
router.put('/:id', protect, admin, categoryValidation, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
