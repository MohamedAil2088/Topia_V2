const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'الرجاء إدخال اسم المنتج'],
        trim: true,
        index: true // Indexed for search
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'الرجاء إدخال وصف المنتج']
    },
    price: {
        type: Number,
        required: [true, 'الرجاء إدخال السعر'],
        default: 0,
        index: true // Indexed for sorting/filtering
    },
    discountPrice: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'الرجاء اختيار الفئة'],
        index: true // Indexed for filtering
    },
    sizes: [{
        type: String
    }],
    colors: [{
        type: String
    }],
    stock: {
        type: Number,
        required: [true, 'الرجاء تحديد المخزون'],
        default: 0
    },
    images: [{
        type: String,
        required: [true, 'الرجاء إضافة صورة واحدة على الأقل']
    }],
    isFeatured: {
        type: Boolean,
        default: false,
        index: true // Indexed for featured products
    },
    sold: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0
    },
    numReviews: {
        type: Number,
        default: 0
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Custom Design Feature
    // Custom Design Feature
    isCustomizable: {
        type: Boolean,
        default: false,
        index: true  // للبحث السريع عن المنتجات القابلة للتخصيص
    },
    // أسعار الطباعة (اختياري - يمكن تخصيصه لكل منتج)
    customizationPricing: {
        frontPrint: {
            type: Number,
            default: 80
        },
        backPrint: {
            type: Number,
            default: 80
        },
        bothSides: {
            type: Number,
            default: 150
        },
        smallSize: {
            type: Number,
            default: 0
        },
        mediumSize: {
            type: Number,
            default: 20
        },
        largeSize: {
            type: Number,
            default: 40
        }
    },
    reviews: [reviewSchema],
}, {
    timestamps: true
});

// إنشاء slug تلقائياً
productSchema.pre('save', async function () {
    if (this.isModified('name')) {
        this.slug = this.name.split(' ').join('-').toLowerCase() + '-' + Date.now();
    }
});

module.exports = mongoose.model('Product', productSchema);
