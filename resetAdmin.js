const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Delete existing admin
        await User.deleteOne({ email: 'admin@topia.com' });
        console.log('🗑️  Deleted old admin account');

        // Create new admin with known password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = await User.create({
            name: 'Admin',
            email: 'admin@topia.com',
            password: hashedPassword,
            role: 'admin',
            isEmailVerified: true
        });

        console.log('\n✅ New Admin account created successfully!');
        console.log('📧 Email: admin@topia.com');
        console.log('🔑 Password: admin123');
        console.log('👤 Role: admin');
        console.log('\n🎉 You can now login with these credentials!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

resetAdmin();
