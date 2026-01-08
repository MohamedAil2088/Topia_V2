const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// نحتاج لتعريف User Schema هنا أو استيراده، لكن لتبسيط السكريبت وعدم الاعتماد على ملفات المشروع
// سأستخدم استدعاء API عادي، لكن سأحتاج لتوكن أدمن.

// الحل: سكريبت واحد يقوم بكل شيء:
// 1. يتصل بـ DB.
// 2. ينشئ مستخدم ويجعله أدمن.
// 3. يولد له توكن (أو يسجل دخول).
// 4. يختبر الـ Categories API.

const User = require('./src/models/User'); // مفترض المسار صحيح
const generateToken = require('./src/utils/generateToken');

const testCategories = async () => {
    try {
        // 1. Connect to DB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ DB Connected');

        // 2. Create Admin User
        await User.deleteMany({ email: 'admin@test.com' }); // cleanup
        const adminUser = await User.create({
            name: 'Super Admin',
            email: 'admin@test.com',
            password: 'password123', // سيتم تشفيرها
            phone: '1234567890',
            role: 'admin'
        });
        console.log('✅ Admin Created');

        // 3. Login (Get Token) - أو نستطيع توليده مباشرة بما أننا نملك الـ ID
        // للتجربة الحقيقية، سنسجل دخول عبر API
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('✅ Admin Token Received');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 4. Test Create Category
        console.log('\n🔄 Testing Create Category...');
        const catRes = await axios.post('http://localhost:5000/api/categories', {
            name: 'Jackets',
            description: 'Men Jackets'
        }, config);
        console.log('✅ Category Created:', catRes.data.data.name);
        const catId = catRes.data.data._id;

        // 5. Test Get All
        console.log('\n🔄 Testing Get All Categories...');
        const getAllRes = await axios.get('http://localhost:5000/api/categories');
        console.log('✅ Categories Count:', getAllRes.data.count);

        // 6. Test Update
        console.log('\n🔄 Testing Update Category...');
        const updateRes = await axios.put(`http://localhost:5000/api/categories/${catId}`, {
            name: 'Winter Jackets'
        }, config);
        console.log('✅ Category Updated:', updateRes.data.data.name);

        // 7. Test Delete
        console.log('\n🔄 Testing Delete Category...');
        await axios.delete(`http://localhost:5000/api/categories/${catId}`, config);
        console.log('✅ Category Deleted');


    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    } finally {
        await mongoose.disconnect();
    }
};

testCategories();
