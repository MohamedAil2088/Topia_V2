const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri).then(async () => {
    console.log("✅ Connected. Creating simple admin user...");

    // Define minimal User schema
    const User = mongoose.model('User', new mongoose.Schema({
        name: String, email: String, password: String, isAdmin: Boolean
    }));

    // Delete old admin if exists
    await User.deleteOne({ email: 'super@tpia.com' });

    // Hash simple password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Create new admin
    await User.create({
        name: 'Super Manager',
        email: 'super@tpia.com',
        password: hashedPassword,
        isAdmin: true
    });

    console.log("\n🚀 user: super@tpia.com");
    console.log("🔑 pass: 123456");
    console.log("\n✅ User Created Successfully! Try login now.");
    process.exit();
}).catch(err => console.log(err));
