const express = require('express');
const router = express.Router();
const { createPaymentIntent, getStripeConfig } = require('../controllers/paymentController');

router.post('/create-payment-intent', createPaymentIntent);
router.get('/config', getStripeConfig);

module.exports = router;
