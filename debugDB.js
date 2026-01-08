const mongoose = require('mongoose');
require('dotenv').config();

// Schema مرنة للقراءة
const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

const debugProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected');

        const products = await Product.find({});
        console.log(`📊 Total Products: ${products.length}`);

        products.forEach(p => {
            console.log('------------------------------------------------');
            console.log(`📦 Name: ${p.name}`);
            console.log(`   ID: ${p._id}`);
            console.log(`   isCustomizable Value:`, p.isCustomizable);
            console.log(`   isCustomizable Type:`, typeof p.isCustomizable);
            console.log(`   allowCustomization Value:`, p.allowCustomization); // Check old field too
        });

        // Try precise query
        const countBool = await Product.countDocuments({ isCustomizable: true });
        console.log(`\n🔍 Search { isCustomizable: true } (Boolean) -> Found: ${countBool}`);

        const countString = await Product.countDocuments({ isCustomizable: "true" });
        console.log(`🔍 Search { isCustomizable: "true" } (String)  -> Found: ${countString}`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

debugProducts();
