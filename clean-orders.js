const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hassan:Heso124578@main.vnkludj.mongodb.net/topia-db';

async function cleanCorruptedOrders() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!');

        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        // Find all orders
        const allOrders = await ordersCollection.find({}).toArray();
        console.log(`📦 Total orders found: ${allOrders.length}`);

        // Find orders without _id or with invalid _id
        const corruptedOrders = allOrders.filter(order => {
            return !order._id || order._id === null || order._id === 'undefined';
        });

        console.log(`⚠️ Corrupted orders found: ${corruptedOrders.length}`);

        if (corruptedOrders.length > 0) {
            console.log('🗑️ Corrupted orders:');
            corruptedOrders.forEach((order, index) => {
                console.log(`   ${index + 1}. _id: ${order._id}, user: ${order.user}, createdAt: ${order.createdAt}`);
            });

            // Delete corrupted orders
            const deleteResult = await ordersCollection.deleteMany({
                _id: { $in: corruptedOrders.map(o => o._id).filter(id => id) }
            });

            console.log(`✅ Deleted ${deleteResult.deletedCount} corrupted orders`);
        } else {
            console.log('✨ No corrupted orders found!');
        }

        // Show sample of valid orders
        const validOrders = await ordersCollection.find({}).limit(3).toArray();
        console.log('\n📋 Sample of valid orders:');
        validOrders.forEach((order, index) => {
            console.log(`   ${index + 1}. ID: ${order._id}, User: ${order.user}, Total: ${order.totalPrice} EGP`);
        });

        await mongoose.connection.close();
        console.log('\n👋 Connection closed');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

cleanCorruptedOrders();
