const express = require('express');
const router = express.Router();
const {
    getAllReviews,
    approveReview,
    featureReview,
    hideReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

// Get all reviews with filters
router.get('/', protect, admin, getAllReviews);

// Approve/Unapprove review
router.put('/:id/approve', protect, admin, approveReview);

// Feature/Unfeature review
router.put('/:id/feature', protect, admin, featureReview);

// Hide/Unhide review
router.put('/:id/hide', protect, admin, hideReview);

// Delete review
router.delete('/:id', protect, admin, deleteReview);

module.exports = router;
