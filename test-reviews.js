const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Review = require('./src/models/Review');

const testReviews = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ DB Connected');

        // Create Seller
        const sellerEmail = `seller${Date.now()}@test.com`;
        const seller = await User.create({
            name: 'Seller',
            email: sellerEmail,
            password: 'password123',
            phone: '123'
        });

        // Create Product related to seller
        // We need a category ID, let's fake one or get one
        const catId = new mongoose.Types.ObjectId();

        const product = await Product.create({
            name: `Reviewable Prod ${Date.now()}`,
            description: 'Test Desc',
            price: 100,
            category: catId,
            user: seller._id,
            images: ['img.jpg'],
            stock: 10,
            sizes: ['M'],
            colors: ['Red']
        });
        console.log(`✅ Created Product: ${product.name}`);

        // Create Reviewer
        const reviewerEmail = `reviewer${Date.now()}@test.com`;
        const reviewer = await User.create({
            name: 'Reviewer',
            email: reviewerEmail,
            password: 'password123',
            phone: '123'
        });

        // Login Reviewer
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: reviewerEmail,
            password: 'password123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Add Review
        console.log('\n🔄 Testing Add Review...');
        const reviewData = {
            rating: 4,
            comment: 'Great product, loved it!'
        };

        const reviewRes = await axios.post(`http://localhost:5000/api/products/${product._id}/reviews`, reviewData, config);
        console.log('✅ Review Added:', reviewRes.data.data.comment);

        // 3. Get Reviews
        console.log('\n🔄 Testing Get Reviews...');
        const getRes = await axios.get(`http://localhost:5000/api/products/${product._id}/reviews`);
        console.log(`✅ Reviews Count: ${getRes.data.count}`);

        // 4. Verify Product Rating Update
        const updatedProduct = await Product.findById(product._id);
        console.log(`✅ Updated Product Rating: ${updatedProduct.rating}`); // Should be 4
        console.log(`✅ Updated Num Reviews: ${updatedProduct.numReviews}`); // Should be 1

        // 5. Delete Review
        const reviewId = reviewRes.data.data._id;
        console.log('\n🔄 Testing Delete Review...');
        // We need to match the route we defined. 
        // In server.js we added: app.use('/api/reviews', require('./routes/reviewRoutes'));
        // In reviewRoutes.js we have: router.route('/:id').delete(...)
        // So /api/reviews/:id should work.
        await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, config);
        console.log('✅ Review Deleted');

        // Check rating again
        const reUpdatedProduct = await Product.findById(product._id);
        console.log(`✅ Re-Updated Product Rating: ${reUpdatedProduct.rating}`); // Should be 0
        console.log(`✅ Re-Updated Num Reviews: ${reUpdatedProduct.numReviews}`); // Should be 0

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    } finally {
        await mongoose.disconnect();
    }
};

testReviews();
