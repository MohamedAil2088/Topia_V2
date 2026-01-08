const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

const testUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ DB Connected');

        // Create User
        const email = `profile_test_${Date.now()}@test.com`;
        const user = await User.create({
            name: 'Original Name',
            email: email,
            password: 'oldpassword',
            phone: '123'
        });

        // Login
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: email,
            password: 'oldpassword'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. Get Profile
        console.log('\n🔄 Testing Get Profile...');
        const profileRes = await axios.get('http://localhost:5000/api/users/profile', config);
        console.log(`✅ Name: ${profileRes.data.data.name}`);

        // 2. Update Profile (Name & Phone)
        console.log('\n🔄 Testing Update Profile...');
        const updateRes = await axios.put('http://localhost:5000/api/users/profile', {
            name: 'Updated Name',
            phone: '999'
        }, config);
        console.log(`✅ Updated Name: ${updateRes.data.data.name}`);

        // 3. Update Password
        console.log('\n🔄 Testing Update Password...');
        await axios.put('http://localhost:5000/api/users/profile', {
            password: 'newpassword'
        }, config);
        console.log('✅ Password Updated');

        // 4. Test Add Address
        console.log('\n🔄 Testing Add Address...');
        const addrRes = await axios.post('http://localhost:5000/api/users/address', {
            street: '123 Test St',
            city: 'Cairo',
            country: 'Egypt'
        }, config);
        console.log(`✅ Address Added, Total: ${addrRes.data.data.length}`);

        // 5. Test Wishlist
        // Need a product ID. Let's create a fake one using Mongoose ID or fetch one.
        const fakeProductId = new mongoose.Types.ObjectId();

        console.log('\n🔄 Testing Add to Wishlist...');
        await axios.post(`http://localhost:5000/api/users/wishlist/${fakeProductId}`, {}, config);
        console.log('✅ Added to Wishlist');

        console.log('\n🔄 Testing Get Wishlist...');
        const wishRes = await axios.get('http://localhost:5000/api/users/wishlist', config);
        console.log(`✅ Wishlist Count: ${wishRes.data.data.length}`);

        console.log('\n🔄 Testing Remove from Wishlist...');
        await axios.delete(`http://localhost:5000/api/users/wishlist/${fakeProductId}`, config);
        console.log('✅ Removed from Wishlist');


    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    } finally {
        await mongoose.disconnect();
    }
};

testUsers();
