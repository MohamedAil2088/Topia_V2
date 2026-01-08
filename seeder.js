const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Order = require('./src/models/Order');
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');
const connectDB = require('./src/config/database');

dotenv.config();
connectDB();

const createSlug = (name) => {
    return name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
};

const importData = async () => {
    try {
        // Clean old data
        await Order.deleteMany();
        await Product.deleteMany();
        await Category.deleteMany();
        await User.deleteMany();

        // 1. Create Users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('123456', salt);

        const createdUsers = await User.insertMany([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                phone: '01000000000',
                password: hashedPassword,
                role: 'admin', // Correct field name
            },
            {
                name: 'John Doe',
                email: 'user@example.com',
                phone: '01200000000',
                password: hashedPassword,
                role: 'user',
            },
        ]);

        const adminUser = createdUsers[0]._id;

        // 2. Create Categories with slugs
        const categories = await Category.insertMany([
            { name: 'T-Shirts', slug: 't-shirts', description: 'Comfortable cotton t-shirts' },
            { name: 'Jackets', slug: 'jackets', description: 'Winter and denim jackets' },
            { name: 'Shoes', slug: 'shoes', description: 'Running and casual shoes' },
            { name: 'Hoodies', slug: 'hoodies', description: 'Warm hoodies' },
            { name: 'Jeans', slug: 'jeans', description: 'Stylish denim jeans' },
            { name: 'Accessories', slug: 'accessories', description: 'Caps, bags, and more' },
        ]);

        const catMap = {};
        categories.forEach(c => {
            catMap[c.name] = c._id;
        });

        // 3. Create Products with slugs
        const products = [
            {
                name: 'Classic White T-Shirt',
                description: 'A comfortable and stylish white t-shirt made from 100% cotton.',
                price: 29.99,
                countInStock: 50,
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                category: catMap['T-Shirts'],
                user: adminUser,
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['White', 'Black']
            },
            {
                name: 'Denim Jacket',
                description: 'Classic blue denim jacket, perfect for casual outings.',
                price: 89.99,
                countInStock: 20,
                image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                category: catMap['Jackets'],
                user: adminUser,
                sizes: ['M', 'L', 'XL'],
                colors: ['Blue']
            },
            {
                name: 'Running Shoes',
                description: 'High-performance running shoes with breathable mesh.',
                price: 119.99,
                countInStock: 15,
                image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                category: catMap['Shoes'],
                user: adminUser,
                sizes: ['40', '41', '42', '43', '44'],
                colors: ['Red', 'Black']
            },
            {
                name: 'Casual Hoodie',
                description: 'Warm and cozy hoodie for chilly days.',
                price: 59.99,
                countInStock: 30,
                image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                category: catMap['Hoodies'],
                user: adminUser,
                sizes: ['S', 'M', 'L'],
                colors: ['Grey', 'Navy']
            }
        ].map(p => ({ ...p, slug: createSlug(p.name) }));

        await Product.insertMany(products);

        console.log('✅ Data Imported Successfully with Correct Admin Role!');
        process.exit();
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
