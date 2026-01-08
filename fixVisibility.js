const mongoose = require('mongoose');
require('dotenv').config();

// Schema مرنة
const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

const fixVisibility = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        // تحديث كل المنتجات التي ليس لها قيمة في isCustomizable (أو قيمتها ليست true)
        const result = await Product.updateMany(
            { isCustomizable: { $ne: true } }, // أي منتج مش true
            { $set: { isCustomizable: false } } // خليه false صريح
        );

        console.log(`🎉 Fixed visibility for ${result.modifiedCount} products!`);
        console.log('Now they should appear in New Arrivals & Best Sellers.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixVisibility();
