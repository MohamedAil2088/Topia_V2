const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('./models/Order');
const connectDB = require('./config/database');

dotenv.config();
connectDB();

const checkOrders = async () => {
    try {
        const orders = await Order.find({});
        console.log(`Total Orders: ${orders.length}`);
        if (orders.length > 0) {
            console.log('Sample Order:', JSON.stringify(orders[0], null, 2));
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkOrders();
