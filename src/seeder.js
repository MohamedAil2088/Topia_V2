const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');
const Order = require('./models/Order');
const connectDB = require('./config/database');

dotenv.config();

const importData = async () => {
    try {
        await connectDB();

        await Product.deleteMany();
        await Category.deleteMany();
        // await User.deleteMany(); // Keep users (admin)

        // Check for existing admin
        let adminUser = await User.findOne({ email: 'admin@tpia.com' });

        // Create admin if not exists (or update password logic could be added)
        if (!adminUser) {
            // Remove old default admin if exists
            await User.deleteOne({ email: 'admin@example.com' });

            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('0124008315M&m', salt);

            adminUser = await User.create({
                name: 'Super Admin',
                email: 'admin@tpia.com',
                phone: '01000000000',
                password: hashedPassword,
                isAdmin: true
            });
            console.log('Admin Created: admin@tpia.com / 0124008315M&m'.yellow.inverse);
        } else {
            // Optional: Update password for existing admin to ensure it matches
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            adminUser.password = await bcrypt.hash('0124008315M&m', salt);
            await adminUser.save();
            console.log('Admin Password Updated: admin@tpia.com'.blue.inverse);
        }

        // Create Categories
        const categories = await Category.insertMany([
            { name: 'Shirts', slug: 'shirts', description: 'Formal and casual shirts' },
            { name: 'Pants', slug: 'pants', description: 'Jeans, chinos, and trousers' },
            { name: 'Shoes', slug: 'shoes', description: 'Sneakers, boots, and formal shoes' },
            { name: 'Accessories', slug: 'accessories', description: 'Watches, belts, and wallets' },
        ]);

        const sampleProducts = [
            {
                name: 'Classic White Oxford Shirt',
                description: 'A timeless essential for every man’s wardrobe. Made from premium cotton.',
                price: 59.99,
                category: categories[0]._id,
                user: adminUser._id,
                images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
                stock: 50,
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['White'],
                isCustomizable: true,
            },
            {
                name: 'Navy Slim Fit Chinos',
                description: 'Versatile and comfortable chinos perfect for work or weekend.',
                price: 45.00,
                category: categories[1]._id,
                user: adminUser._id,
                images: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
                stock: 30,
                sizes: ['30', '32', '34', '36'],
                colors: ['Navy'],
            },
            {
                name: 'Leather Chelsea Boots',
                description: 'Handcrafted leather boots with durable sole.',
                price: 120.00,
                category: categories[2]._id,
                user: adminUser._id,
                images: ['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
                stock: 15,
                sizes: ['40', '41', '42', '43', '44'],
                colors: ['Brown', 'Black'],
            },
            {
                name: 'Denim Jacket',
                description: 'Rugged and stylish denim jacket in vintage wash.',
                price: 85.00,
                category: categories[0]._id, // Categorized as shirt/top for now or add Jackets
                user: adminUser._id,
                images: ['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
                stock: 20,
                sizes: ['M', 'L', 'XL'],
                colors: ['Blue'],
            },
            {
                name: 'Minimalist Leather Watch',
                description: 'Update your look with this sleek timepiece.',
                price: 150.00,
                category: categories[3]._id,
                user: adminUser._id,
                images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
                stock: 10,
                sizes: ['One Size'],
                colors: ['Silver', 'Black'],
            },
            {
                name: 'Striped Linen Shirt',
                description: 'Breathable linen shirt for hot summer days.',
                price: 49.99,
                category: categories[0]._id,
                user: adminUser._id,
                images: ['https://images.unsplash.com/photo-1550995878-1a74dcbe7267?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
                stock: 40,
                sizes: ['M', 'L'],
                colors: ['Striped'],
                isCustomizable: true,
            },
            {
                name: 'Dark Wash Slim Jeans',
                description: 'Premium denim with a perfect fit.',
                price: 65.00,
                category: categories[1]._id,
                user: adminUser._id,
                images: ['https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
                stock: 60,
                sizes: ['30', '32', '34'],
                colors: ['Dark Blue'],
            },
            {
                name: 'Casual Sneakers',
                description: 'Everyday comfort with modern style.',
                price: 75.00,
                category: categories[2]._id,
                user: adminUser._id,
                images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'],
                stock: 25,
                sizes: ['40', '41', '42', '43'],
                colors: ['White', 'Grey'],
            },
        ];

        const slugify = (text) => text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const productsWithSlugs = sampleProducts.map(p => ({
            ...p,
            slug: slugify(p.name)
        }));

        await Product.insertMany(productsWithSlugs);

        console.log('Data Imported!'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await connectDB();
        await Product.deleteMany();
        await Category.deleteMany();
        // await User.deleteMany();

        console.log('Data Destroyed!'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
