const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../src/models/Order');
const connectDB = require('../src/config/database');

dotenv.config();

const verify = async () => {
    await connectDB();
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });

    if (lastOrder) {
        console.log('\n--- 📜 LAST ORDER VERIFICATION ---');
        console.log(`ID: ${lastOrder._id}`);
        console.log(`Method: ${lastOrder.paymentMethod}`);
        console.log(`Receipt: ${lastOrder.paymentResult?.receiptImage || 'NOT FOUND'}`);
        console.log(`Status: ${lastOrder.isPaid ? 'PAID' : 'PENDING'}`);
        console.log('------------------------------------\n');
    } else {
        console.log('No orders found.');
    }
    process.exit();
};

verify();
