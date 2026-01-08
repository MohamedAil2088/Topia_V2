const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Coupon = require('./src/models/Coupon');
const connectDB = require('./src/config/database');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const checkOrCreateCoupon = async () => {
    try {
        await connectDB();

        const code = 'MOALI';
        const coupon = await Coupon.findOne({ code });

        if (coupon) {
            console.log(`Coupon ${code} already exists:`, coupon);
        } else {
            console.log(`Coupon ${code} does not exist. Creating it...`);
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Valid for 1 year

            const newCoupon = await Coupon.create({
                code,
                discount: 20, // 20% discount
                expiryDate,
                isActive: true
            });
            console.log('Coupon Created:', newCoupon);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkOrCreateCoupon();
