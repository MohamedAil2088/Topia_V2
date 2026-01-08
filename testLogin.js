const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Find admin user
        const user = await User.findOne({ email: 'admin@topia.com' });

        if (!user) {
            console.log('❌ Admin user not found!');
            process.exit(1);
        }

        console.log('\n📋 User found:');
        console.log('   Email:', user.email);
        console.log('   Name:', user.name);
        console.log('   Role:', user.role);
        console.log('   Password Hash:', user.password.substring(0, 20) + '...');

        // Test password
        const testPassword = 'admin123';
        const isMatch = await bcrypt.compare(testPassword, user.password);

        console.log('\n🔐 Password Test:');
        console.log('   Testing password:', testPassword);
        console.log('   Match result:', isMatch ? '✅ CORRECT' : '❌ WRONG');

        if (!isMatch) {
            console.log('\n⚠️  Password does not match! Recreating admin...');

            // Delete and recreate
            await User.deleteOne({ email: 'admin@topia.com' });

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            await User.create({
                name: 'Admin',
                email: 'admin@topia.com',
                password: hashedPassword,
                role: 'admin',
                isEmailVerified: true
            });

            console.log('✅ Admin recreated with password: admin123');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testLogin();
