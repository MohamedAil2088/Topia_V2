const mongoose = require('mongoose');
require('dotenv').config();

// تعريف Schema "متساهلة" عشان نتجاوز أي Validation errors
// strict: false بيخلينا نقدر نعدل أي حقل حتى لو مش متعرف
const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

const forceUpdate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to Database');

        // تحديث كل المنتجات لتكون قابلة للتخصيص
        const result = await Product.updateMany(
            {},
            {
                $set: {
                    isCustomizable: true,
                    // بنضيف أسعار افتراضية كمان عشان ميعملش مشاكل
                    customizationPricing: {
                        frontPrint: 50,
                        backPrint: 50,
                        bothSides: 90
                    }
                }
            }
        );

        console.log('------------------------------------------------');
        console.log(`🎉 Success! Updated ${result.modifiedCount} products.`);
        console.log('------------------------------------------------');

        // التأكد من العدد الكلي
        const count = await Product.countDocuments();
        console.log(`📊 Total Products in DB: ${count}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

forceUpdate();
