const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'يرجى إدخال اسم التصميم'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        required: [true, 'يرجى رفع صورة التصميم']
    },
    category: {
        type: String,
        enum: ['T-Shirt', 'Shirt', 'Pants', 'Jacket', 'Accessories', 'Other'],
        default: 'Other'
    },
    price: {
        type: Number,
        required: [true, 'يرجى تحديد سعر التصميم'],
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    usageCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index للبحث
designSchema.index({ name: 'text', description: 'text', tags: 'text' });
designSchema.index({ category: 1, isActive: 1 });

// Method لزيادة عدد الاستخدام
designSchema.methods.incrementUsage = function () {
    this.usageCount += 1;
    return this.save();
};

module.exports = mongoose.model('Design', designSchema);
