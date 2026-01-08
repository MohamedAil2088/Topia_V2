const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category') || mongoose.model('Category', new mongoose.Schema({ name: String, user: mongoose.Schema.Types.ObjectId }));
const User = require('./src/models/User');
require('dotenv').config();

const resetAndSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        // 1. Get Admin User
        const admin = await User.findOne({ email: 'admin@topia.com' });
        if (!admin) {
            console.log('❌ Admin not found! Please run recreateAdmin.js first.');
            process.exit(1);
        }

        // 2. Clean DB
        await Product.deleteMany({});
        await Category.deleteMany({});
        console.log('🗑️  Cleaned old data');

        // 3. Create Category
        const shirtCategory = await Category.create({
            name: 'T-Shirts',
            user: admin._id
        });
        console.log('✅ Created Category: T-Shirts');

        // 4. Create Products
        const products = [
            {
                name: 'Custom Premium T-Shirt',
                description: 'High quality cotton t-shirt ready for your custom design.',
                price: 299,
                category: shirtCategory._id,
                stock: 100,
                images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
                user: admin._id,
                isCustomizable: true // The Magic Field
            },
            {
                name: 'Classic Hoodie',
                description: 'Warm, cozy and stylish.',
                price: 599,
                category: shirtCategory._id,
                stock: 50,
                images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'],
                user: admin._id,
                isCustomizable: true // The Magic Field
            }
        ];

        await Product.insertMany(products);
        console.log(`✅ Seeded ${products.length} products with isCustomizable: true`);

        // 5. Verify
        const count = await Product.countDocuments({ isCustomizable: true });
        console.log(`🔍 Verification check: Found ${count} customizable products in DB.`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetAndSeed();
