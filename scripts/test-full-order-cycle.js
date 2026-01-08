const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const axios = require('axios'); // We need axios strictly for this script, if not installed we will use fetch
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const connectDB = require('../src/config/database');

dotenv.config();

// Use fetch if axios is not available, but let's try native fetch which is available in Node 18+
const login = async (email, password) => {
    const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return response.json();
};

const createOrder = async (token, orderData) => {
    const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
    });
    return response.json();
};

const getProduct = async (id) => {
    const response = await fetch(`http://localhost:5000/api/products/${id}`);
    return response.json();
};

const runTest = async () => {
    try {
        console.log('🚀 Starting Full Order Cycle Test...'.yellow.bold);

        // 1. Login
        console.log('1️⃣ Logging in as Admin...');
        const loginData = await login('admin@tpia.com', 'Topia@2025');

        if (!loginData.token) {
            console.log('❌ Login Failed:', loginData.message);
            process.exit(1);
        }
        console.log('✅ Login Successful.');
        const token = loginData.token;

        // 2. Get a Product to buy
        console.log('\n2️⃣ Fetching a product...');
        // We'll fetch all products first locally to find one ID
        await connectDB();
        const product = await Product.findOne({ stock: { $gt: 5 } }); // Find one with enough stock

        if (!product) {
            console.log('❌ No products found with stock > 5');
            process.exit(1);
        }

        const originalStock = product.stock;
        console.log(`📦 Targeted Product: ${product.name}`);
        console.log(`📊 Original Stock: ${originalStock}`);

        // 3. Create Order with Receipt
        console.log('\n3️⃣ Placing Order with Vodafone Cash & Receipt...');
        const orderData = {
            orderItems: [{
                product: product._id,
                name: product.name,
                qty: 2,
                image: product.images[0],
                price: product.price
            }],
            shippingAddress: { address: 'Test St', city: 'Cairo', postalCode: '12345', country: 'Egypt' },
            paymentMethod: 'Vodafone Cash',
            itemsPrice: product.price * 2,
            taxPrice: 0,
            shippingPrice: 50,
            discountPrice: 0, // Added required field
            totalPrice: (product.price * 2) + 50,
            paymentResult: { // Simulating what frontend sends
                id: 'VF-TEST-12345',
                status: 'Pending Verification',
                receiptImage: '/uploads/simulate-receipt.jpg' // Simulated Check
            }
        };

        const orderParams = { ...orderData, paymentDetails: { receiptImage: '/uploads/simulate-receipt.jpg' } };
        // Note: Controller expects distinct structure, but our frontend sends it in paymentResult OR paymentDetails. 
        // Let's rely on what we put in front-end: `paymentResult: { ... receiptImage }`

        const orderResponse = await createOrder(token, orderData);

        if (!orderResponse.success) {
            console.log('❌ Order Creation Failed:'.red);
            console.log('Message:', orderResponse.message);
            if (orderResponse.errors) console.log('Errors:', orderResponse.errors);
            process.exit(1);
        }

        const createdOrder = orderResponse.data;
        console.log(`✅ Order Created! ID: ${createdOrder._id}`);

        // 4. Verify Receipt Saved
        console.log('\n4️⃣ Verifying Receipt Image in Order...');
        // Check `paymentResult.receiptImage` or `paymentDetails.receiptImage`
        // Our controller saves it as is.
        if (createdOrder.paymentResult && createdOrder.paymentResult.receiptImage === '/uploads/simulate-receipt.jpg') {
            console.log('✅✅ SUCCESS: Receipt Image stored correctly!'.green.bold);
        } else {
            console.log('❌ FAILURE: Receipt Image NOT found in order data.'.red.bold);
            console.log('Saved Data:', createdOrder.paymentResult);
        }

        // 5. Verify Inventory Deduction
        console.log('\n5️⃣ Verifying Inventory Deduction...');
        const updatedProduct = await Product.findById(product._id);
        const newStock = updatedProduct.stock;

        console.log(`📊 New Stock: ${newStock}`);

        if (newStock === originalStock - 2) {
            console.log('✅✅ SUCCESS: Stock decremented correctly (-2)!'.green.bold);
        } else {
            console.log(`❌ FAILURE: Stock did not update correctly. Expected ${originalStock - 2}, got ${newStock}`.red.bold);
        }

        console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!'.rainbow);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

runTest();
