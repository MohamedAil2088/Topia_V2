const mongoose = require('mongoose');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    isEmailVerified: Boolean
});

const User = mongoose.model('User', UserSchema);

const fixAdminRole = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        // Update admin role
        const result = await User.updateOne(
            { email: 'admin@topia.com' },
            { $set: { role: 'admin' } }
        );

        console.log('🔧 Update result:', result);

        // Verify
        const user = await User.findOne({ email: 'admin@topia.com' });
        console.log('\n✅ Admin user:');
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        console.log('   Name:', user.name);

        mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

fixAdminRole();
