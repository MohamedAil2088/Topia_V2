const mongoose = require('mongoose');
const Product = require('./src/models/Product');
require('dotenv').config();

const enableCustomization = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        // FORCE set isCustomizable to all products for testing
        const result = await Product.updateMany(
            {},
            { $set: { isCustomizable: true } }
        );

        console.log(`UPDATE RESULT:`, result);

        if (result.matchedCount === 0) {
            // Maybe no products? Let's verify
            const count = await Product.countDocuments();
            console.log(`Inventory Count: ${count}`);

            if (count > 0) {
                console.log('Weird... products exist but update failed?');
            } else {
                console.log('❌ DATABASE IS EMPTY! Add products first.');
            }
        } else {
            console.log(`✅ Successfully enabled customization for ${result.modifiedCount} products!`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

enableCustomization();
