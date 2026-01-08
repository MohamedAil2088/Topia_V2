const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hassan:Heso124578@main.vnkludj.mongodb.net/topia-db';

// ⚠️ حط الـ Order ID اللي عايز تحذفه هنا
const ORDER_ID_TO_DELETE = ''; // <<< حط الـ ID هنا بين علامتي التنصيص

async function quickDeleteOrder() {
    try {
        if (!ORDER_ID_TO_DELETE) {
            console.log('❌ Please set ORDER_ID_TO_DELETE in the script first!');
            console.log('   Example: const ORDER_ID_TO_DELETE = "695897f8ea45c0bbb6f982a7";');
            process.exit(1);
        }

        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!\n');

        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        // Find the order first
        console.log(`🔍 Looking for order: ${ORDER_ID_TO_DELETE}`);
        const order = await ordersCollection.findOne({
            _id: new mongoose.Types.ObjectId(ORDER_ID_TO_DELETE)
        });

        if (!order) {
            console.log('❌ Order not found!');
            await mongoose.connection.close();
            process.exit(1);
        }

        console.log('\n📦 Order Found:');
        console.log(`   ID: ${order._id}`);
        console.log(`   User: ${order.user}`);
        console.log(`   Total: ${order.totalPrice} EGP`);
        console.log(`   Status: ${order.isDelivered ? 'Delivered' : 'Processing'}`);
        console.log(`   Items: ${order.orderItems?.length || 0}`);
        console.log(`   Created: ${new Date(order.createdAt).toLocaleString()}`);

        // Delete
        console.log('\n🗑️  Deleting order...');
        const result = await ordersCollection.deleteOne({
            _id: new mongoose.Types.ObjectId(ORDER_ID_TO_DELETE)
        });

        if (result.deletedCount > 0) {
            console.log('✅ Order deleted successfully!');
            console.log(`   Deleted count: ${result.deletedCount}`);
        } else {
            console.log('❌ Failed to delete order');
        }

        // Show remaining orders count
        const remainingCount = await ordersCollection.countDocuments({});
        console.log(`\n📊 Remaining orders in database: ${remainingCount}`);

        await mongoose.connection.close();
        console.log('👋 Connection closed');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

quickDeleteOrder();
