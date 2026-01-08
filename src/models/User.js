const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'الرجاء إدخال الاسم'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'الرجاء إدخال البريد الإلكتروني'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'الرجاء إدخال بريد إلكتروني صحيح'
        ]
    },
    password: {
        type: String,
        required: [true, 'الرجاء إدخال كلمة المرور'],
        minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
        select: false // عدم إرجاع كلمة المرور عند الاستعلام إلا إذا طلبنا ذلك
    },
    phone: {
        type: String,
        required: [false, 'رقم الهاتف اختياري']
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows null/multiple users without googleId
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    addresses: [{
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        isDefault: { type: Boolean, default: false }
    }],
    isAdmin: {
        type: Boolean,
        default: false
    },
    points: {
        type: Number,
        default: 0
    },
    tier: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Elite'],
        default: 'Bronze'
    },
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        viewMode: {
            type: String,
            enum: ['grid', 'list'],
            default: 'grid'
        },
        language: {
            type: String,
            enum: ['en', 'ar'],
            default: 'en'
        },
        emailNotifications: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: false
        }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// مقارنة كلمة المرور
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
