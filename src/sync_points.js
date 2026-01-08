const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Order = require('./models/Order');
const User = require('./models/User');

const syncPoints = async () => {
    try {
        console.log('🚀 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        const orders = await Order.find({ user: { $exists: true } });
        console.log(`📦 Found ${orders.length} orders with users.`);

        // Reset points first if you want a clean sync, or just add them.
        // For a full sync, it's safer to calculate from scratch per user.
        const userPointsMap = new Map();

        orders.forEach(order => {
            const userId = order.user.toString();
            const pointsFromOrder = Math.floor(order.totalPrice / 10);
            userPointsMap.set(userId, (userPointsMap.get(userId) || 0) + pointsFromOrder);
        });

        console.log(`👤 Syncing ${userPointsMap.size} users...`);

        for (const [userId, points] of userPointsMap) {
            await User.findByIdAndUpdate(userId, { points: points });
            console.log(`✨ Updated User ${userId}: ${points} points`);
        }

        console.log('🏁 Points Synchronization Complete!');
        process.exit();
    } catch (error) {
        console.error('❌ Error during sync:', error.message);
        process.exit(1);
    }
};

syncPoints();
