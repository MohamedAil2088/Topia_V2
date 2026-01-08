const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'الرجاء إضافة تقييم بين 1 و 5']
    },
    comment: {
        type: String,
        required: [true, 'الرجاء إضافة تعليق']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    // Admin moderation fields
    approved: {
        type: Boolean,
        default: true // Auto-approve by default, Admin can change
    },
    featured: {
        type: Boolean,
        default: false // Admin can feature certain reviews
    },
    hidden: {
        type: Boolean,
        default: false // Admin can hide reviews without deleting
    }
}, {
    timestamps: true
});

// منع المستخدم من إضافة أكثر من مراجعة لنفس المنتج
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// دالة ثابتة (Static Method) لحساب متوسط التقييم للمنتج
reviewSchema.statics.calcAverageRatings = async function (productId) {
    const stats = await this.aggregate([
        {
            $match: { product: productId }
        },
        {
            $group: {
                _id: '$product',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            rating: stats[0].avgRating,
            numReviews: stats[0].nRating
        });
    } else {
        // إذا تم حذف كل المراجعات
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            rating: 0,
            numReviews: 0
        });
    }
};

// تشغيل الدالة بعد إضافة مراجعة
reviewSchema.post('save', async function () {
    await this.constructor.calcAverageRatings(this.product);
});

// تشغيل الدالة بعد حذف مراجعة
reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
    await this.constructor.calcAverageRatings(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
