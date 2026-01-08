const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const makeAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to DB');

        // العثور على أول مستخدم وجعله أدمن
        const user = await User.findOne();
        if (user) {
            user.role = 'admin';
            await user.save();
            console.log(`✅ User ${user.name} is now an ADMIN`);
        } else {
            console.log('❌ No users found to make admin');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

makeAdmin();
