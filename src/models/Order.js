const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Changed to false for Guest Checkout
    },
    isGuest: {
        type: Boolean,
        default: false
    },
    guestInfo: {
        name: { type: String },
        email: { type: String },
        phone: { type: String }
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            }
        }
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Card', 'PayPal', 'VodafoneCash', 'Vodafone Cash', 'EtisalatCash', 'OrangeCash', 'WePay', 'InstaPay', 'CashOnDelivery']
    },
    paymentDetails: {
        walletNumber: { type: String }, // رقم المحفظة المحول منها
        transactionId: { type: String }, // رقم العملية
        receiptImage: { type: String }   // رابط صورة الإيصال
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
        receiptImage: { type: String } // Added here to match frontend choice
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    discountPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    isElitePackaging: {
        type: Boolean,
        default: false
    },
    packagingPrice: {
        type: Number,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    isShipped: {
        type: Boolean,
        required: true,
        default: false
    },
    shippedAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },
    deliveredAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
