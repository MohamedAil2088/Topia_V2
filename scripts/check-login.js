const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../src/models/User');
const connectDB = require('../src/config/database');

dotenv.config();

const checkLogin = async () => {
    try {
        const conn = await connectDB();
        // Database name is logged by connectDB

        const email = 'admin@tpia.com';
        const password = 'Topia@2025';

        console.log(`🔍 Checking user: ${email}`);

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('❌ User not found!'.red.bold);
            process.exit(1);
        }

        console.log('✅ User found in DB.');

        if (!user.password) {
            console.log('❌ Password field is MISSING! Fixing...'.red.bold);
            user.password = password; // Set plain text, let pre-save hook hash it
            await user.save();
            console.log('✅ Password saved properly.'.green.bold);
            process.exit();
        }

        console.log(`🔐 Stored Hash: ${user.password.substring(0, 10)}...`);

        // Use the model's method to check password
        const isMatch = await user.matchPassword(password);

        if (isMatch) {
            console.log('✅✅ Password MATCHES! Login should work.'.green.bold);
            if (user.isAdmin) {
                console.log('👑 User is correctly marked as ADMIN.'.blue.bold);
            } else {
                console.log('⚠️ User is found but NOT admin.'.yellow.bold);
            }
        } else {
            console.log('❌❌ Password DOES NOT match (Likely Double Hashed).'.red.bold);
            console.log('Fixing now...');

            // Force Update with PLAIN TEXT
            // This triggers 'pre save' which hashes it ONCE.
            user.password = password;
            await user.save();
            console.log('🔄 Password forcibly updated correctly. Try logging in now.'.cyan.bold);
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`.red);
        process.exit(1);
    }
};

checkLogin();
