const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('✅ Connected to MongoDB');

    const Product = require('./src/models/Product');
    const Category = require('./src/models/Category');

    // جلب كل الـ products مع الـ category
    const products = await Product.find().populate('category');

    console.log('\n📦 Products and their categories:');
    const categoryMap = {};
    products.forEach(p => {
        const catName = p.category?.name || 'No category';
        const catKey = typeof catName === 'object' ? JSON.stringify(catName) : catName;
        if (!categoryMap[catKey]) {
            categoryMap[catKey] = 0;
        }
        categoryMap[catKey]++;
    });

    console.log('\nCategory distribution:');
    Object.entries(categoryMap).forEach(([cat, count]) => {
        console.log(`- ${cat}: ${count} products`);
    });

    // جلب الـ categories الموجودة
    const existingCategories = await Category.find();
    console.log('\n📂 Existing categories in Category collection:');
    existingCategories.forEach(cat => {
        console.log(`- ${cat._id}: ${JSON.stringify(cat.name)}`);
    });

    // إنشاء T-Shirts category إذا مكنش موجود
    let tShirtCat = await Category.findOne({ 'name.en': 'T-Shirts' });
    if (!tShirtCat) {
        tShirtCat = await Category.create({
            name: { en: 'T-Shirts', ar: 'تيشرتات' },
            slug: 't-shirts'
        });
        console.log('\n✅ Created T-Shirts category:', tShirtCat._id);
    } else {
        console.log('\n✅ T-Shirts category already exists:', tShirtCat._id);
    }

    process.exit(0);
}).catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
