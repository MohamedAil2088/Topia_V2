const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Product = require('./src/models/Product');

const testManualPayment = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ DB Connected');

        // Setup User
        let user = await User.findOne({ email: 'manual_pay@test.com' });
        if (!user) {
            user = await User.create({
                name: 'Manual Payer',
                email: 'manual_pay@test.com',
                password: 'password123',
                phone: '01000000000'
            });
        }

        // Login
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'manual_pay@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };


        // Create Dummy Product
        const product = await Product.create({
            name: `Manual Pay Prod ${Date.now()}`,
            description: 'Desc',
            price: 200,
            category: new mongoose.Types.ObjectId(),
            user: user._id, // Owner doesn't matter much here
            images: ['img.jpg'],
            stock: 10
        });

        // Create Order with Vodafone Cash
        console.log('\n🔄 Testing Vodafone Cash Order...');
        const orderData = {
            orderItems: [
                {
                    name: product.name,
                    qty: 1,
                    image: product.images[0],
                    price: product.price,
                    product: product._id
                }
            ],
            shippingAddress: {
                address: 'Giza', city: 'Giza', postalCode: '123', country: 'Egypt'
            },
            paymentMethod: 'VodafoneCash',
            paymentDetails: {
                walletNumber: '01012345678',
                transactionId: 'TXN_999888777'
            },
            itemsPrice: 200,
            taxPrice: 0,
            shippingPrice: 20,
            totalPrice: 220
        };

        const orderRes = await axios.post('http://localhost:5000/api/orders', orderData, config);
        const order = orderRes.data.data;

        console.log(`✅ Order Created: ID ${order._id}`);
        console.log(`✅ Payment Method: ${order.paymentMethod}`);
        console.log(`✅ Wallet Number: ${order.paymentDetails.walletNumber}`);
        console.log(`✅ Transaction ID: ${order.paymentDetails.transactionId}`);
        console.log(`✅ Payment Status (isPaid): ${order.isPaid}`); // Should be false initially for manual payment

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    } finally {
        await mongoose.disconnect();
    }
};

testManualPayment();
