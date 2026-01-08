const express = require('express');
const router = express.Router();
const {
    createCoupon,
    getAllCoupons,
    validateCoupon,
    deleteCoupon
} = require('../controllers/couponController');
const { protect, admin } = require('../middleware/auth');
const { couponValidation } = require('../middleware/validation');

router.route('/')
    .post(protect, admin, couponValidation, createCoupon)
    .get(protect, admin, getAllCoupons);

router.post('/validate', validateCoupon);

router.route('/:id').delete(protect, admin, deleteCoupon);

module.exports = router;
