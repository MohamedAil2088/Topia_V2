const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const spreadDates = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://localhost:27017/mens-ecommerce";
        await mongoose.connect(uri);

        // Direct collection access to be 100% sure
        const ordersCollection = mongoose.connection.db.collection('orders');
        const orders = await ordersCollection.find({}).toArray();

        if (orders.length === 0) {
            console.log('❌ Still no orders found.');
            process.exit();
        }

        console.log(`📊 Found ${orders.length} orders. Spreading dates...`);

        const now = new Date();
        for (let i = 0; i < orders.length; i++) {
            const monthOffset = Math.floor(Math.random() * 5);
            const dayOffset = Math.floor(Math.random() * 28);
            const newDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, dayOffset);

            await ordersCollection.updateOne(
                { _id: orders[i]._id },
                { $set: { createdAt: newDate, updatedAt: newDate } }
            );
        }

        console.log('✅ Success! Refresh your Dashboard now.');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

spreadDates();
