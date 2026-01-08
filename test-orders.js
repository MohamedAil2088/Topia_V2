const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Order = require('./src/models/Order');

const testOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ DB Connected');

        // Setup User & Product
        let user = await User.findOne({ email: 'order_user@test.com' });
        if (!user) {
            user = await User.create({
                name: 'Order User',
                email: 'order_user@test.com',
                password: 'password123',
                phone: '1234567890'
            });
        }

        // Login
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'order_user@test.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Get Admin Token (for updateOrderToDelivered)
        // Check existing admin
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            admin = await User.create({
                name: 'Admin Order',
                email: 'admin_order@test.com',
                password: 'password123',
                role: 'admin',
                phone: '123'
            });
        }
        const adminLoginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: admin.email,
            password: 'password123' // assuming simple password if we created it or we rely on make-admin
        });
        // Note: if Admin password is unknown (from previous tasks), we might fail here. 
        // I'll assume we can use the freshly created one or I'll create one if not exists with KNOWN password.
        // Actually, to be safe, I'll update admin password here if found? No.
        // I will rely on creating a NEW admin if needed or using the generic one I created in 'test-categories' if distinct.
        // Let's create a specific ADMIN for this test to avoid password mismatch.
        const adminConfig = { headers: { Authorization: `Bearer ${adminLoginRes.data.token}` } };


        // Create Dummy Product
        const product = await Product.create({
            name: `Order Product ${Date.now()}`,
            description: 'Desc',
            price: 50,
            category: new mongoose.Types.ObjectId(),
            user: admin._id,
            images: ['img.jpg'],
            stock: 100
        });

        // 1. Create Order
        console.log('\n🔄 Testing Create Order...');
        const orderData = {
            orderItems: [
                {
                    name: product.name,
                    qty: 2,
                    image: product.images[0],
                    price: product.price,
                    product: product._id
                }
            ],
            shippingAddress: {
                address: '123 Test St',
                city: 'Test City',
                postalCode: '12345',
                country: 'Test Country'
            },
            paymentMethod: 'PayPal',
            itemsPrice: 100,
            taxPrice: 10,
            shippingPrice: 5,
            totalPrice: 115
        };

        const orderRes = await axios.post('http://localhost:5000/api/orders', orderData, config);
        const orderId = orderRes.data.data._id;
        console.log(`✅ Order Created: ID ${orderId} - Total: ${orderRes.data.data.totalPrice}`);

        // 2. Get My Orders
        console.log('\n🔄 Testing Get My Orders...');
        const myOrders = await axios.get('http://localhost:5000/api/orders/myorders', config);
        console.log(`✅ My Orders Count: ${myOrders.data.data.length}`);

        // 3. Pay Order
        console.log('\n🔄 Testing Pay Order...');
        const payRes = await axios.put(`http://localhost:5000/api/orders/${orderId}/pay`, {
            id: 'PAYMENT_ID',
            status: 'COMPLETED',
            email_address: 'payer@test.com',
            update_time: Date.now()
        }, config);
        console.log(`✅ Order Paid: ${payRes.data.data.isPaid}`);

        // 4. Deliver Order (Admin)
        console.log('\n🔄 Testing Deliver Order (Admin)...');
        const deliverRes = await axios.put(`http://localhost:5000/api/orders/${orderId}/deliver`, {}, adminConfig);
        console.log(`✅ Order Delivered: ${deliverRes.data.data.isDelivered}`);

    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
    } finally {
        await mongoose.disconnect();
    }
};

testOrders();
