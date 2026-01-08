const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Simple User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    isEmailVerified: Boolean
});

const User = mongoose.model('User', UserSchema);

const createSimpleAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        // Delete old admin
        await User.deleteMany({ email: 'admin@topia.com' });
        console.log('🗑️  Deleted old accounts');

        // Create simple hash
        const hash = await bcrypt.hash('admin123', 10);

        // Create admin
        const admin = new User({
            name: 'Admin',
            email: 'admin@topia.com',
            password: hash,
            role: 'admin',
            isEmailVerified: true
        });

        await admin.save();

        console.log('\n✅ Admin created!');
        console.log('📧 Email: admin@topia.com');
        console.log('🔑 Password: admin123');

        // Test immediately
        const testUser = await User.findOne({ email: 'admin@topia.com' });
        const isValid = await bcrypt.compare('admin123', testUser.password);
        console.log('🧪 Password test:', isValid ? '✅ WORKS' : '❌ FAILED');

        mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createSimpleAdmin();
