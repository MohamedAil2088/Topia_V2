const express = require('express');
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    createProductReview
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const { productValidation } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id/related', require('../controllers/productController').getRelatedProducts);
router.get('/:id', getProductById);

// Protected routes
router.post('/:id/reviews', protect, createProductReview);

// Protected routes (Admin only)
router.post('/', protect, admin, productValidation, createProduct);
router.put('/:id', protect, admin, productValidation, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
