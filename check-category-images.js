const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hassan:Heso124578@main.vnkludj.mongodb.net/topia-db';

async function checkCategoryImages() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!\n');

        const db = mongoose.connection.db;
        const categories = await db.collection('categories').find({}).toArray();

        console.log('📂 Categories with images:\n');
        console.log('='.repeat(80));

        categories.forEach((c, i) => {
            console.log(`${i + 1}. ${c.name}`);
            console.log(`   Image: ${c.image || 'NO IMAGE'}`);
            console.log(`   Slug: ${c.slug}`);
            console.log('');
        });

        console.log('='.repeat(80));
        console.log(`\nTotal categories: ${categories.length}`);
        console.log(`With images: ${categories.filter(c => c.image && c.image !== 'default-category.jpg').length}`);

        await mongoose.connection.close();
        console.log('\n👋 Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkCategoryImages();
