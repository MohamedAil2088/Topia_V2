const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    isEmailVerified: Boolean,
    points: Number,
    tier: String
});

const User = mongoose.model('User', UserSchema);

const recreateAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // 1. Delete ALL admin accounts
        const deleted = await User.deleteMany({ email: 'admin@topia.com' });
        console.log(`🗑️  Deleted ${deleted.deletedCount} old admin account(s)\n`);

        // 2. Create fresh password hash
        console.log('🔐 Creating password hash...');
        const password = 'admin123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('✅ Password hashed successfully\n');

        // 3. Create new admin
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@topia.com',
            password: hashedPassword,
            role: 'admin',
            isEmailVerified: true,
            points: 0,
            tier: 'Bronze'
        });

        console.log('✅ NEW ADMIN CREATED!\n');
        console.log('📋 Details:');
        console.log('   ID:', admin._id);
        console.log('   Name:', admin.name);
        console.log('   Email:', admin.email);
        console.log('   Role:', admin.role);
        console.log('   Password:', password);

        // 4. VERIFY password works
        console.log('\n🧪 Testing password...');
        const testUser = await User.findOne({ email: 'admin@topia.com' });
        const isValid = await bcrypt.compare(password, testUser.password);

        if (isValid) {
            console.log('✅ PASSWORD TEST: SUCCESS! ✅\n');
            console.log('🎉 You can now login with:');
            console.log('   📧 Email: admin@topia.com');
            console.log('   🔑 Password: admin123\n');
        } else {
            console.log('❌ PASSWORD TEST: FAILED!\n');
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

recreateAdmin();
