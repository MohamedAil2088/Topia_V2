const express = require('express');
const {
    createReview,
    getProductReviews,
    deleteReview,
    getFeaturedReviews
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');
const { reviewValidation } = require('../middleware/validation');

// mergeParams: true يسمح بالوصول إلى params من الـ Router الأب (مثل productId)
const router = express.Router({ mergeParams: true });

// Get featured reviews (Public) - Must be before /:id
router.get('/featured', getFeaturedReviews);

router
    .route('/')
    .get(getProductReviews)
    .post(protect, reviewValidation, createReview);

router
    .route('/:id')
    .delete(protect, deleteReview);

module.exports = router;
