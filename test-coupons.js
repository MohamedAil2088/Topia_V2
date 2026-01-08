const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Coupon = require('./src/models/Coupon');

const testCoupons = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ DB Connected');

        // Setup Admin User
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            admin = await User.create({
                name: 'Admin Coupon',
                email: 'admin_coupon@test.com',
                password: 'password123',
                role: 'admin',
                phone: '010'
            });
        }

        // Login Admin
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: admin.email,
            password: 'password123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };


        // 1. Create Coupon
        console.log('\n🔄 Testing Create Coupon...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const couponData = {
            code: 'SAVE20',
            discount: 20,
            expiryDate: tomorrow
        };

        // Try deleting if exists first to avoid duplicate error in test
        await Coupon.deleteOne({ code: 'SAVE20' });

        const createRes = await axios.post('http://localhost:5000/api/coupons', couponData, config);
        console.log(`✅ Coupon Created: ${createRes.data.data.code} (${createRes.data.data.discount}%)`);

        // 2. Validate Coupon (Valid)
        console.log('\n🔄 Testing Validate Coupon (Valid)...');
        const validRes = await axios.post('http://localhost:5000/api/coupons/validate', { code: 'save20' }); // Lowercase test
        console.log(`✅ Coupon Validated: ${validRes.data.success}`);

        // 3. Create Expired Coupon
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        // Use Mongoose directly to create expired one (API might validate date in future)
        // Actually lets use API if we didn't put restriction on past date creation
        // But safer to create directly for test case setup
        const expiredCoupon = await Coupon.create({
            code: 'EXPIRED10',
            discount: 10,
            expiryDate: yesterday
        });
        console.log(`\n✅ Created Expired Coupon: ${expiredCoupon.code}`);

        // 4. Validate Coupon (Expired)
        console.log('\n🔄 Testing Validate Coupon (Expired)...');
        try {
            await axios.post('http://localhost:5000/api/coupons/validate', { code: 'EXPIRED10' });
        } catch (error) {
            console.log(`✅ Expected Error: ${error.response.data.message}`);
        }

        // 5. Delete Coupon
        console.log('\n🔄 Testing Delete Coupon...');
        await axios.delete(`http://localhost:5000/api/coupons/${createRes.data.data._id}`, config);
        console.log('✅ Coupon Deleted');
        await Coupon.deleteOne({ code: 'EXPIRED10' }); // Cleanup

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    } finally {
        await mongoose.disconnect();
    }
};

testCoupons();
