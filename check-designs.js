const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('✅ Connected to MongoDB');

    const Design = require('./src/models/Design');

    // جلب كل الـ designs
    const designs = await Design.find();
    console.log(`\n🎨 Found ${designs.length} designs`);

    // جمع كل الـ categories المستخدمة
    const categoryMap = {};
    designs.forEach(d => {
        if (!categoryMap[d.category]) {
            categoryMap[d.category] = [];
        }
        categoryMap[d.category].push(d.name);
    });

    console.log('\n📊 Design categories:');
    Object.entries(categoryMap).forEach(([cat, designs]) => {
        console.log(`- ${cat}: ${designs.length} designs`);
        designs.forEach(d => console.log(`  • ${d}`));
    });

    // ترجمة الـ categories
    const translations = {
        'T-Shirt': 'تيشرتات',
        'Shirt': 'قمصان',
        'Pants': 'بناطيل',
        'Shoes': 'أحذية',
        'Jackets': 'جاكيتات',
        'Accessories': 'إكسسوارات'
    };

    console.log('\n💡 Suggested fix: Convert category field to multilingual object');
    console.log('This requires changing the Design model schema.');

    process.exit(0);
}).catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
