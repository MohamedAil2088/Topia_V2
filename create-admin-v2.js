const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri).then(async () => {
    console.log("✅ Connected. Creating CORRECT admin user...");

    // We need to match the schema definition for role
    const userSchema = new mongoose.Schema({
        name: String,
        email: String,
        password: String,
        isAdmin: Boolean,
        role: { type: String, default: 'user' } // Added role
    });

    const User = mongoose.model('User', userSchema);

    // Delete old admin
    await User.deleteOne({ email: 'super@tpia.com' });

    // Hash simple password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Create new admin with BOTH isAdmin and role
    await User.create({
        name: 'Super Manager',
        email: 'super@tpia.com',
        password: hashedPassword,
        isAdmin: true,
        role: 'admin' // CRITICAL FIX
    });

    console.log("\n🚀 user: super@tpia.com");
    console.log("🔑 pass: 123456");
    console.log("\n✅ User Created Successfully with ROLE: ADMIN! Try login now.");
    process.exit();
}).catch(err => console.log(err));
