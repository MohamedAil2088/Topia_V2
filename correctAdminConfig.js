const mongoose = require('mongoose');
const User = require('./src/models/User'); // Use the actual model!
require('dotenv').config();

const fixDoubleHashing = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Delete admin
        await User.deleteMany({ email: 'admin@topia.com' });
        console.log('🗑️  Deleted old admin');

        // 2. Create admin with PLAIN TEXT password
        // The pre('save') hook in User.js will handle the hashing!
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@topia.com',
            password: 'admin123', // <--- Sending PLAIN TEXT
            role: 'admin',
            isEmailVerified: true
        });

        console.log('✅ Admin created with PLAIN TEXT password (letting model hash it)');
        console.log('📧 Email: admin@topia.com');
        console.log('🔑 Password: admin123');

        // 3. Test immediately with the REAL model method
        const user = await User.findOne({ email: 'admin@topia.com' }).select('+password');
        const isMatch = await user.matchPassword('admin123');

        console.log('\n🧪 Verification using model matchPassword():', isMatch ? '✅ SUCCESS' : '❌ FAILED');

        mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixDoubleHashing();
