const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        en: {
            type: String,
            required: [true, 'Please enter category name in English'],
            trim: true
        },
        ar: {
            type: String,
            required: [true, 'الرجاء إدخال اسم الفئة بالعربية'],
            trim: true
        }
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        en: {
            type: String,
            maxlength: [500, 'Description should not exceed 500 characters']
        },
        ar: {
            type: String,
            maxlength: [500, 'الوصف لا يجب أن يتعدى 500 حرف']
        }
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800'
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// إنشاء slug تلقائياً من الاسم الإنجليزي قبل الحفظ
categorySchema.pre('save', async function () {
    if (this.isModified('name')) {
        this.slug = this.name.en.split(' ').join('-').toLowerCase();
    }
});

module.exports = mongoose.model('Category', categorySchema);
