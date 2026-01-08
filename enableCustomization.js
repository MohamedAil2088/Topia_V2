const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

const enableCustomization = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Enable customization for the first 3 products
        const result = await Product.updateMany(
            {},
            {
                $set: {
                    allowCustomization: true,
                    customizationPricing: {
                        frontPrint: 80,
                        backPrint: 80,
                        bothSides: 150,
                        smallSize: 0,
                        mediumSize: 20,
                        largeSize: 40
                    }
                }
            },
            { limit: 3 }
        );

        console.log(`✅ Enabled customization for ${result.modifiedCount} products`);

        // Show updated products
        const products = await Product.find({ allowCustomization: true }).select('name allowCustomization');
        console.log('\n📦 Products with customization enabled:');
        products.forEach(p => console.log(`  - ${p.name}`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

enableCustomization();
