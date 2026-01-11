/**
 * Script to check product image URLs in the database
 * Run with: node check-image-urls.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function checkImageUrls() {
    try {
        // Connect to MongoDB (try both variable names)
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

        if (!mongoUri) {
            console.log('❌ No MongoDB URI found in .env file');
            console.log('   Please set MONGO_URI or MONGODB_URI');
            return;
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Get Product model
        const Product = require('./src/models/Product');

        // Find all products and their images
        const products = await Product.find({}, 'name images').lean();

        console.log('📦 Products and their image URLs:\n');
        console.log('='.repeat(60));

        let localImages = 0;
        let cloudinaryImages = 0;
        let otherImages = 0;

        products.forEach((product, index) => {
            const name = typeof product.name === 'object' ? product.name.en || product.name.ar : product.name;
            console.log(`\n${index + 1}. ${name}`);

            if (product.images && product.images.length > 0) {
                product.images.forEach((img, imgIndex) => {
                    console.log(`   Image ${imgIndex + 1}: ${img}`);

                    if (img.startsWith('/uploads') || img.startsWith('uploads')) {
                        localImages++;
                    } else if (img.includes('cloudinary')) {
                        cloudinaryImages++;
                    } else if (img.startsWith('http')) {
                        otherImages++;
                    } else {
                        localImages++;
                    }
                });
            } else {
                console.log('   ⚠️ No images');
            }
        });

        console.log('\n' + '='.repeat(60));
        console.log('\n📊 Summary:');
        console.log(`   Total Products: ${products.length}`);
        console.log(`   Local Images (/uploads/...): ${localImages}`);
        console.log(`   Cloudinary Images: ${cloudinaryImages}`);
        console.log(`   Other URLs (http://...): ${otherImages}`);

        if (localImages > 0) {
            console.log('\n⚠️  WARNING: You have local images that won\'t work on Netlify!');
            console.log('   You need to either:');
            console.log('   1. Upload them to Cloudinary and update the database');
            console.log('   2. Use external image URLs');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

checkImageUrls();
