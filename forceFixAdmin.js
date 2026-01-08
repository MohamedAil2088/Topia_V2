const mongoose = require('mongoose');
const User = require('./src/models/User'); // Use the actual model!
const bcrypt = require('bcryptjs');
require('dotenv').config();

const forceFixAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Delete admin
        await User.deleteMany({ email: 'admin@topia.com' });
        console.log('🗑️  Deleted old admin');

        // 2. Create admin - sending PLAIN TEXT password
        // The pre('save') hook in User.js will handle the hashing!
        const admin = new User({
            name: 'Admin',
            email: 'admin@topia.com',
            password: 'admin123', // <--- Sending PLAIN TEXT
            role: 'admin',
            isEmailVerified: true
        });

        await admin.save();

        console.log('✅ New Admin Created');

        // 3. Test immediately 
        const user = await User.findOne({ email: 'admin@topia.com' }).select('+password');
        const isMatch = await bcrypt.compare('admin123', user.password);

        console.log('\n🧪 Immediate Verification:', isMatch ? '✅ SUCCESS' : '❌ FAILED');
        console.log('   Stored Hash:', user.password.substring(0, 15) + '...');

        mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

forceFixAdmin();
