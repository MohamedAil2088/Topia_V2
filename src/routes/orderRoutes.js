const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    updateOrderToShipped,
    getMyOrders,
    getOrders,
    getPurchasedProducts,
    updateOrderStatus
} = require('../controllers/orderController');
const { protect, admin, protectOptional } = require('../middleware/auth');
const { orderValidation } = require('../middleware/validation');

router.route('/').post(protectOptional, orderValidation, addOrderItems).get(protect, admin, getOrders);

// Specific routes MUST come before /:id routes
router.route('/myorders').get(protect, getMyOrders);
router.route('/myproducts').get(protect, getPurchasedProducts);

// Generic /:id routes come last
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/ship').put(protect, admin, updateOrderToShipped);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/status').put(protect, admin, updateOrderStatus);

module.exports = router;
