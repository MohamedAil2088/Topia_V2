const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log('✅ Connected to MongoDB');

    const Product = require('./src/models/Product');
    const Category = require('./src/models/Category');

    // جلب المنتجات اللي ملهاش category
    const productsWithoutCategory = await Product.find({ category: null });
    console.log(`\n📦 Found ${productsWithoutCategory.length} products without category:`);
    productsWithoutCategory.forEach(p => {
        console.log(`- ${p.name} (${p._id})`);
    });

    // جلب الـ categories
    const shirtsCategory = await Category.findOne({ 'name.en': 'Shirts' });
    const tShirtsCategory = await Category.findOne({ 'name.en': 'T-Shirts' });
    const pantsCategory = await Category.findOne({ 'name.en': 'Pants' });

    console.log('\n🔄 Assigning categories based on product names...');

    for (const product of productsWithoutCategory) {
        let categoryToAssign = null;
        const name = product.name.toLowerCase();

        if (name.includes('t-shirt') || name.includes('tshirt')) {
            categoryToAssign = tShirtsCategory;
            console.log(`✅ ${product.name} → T-Shirts`);
        } else if (name.includes('shirt') || name.includes('hoodie')) {
            categoryToAssign = shirtsCategory;
            console.log(`✅ ${product.name} → Shirts`);
        } else if (name.includes('pant') || name.includes('trouser')) {
            categoryToAssign = pantsCategory;
            console.log(`✅ ${product.name} → Pants`);
        } else {
            // Default to Shirts
            categoryToAssign = shirtsCategory;
            console.log(`⚠️  ${product.name} → Shirts (default)`);
        }

        if (categoryToAssign) {
            await Product.findByIdAndUpdate(product._id, { category: categoryToAssign._id });
        }
    }

    console.log('\n✅ Done! All products now have categories.');

    // Verify
    const stillWithoutCategory = await Product.find({ category: null });
    console.log(`\n📊 Products still without category: ${stillWithoutCategory.length}`);

    process.exit(0);
}).catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
