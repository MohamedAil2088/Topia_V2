const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hassan:Heso124578@main.vnkludj.mongodb.net/topia-db';

async function fixDefaultImages() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!\n');

        const db = mongoose.connection.db;
        const categoriesCollection = db.collection('categories');

        // Find categories with default-category.jpg
        const categoriesToFix = await categoriesCollection.find({
            $or: [
                { image: 'default-category.jpg' },
                { image: { $exists: false } },
                { image: null },
                { image: '' }
            ]
        }).toArray();

        console.log(`📂 Found ${categoriesToFix.length} categories with default/missing images\n`);

        if (categoriesToFix.length === 0) {
            console.log('✅ All categories have proper images!');
            await mongoose.connection.close();
            return;
        }

        const defaultImage = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800';

        for (const cat of categoriesToFix) {
            console.log(`Fixing: ${cat.name} (${cat.image || 'NO IMAGE'})`);

            await categoriesCollection.updateOne(
                { _id: cat._id },
                { $set: { image: defaultImage } }
            );

            console.log(`✅ Updated ${cat.name}`);
        }

        console.log('\n📋 Final check:');
        const allCategories = await categoriesCollection.find({}).toArray();
        allCategories.forEach((c) => {
            console.log(`   ${c.name}: ${c.image}`);
        });

        await mongoose.connection.close();
        console.log('\n👋 Done! Refresh your website!');
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

fixDefaultImages();
