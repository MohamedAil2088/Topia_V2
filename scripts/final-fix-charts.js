const mongoose = require('mongoose');

const fix = async () => {
    try {
        // Target the correct database identified from server logs
        const uri = "mongodb://localhost:27017/mens-ecommerce";
        console.log('🚀 Connecting to REAL database:', uri);
        await mongoose.connect(uri);

        const db = mongoose.connection.db;
        const ordersCollection = db.collection('orders');
        const orders = await ordersCollection.find({}).toArray();

        if (orders.length === 0) {
            console.log('❌ Still no orders. Let me search ALL databases for you...');
            const admin = mongoose.connection.client.db('admin');
            const dbs = await admin.admin().listDatabases();
            for (let dbInfo of dbs.databases) {
                const tempDb = mongoose.connection.client.db(dbInfo.name);
                const count = await tempDb.collection('orders').countDocuments();
                if (count > 0) {
                    console.log(`💡 Found it! Database "${dbInfo.name}" has ${count} orders.`);
                    // Let's update THIS database
                    const now = new Date();
                    const targetOrders = await tempDb.collection('orders').find({}).toArray();
                    for (let order of targetOrders) {
                        const monthOffset = Math.floor(Math.random() * 5);
                        const dayOffset = Math.floor(Math.random() * 28);
                        const newDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, dayOffset);
                        await tempDb.collection('orders').updateOne(
                            { _id: order._id },
                            { $set: { createdAt: newDate, updatedAt: newDate } }
                        );
                    }
                    console.log(`✅ Successfully updated ${count} orders in "${dbInfo.name}"`);
                }
            }
        } else {
            console.log(`📊 Found ${orders.length} orders in mens-ecommerce. Spreading dates...`);
            const now = new Date();
            for (let order of orders) {
                const monthOffset = Math.floor(Math.random() * 5);
                const dayOffset = Math.floor(Math.random() * 28);
                const newDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, dayOffset);

                await ordersCollection.updateOne(
                    { _id: order._id },
                    { $set: { createdAt: newDate, updatedAt: newDate } }
                );
            }
            console.log('✅ Done! Refresh your dashboard.');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fix();
