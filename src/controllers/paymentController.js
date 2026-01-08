const Stripe = require('stripe');
const dotenv = require('dotenv');
dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

// @desc    Create Payment Intent
// @route   POST /api/payment/create-payment-intent
// @access  Private/Guest
exports.createPaymentIntent = async (req, res) => {
    try {
        if (!stripe) {
            return res.status(500).json({ error: 'Stripe API Key is missing. Please add it to .env' });
        }
        const { amount, currency = 'egp' } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @desc    Get Stripe Publishable Key
// @route   GET /api/payment/config
// @access  Public
exports.getStripeConfig = (req, res) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY // User needs to add this to .env
    });
};
