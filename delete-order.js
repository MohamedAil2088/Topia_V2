const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hassan:Heso124578@main.vnkludj.mongodb.net/topia-db';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function deleteOrder() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!\n');

        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');

        // Show recent orders
        const recentOrders = await ordersCollection.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        console.log('📋 Recent Orders:');
        console.log('─'.repeat(80));
        recentOrders.forEach((order, index) => {
            const userId = order.user?.toString().slice(-8) || 'N/A';
            const orderId = order._id.toString();
            const total = order.totalPrice || 0;
            const status = order.isDelivered ? '✅ Delivered' : '⏳ Processing';
            const date = new Date(order.createdAt).toLocaleDateString();

            console.log(`${index + 1}. ID: ${orderId}`);
            console.log(`   User: ...${userId} | Total: ${total} EGP | ${status} | ${date}`);
            console.log('');
        });
        console.log('─'.repeat(80));

        rl.question('\n🗑️  Enter Order ID to delete (or "cancel" to exit): ', async (input) => {
            const trimmedInput = input.trim();

            if (trimmedInput.toLowerCase() === 'cancel') {
                console.log('❌ Cancelled by user');
                await mongoose.connection.close();
                rl.close();
                return;
            }

            try {
                // Find the order first
                const order = await ordersCollection.findOne({ _id: new mongoose.Types.ObjectId(trimmedInput) });

                if (!order) {
                    console.log('❌ Order not found!');
                    await mongoose.connection.close();
                    rl.close();
                    return;
                }

                console.log('\n📦 Order Details:');
                console.log(`   ID: ${order._id}`);
                console.log(`   User: ${order.user}`);
                console.log(`   Total: ${order.totalPrice} EGP`);
                console.log(`   Status: ${order.isDelivered ? 'Delivered' : 'Processing'}`);
                console.log(`   Created: ${new Date(order.createdAt).toLocaleString()}`);

                rl.question('\n⚠️  Are you SURE you want to delete this order? (yes/no): ', async (confirm) => {
                    if (confirm.toLowerCase() === 'yes') {
                        const result = await ordersCollection.deleteOne({ _id: new mongoose.Types.ObjectId(trimmedInput) });

                        if (result.deletedCount > 0) {
                            console.log('\n✅ Order deleted successfully!');
                        } else {
                            console.log('\n❌ Failed to delete order');
                        }
                    } else {
                        console.log('\n❌ Deletion cancelled');
                    }

                    await mongoose.connection.close();
                    console.log('👋 Connection closed');
                    rl.close();
                });

            } catch (error) {
                console.error('\n❌ Error:', error.message);
                await mongoose.connection.close();
                rl.close();
            }
        });

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

deleteOrder();
