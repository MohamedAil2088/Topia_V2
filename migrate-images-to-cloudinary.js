/**
 * Migration Script: Upload local images to Cloudinary and update database
 * Run with: node migrate-images-to-cloudinary.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function migrateImages() {
    try {
        // Check Cloudinary config
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
            console.log('❌ Cloudinary credentials not found in .env file!');
            console.log('   Please add:');
            console.log('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
            console.log('   CLOUDINARY_API_KEY=your_api_key');
            console.log('   CLOUDINARY_API_SECRET=your_api_secret');
            return;
        }

        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Get Product model
        const Product = require('./src/models/Product');

        // Get all products
        const products = await Product.find({});

        console.log(`📦 Found ${products.length} products to process\n`);
        console.log('='.repeat(60));

        let successCount = 0;
        let failCount = 0;
        const uploadsDir = path.join(__dirname, 'uploads');

        for (const product of products) {
            const productName = typeof product.name === 'object'
                ? (product.name.en || product.name.ar)
                : product.name;

            console.log(`\n🔄 Processing: ${productName}`);

            const newImages = [];

            for (const imageUrl of product.images) {
                // Skip if already a Cloudinary URL
                if (imageUrl.includes('cloudinary') || imageUrl.startsWith('http')) {
                    console.log(`   ⏭️  Already cloud URL: ${imageUrl.substring(0, 50)}...`);
                    newImages.push(imageUrl);
                    continue;
                }

                // Get local file path
                const filename = imageUrl.replace('/uploads/', '').replace('uploads/', '');
                const localPath = path.join(uploadsDir, filename);

                // Check if file exists
                if (!fs.existsSync(localPath)) {
                    console.log(`   ⚠️  File not found: ${filename}`);
                    newImages.push(imageUrl); // Keep original URL
                    failCount++;
                    continue;
                }

                try {
                    // Upload to Cloudinary
                    console.log(`   📤 Uploading: ${filename}`);
                    const result = await cloudinary.uploader.upload(localPath, {
                        folder: 'topia-store/products',
                        public_id: filename.replace('.webp', '').replace('.jpg', '').replace('.png', ''),
                        resource_type: 'image'
                    });

                    console.log(`   ✅ Uploaded: ${result.secure_url.substring(0, 50)}...`);
                    newImages.push(result.secure_url);
                    successCount++;
                } catch (uploadError) {
                    console.log(`   ❌ Upload failed: ${uploadError.message}`);
                    newImages.push(imageUrl); // Keep original URL
                    failCount++;
                }
            }

            // Update product with new image URLs
            product.images = newImages;
            await product.save();
            console.log(`   💾 Product updated!`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n📊 Migration Summary:');
        console.log(`   ✅ Successfully uploaded: ${successCount} images`);
        console.log(`   ❌ Failed/Skipped: ${failCount} images`);
        console.log('\n🎉 Migration completed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
    }
}

migrateImages();
