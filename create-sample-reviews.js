const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hassan:Heso124578@main.vnkludj.mongodb.net/topia-db';

async function createSampleReviews() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected!\n');

        const db = mongoose.connection.db;
        const reviewsCollection = db.collection('reviews');
        const productsCollection = db.collection('products');
        const usersCollection = db.collection('users');

        // Get some products
        const products = await productsCollection.find({}).limit(5).toArray();
        if (products.length === 0) {
            console.log('❌ No products found! Please create products first.');
            await mongoose.connection.close();
            return;
        }

        // Get some users
        const users = await usersCollection.find({}).limit(5).toArray();
        if (users.length === 0) {
            console.log('❌ No users found! Please create users first.');
            await mongoose.connection.close();
            return;
        }

        console.log(`📦 Found ${products.length} products`);
        console.log(`👥 Found ${users.length} users\n`);

        // Sample reviews data
        const sampleReviews = [
            {
                rating: 5,
                comment: 'منتج ممتاز جداً! الجودة عالية والخامة رائعة. أنصح بالشراء 👍',
                user: users[0]._id,
                product: products[0]._id,
                approved: true,
                featured: true,
                hidden: false,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
                rating: 4,
                comment: 'المنتج جميل والتصميم أنيق. الشحن كان سريع. شكراً لكم!',
                user: users[1]._id,
                product: products[0]._id,
                approved: true,
                featured: false,
                hidden: false,
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
                rating: 5,
                comment: 'Perfect quality! Exactly as described. Will buy again 🔥',
                user: users[0]._id,
                product: products[1]._id,
                approved: true,
                featured: true,
                hidden: false,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            },
            {
                rating: 3,
                comment: 'المنتج جيد لكن المقاس كان أصغر من المتوقع',
                user: users[2]._id,
                product: products[1]._id,
                approved: false,
                featured: false,
                hidden: false,
                createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
            },
            {
                rating: 2,
                comment: 'مش عاجبني خالص. الخامة مش كويسة',
                user: users[3]._id,
                product: products[2]._id,
                approved: false,
                featured: false,
                hidden: true,
                createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
            },
            {
                rating: 5,
                comment: 'Amazing product! The fit is perfect and material is top quality ⭐',
                user: users[1]._id,
                product: products[2]._id,
                approved: true,
                featured: true,
                hidden: false,
                createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
            },
            {
                rating: 4,
                comment: 'التوصيل سريع والمنتج مطابق للوصف. جودة ممتازة',
                user: users[2]._id,
                product: products[3]._id,
                approved: true,
                featured: false,
                hidden: false,
                createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
            },
            {
                rating: 5,
                comment: 'Best purchase ever! Highly recommend 💯',
                user: users[3]._id,
                product: products[3]._id,
                approved: true,
                featured: false,
                hidden: false,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
            }
        ];

        // Insert reviews
        console.log('📝 Creating sample reviews...\n');
        const result = await reviewsCollection.insertMany(sampleReviews);
        console.log(`✅ Created ${result.insertedCount} reviews!\n`);

        // Show stats
        const totalReviews = await reviewsCollection.countDocuments({});
        const approvedCount = await reviewsCollection.countDocuments({ approved: true });
        const featuredCount = await reviewsCollection.countDocuments({ featured: true });
        const hiddenCount = await reviewsCollection.countDocuments({ hidden: true });

        console.log('📊 Reviews Stats:');
        console.log(`   Total: ${totalReviews}`);
        console.log(`   ✅ Approved: ${approvedCount}`);
        console.log(`   ⭐ Featured: ${featuredCount}`);
        console.log(`   🚫 Hidden: ${hiddenCount}`);
        console.log(`   ⏳ Pending: ${totalReviews - approvedCount}`);

        await mongoose.connection.close();
        console.log('\n👋 Done! Check /admin/reviews now!');

    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

createSampleReviews();
