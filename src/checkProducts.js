const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({});
        console.log(`\n📦 Total Products: ${products.length}\n`);

        if (products.length > 0) {
            products.forEach((p, i) => {
                console.log(`${i + 1}. ${p.name} - $${p.price} - Stock: ${p.stock}`);
            });
        } else {
            console.log('⚠️  No products found in database!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

checkProducts();
