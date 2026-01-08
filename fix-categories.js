const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('✅ Connected to MongoDB');

    const Category = require('./src/models/Category');

    // جلب كل الـ categories
    const allCats = await Category.find();
    console.log('\n📋 Current categories in database:');
    allCats.forEach(cat => {
        console.log(`- ${cat._id}: ${JSON.stringify(cat.name)}`);
    });

    // التحديث المباشر لكل الـ categories
    const updates = [
        { old: 'Shirts', new: { en: 'Shirts', ar: 'قمصان' } },
        { old: 'Shirt', new: { en: 'Shirts', ar: 'قمصان' } },
        { old: 'Pants', new: { en: 'Pants', ar: 'بناطيل' } },
        { old: 'Shoes', new: { en: 'Shoes', ar: 'أحذية' } },
        { old: 'Jackets', new: { en: 'Jackets', ar: 'جاكيتات' } },
        { old: 'T-Shirts', new: { en: 'T-Shirts', ar: 'تيشرتات' } },
        { old: 'T-Shirt', new: { en: 'T-Shirts', ar: 'تيشرتات' } },
        { old: 'Accessories', new: { en: 'Accessories', ar: 'إكسسوارات' } }
    ];

    console.log('\n🔄 Starting updates...');
    for (const update of updates) {
        const result = await Category.updateMany(
            { name: update.old },
            { $set: { name: update.new } }
        );
        if (result.modifiedCount > 0) {
            console.log(`✅ Updated "${update.old}" → ${JSON.stringify(update.new)} (${result.modifiedCount} docs)`);
        }
    }

    console.log('\n📋 Final categories:');
    const finalCats = await Category.find();
    finalCats.forEach(cat => {
        console.log(`- ${cat._id}: ${JSON.stringify(cat.name)}`);
    });

    process.exit(0);
}).catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
