const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ Connected to Database: ${mongoose.connection.name}`);

        const collections = await mongoose.connection.db.listCollections().toArray();

        console.log('\n📊 Existing Collections (Tables):');
        if (collections.length === 0) {
            console.log(' - No collections found (Empty DB)');
        } else {
            collections.forEach(col => {
                console.log(` - 📂 ${col.name}`);
            });
        }

        console.log('\nℹ️ Note: In MongoDB, "Tables" are called "Collections".');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDB();
