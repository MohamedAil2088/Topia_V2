const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const User = require('./src/models/User');
// Define temporary Category schema if model doesn't exist or just use mongoose.model
const CategorySchema = new mongoose.Schema({ name: String, user: mongoose.Schema.Types.ObjectId });
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

require('dotenv').config();

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        const admin = await User.findOne({ email: 'admin@topia.com' });
        if (!admin) process.exit(1);

        // 1. Create/Find Category
        let category = await Category.findOne({ name: 'General' });
        if (!category) {
            category = await Category.create({ name: 'General', user: admin._id });
        }

        const products = [
            {
                name: 'Custom T-Shirt',
                description: 'High quality cotton',
                price: 200,
                category: category._id,
                stock: 100,
                images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
                user: admin._id,
                isCustomizable: true
            },
            {
                name: 'Custom Hoodie',
                description: 'Winter hoodie',
                price: 400,
                category: category._id,
                stock: 50,
                images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
                user: admin._id,
                isCustomizable: true
            }
        ];

        await Product.deleteMany({});
        await Product.insertMany(products);

        console.log('🎉 Seeded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

seedProducts();
