const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const debugDb = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://localhost:27017/mens-ecommerce";
        console.log('🔍 Connecting to:', uri);
        await mongoose.connect(uri);

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('DB Name:', mongoose.connection.name);
        console.log('Collections:', collections.map(c => c.name));

        for (let col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(` - ${col.name}: ${count} docs`);
            if (col.name === 'orders' && count > 0) {
                const sample = await db.collection(col.name).findOne();
                console.log('   Sample Order Date:', sample.createdAt);
            }
        }

        process.exit();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

debugDb();
