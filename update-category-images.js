const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hassan:Heso124578@main.vnkludj.mongodb.net/topia-db';

// Nice category images from Unsplash
const categoryImages = {
    'Shirts': 'https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?w=800',
    'Pants': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
    'Shoes': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800'
};

async function updateCategoryImages() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!\n');

        const db = mongoose.connection.db;
        const categoriesCollection = db.collection('categories');

        console.log('📸 Updating category images...\n');

        for (const [categoryName, imageUrl] of Object.entries(categoryImages)) {
            const result = await categoriesCollection.updateOne(
                { name: categoryName },
                { $set: { image: imageUrl } }
            );

            if (result.modifiedCount > 0) {
                console.log(`✅ Updated ${categoryName} with new image`);
            } else {
                console.log(`⚠️  ${categoryName} not found or already has this image`);
            }
        }

        console.log('\n📋 Current categories:');
        const categories = await categoriesCollection.find({}).toArray();
        categories.forEach((c) => {
            console.log(`   ${c.name}: ${c.image}`);
        });

        await mongoose.connection.close();
        console.log('\n👋 Done! Refresh your website to see the new images!');
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

updateCategoryImages();
