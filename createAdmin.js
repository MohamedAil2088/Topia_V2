const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/topia-ecommerce')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

async function createAdminUser() {
    try {
        // Check if admin exists
        const existingAdmin = await User.findOne({ email: 'admin@topia.com' });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);

            // Update to admin if not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                existingAdmin.isAdmin = true;
                await existingAdmin.save();
                console.log('✅ Updated existing user to admin!');
            }
        } else {
            // Create new admin user
            const adminUser = await User.create({
                name: 'Admin',
                email: 'admin@topia.com',
                password: 'Topia@2025', // Will be hashed by pre-save hook
                phone: '01000000000',
                role: 'admin',
                isAdmin: true,
                isVerified: true
            });

            console.log('✅ Admin user created successfully!');
            console.log('📧 Email:', adminUser.email);
            console.log('🔑 Password: Topia@2025');
            console.log('👤 Role:', adminUser.role);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
}

createAdminUser();
