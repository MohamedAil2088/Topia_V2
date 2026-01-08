const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Category = require('./src/models/Category');

const testProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ DB Connected');

        // 1. Setup Data (Admin & Category)
        const adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('❌ Create an admin user first!');
            process.exit(1);
        }

        // Login to get token
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: adminUser.email,
            password: 'password123' // Assuming password
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        let category = await Category.findOne({ name: 'T-Shirts' });
        if (!category) {
            const catRes = await axios.post('http://localhost:5000/api/categories', {
                name: 'T-Shirts',
                description: 'Cotton T-Shirts'
            }, config);
            category = catRes.data.data;
        }
        console.log(`✅ Using Category: ${category.name}`);

        // 2. Create Product
        console.log('\n🔄 Testing Create Product...');
        const productData = {
            name: 'Classic White T-Shirt',
            description: '100% Cotton, High Quality',
            price: 19.99,
            category: category._id,
            sizes: ['S', 'M', 'L'],
            colors: ['White', 'Black'],
            stock: 100,
            images: ['image1.jpg']
        };

        const prodRes = await axios.post('http://localhost:5000/api/products', productData, config);
        console.log('✅ Product Created:', prodRes.data.data.name);
        const prodId = prodRes.data.data._id;

        // 3. Get All Products
        console.log('\n🔄 Testing Get All Products...');
        const getAllRes = await axios.get('http://localhost:5000/api/products');
        console.log('✅ Products Count:', getAllRes.data.count);

        // 4. Update Product
        console.log('\n🔄 Testing Update Product...');
        const updateRes = await axios.put(`http://localhost:5000/api/products/${prodId}`, {
            price: 24.99,
            stock: 90
        }, config);
        console.log(`✅ Product Updated: Price ${updateRes.data.data.price}`);

        // 5. Delete Product
        console.log('\n🔄 Testing Delete Product...');
        await axios.delete(`http://localhost:5000/api/products/${prodId}`, config);
        console.log('✅ Product Deleted');

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    } finally {
        await mongoose.disconnect();
    }
};

testProducts();
