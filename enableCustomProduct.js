const mongoose = require('mongoose');
const Product = require('./src/models/Product');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/topia-ecommerce')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

async function enableCustomizationForFirstProduct() {
    try {
        // Get the first product
        const product = await Product.findOne();

        if (!product) {
            console.log('❌ No products found in database!');
            process.exit(1);
        }

        console.log('📦 Found product:', product.name);
        console.log('🆔 Product ID:', product._id);

        // Enable customization
        product.allowCustomization = true;
        product.customizationPricing = {
            frontPrint: 80,
            backPrint: 80,
            bothSides: 150,
            smallSize: 0,
            mediumSize: 20,
            largeSize: 40
        };

        await product.save();

        console.log('✅ Custom orders enabled successfully!');
        console.log('🎨 Product Name:', product.name);
        console.log('🔗 Product URL:', `http://localhost:5173/product/${product._id}`);
        console.log('\n💡 Now visit this URL to test custom orders!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

enableCustomizationForFirstProduct();
