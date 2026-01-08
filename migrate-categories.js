const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('✅ Connected to MongoDB');
    migrateCategories();
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

const Category = require('./src/models/Category');

// Dictionary للترجمات
const translations = {
    'Shirts': { en: 'Shirts', ar: 'قمصان' },
    'Pants': { en: 'Pants', ar: 'بناطيل' },
    'Shoes': { en: 'Shoes', ar: 'أحذية' },
    'Jackets': { en: 'Jackets', ar: 'جاكيتات' },
    'T-Shirts': { en: 'T-Shirts', ar: 'تيشرتات' },
    'Accessories': { en: 'Accessories', ar: 'إكسسوارات' }
};

async function migrateCategories() {
    try {
        console.log('🔄 Starting category migration...');

        const categories = await Category.find({});
        console.log(`📦 Found ${categories.length} categories to migrate`);

        for (const category of categories) {
            // إذا كانت الفئة لها اسم string عادي (النظام القديم)
            if (typeof category.name === 'string') {
                const oldName = category.name;
                const translation = translations[oldName] || {
                    en: oldName,
                    ar: oldName
                };

                category.name = translation;

                // تحديث description أيضاً
                if (typeof category.description === 'string') {
                    category.description = {
                        en: category.description || '',
                        ar: category.description || ''
                    };
                }

                await category.save();
                console.log(`✅ Migrated: ${oldName} -> ${translation.en} / ${translation.ar}`);
            } else {
                console.log(`⏭️  Skipped: ${category.name.en} (already migrated)`);
            }
        }

        console.log('🎉 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
}
