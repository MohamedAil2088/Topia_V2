const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema({
    // User Information
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Product Information
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },

    // Order Details
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1
    },

    size: {
        type: String,
        required: true,
        enum: ['S', 'M', 'L', 'XL', 'XXL']
    },

    color: {
        type: String,
        required: true
    },

    // Customization Details
    customization: {
        // التصميم المختار من المعرض
        selectedDesign: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Design'
        },

        // رفع الصور - مصفوفة روابط الصور المرفوعة (Optional - للطلبات القديمة)
        designImages: [{
            url: {
                type: String,
                required: true
            },
            filename: {
                type: String,
                required: true
            },
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],

        // موقع الطباعة
        printLocation: {
            type: String,
            required: true,
            enum: ['front', 'back', 'both'],
            default: 'front'
        },

        // حجم الطباعة
        printSize: {
            type: String,
            required: true,
            enum: ['small', 'medium', 'large'],
            default: 'medium'
        },

        // ملاحظات خاصة بالطباعة
        specialInstructions: {
            type: String,
            maxlength: 500,
            trim: true
        },

        // تفاصيل إضافية من العميل
        designNotes: {
            type: String,
            maxlength: 1000,
            trim: true
        }
    },

    // Pricing Breakdown
    pricing: {
        // سعر المنتج الأساسي (الهودي)
        basePrice: {
            type: Number,
            required: true
        },

        // سعر الطباعة (يعتمد على الـ location و size)
        printPrice: {
            type: Number,
            required: true,
            default: 0
        },

        // إجمالي السعر
        totalPrice: {
            type: Number,
            required: true
        }
    },

    // Order Status
    status: {
        type: String,
        enum: [
            'pending',       // قيد الانتظار
            'reviewing',     // قيد المراجعة من Admin
            'approved',      // تمت الموافقة
            'in-design',     // قيد التصميم
            'printing',      // قيد الطباعة
            'completed',     // تم الإنجاز
            'shipped',       // تم الشحن
            'delivered',     // تم التسليم
            'cancelled'      // تم الإلغاء
        ],
        default: 'pending'
    },

    // Admin Information
    admin: {
        // ملاحظات الـ Admin
        notes: {
            type: String,
            maxlength: 1000
        },

        // Admin اللي راجع الطلب
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

        // تاريخ المراجعة
        reviewedAt: {
            type: Date
        },

        // سبب الرفض (لو تم رفض الطلب)
        rejectionReason: {
            type: String,
            maxlength: 500
        }
    },

    // Shipping Information
    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'Egypt'
        }
    },

    // Payment Information
    isPaid: {
        type: Boolean,
        default: false
    },

    paidAt: {
        type: Date
    },

    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'wallet'],
        default: 'cash'
    },

    // Tracking
    trackingNumber: {
        type: String
    },

    // Timeline - لتتبع مراحل الطلب
    timeline: [{
        status: String,
        note: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]

}, {
    timestamps: true
});

// Virtual للحصول على إجمالي عدد الصور
customOrderSchema.virtual('imageCount').get(function () {
    return this.customization.designImages.length;
});

// Method لحساب سعر الطباعة
customOrderSchema.methods.calculatePrintPrice = function () {
    let price = 0;

    // سعر حسب موقع الطباعة
    if (this.customization.printLocation === 'front') {
        price += 80;
    } else if (this.customization.printLocation === 'back') {
        price += 80;
    } else if (this.customization.printLocation === 'both') {
        price += 150;
    }

    // سعر إضافي حسب حجم الطباعة
    if (this.customization.printSize === 'small') {
        price += 0;
    } else if (this.customization.printSize === 'medium') {
        price += 20;
    } else if (this.customization.printSize === 'large') {
        price += 40;
    }

    return price;
};

// Method لتحديث Timeline
customOrderSchema.methods.addTimelineEntry = function (status, note, userId) {
    this.timeline.push({
        status,
        note,
        updatedBy: userId,
        timestamp: new Date()
    });
};

// Index للبحث السريع
customOrderSchema.index({ user: 1, status: 1 });
customOrderSchema.index({ status: 1, createdAt: -1 });
customOrderSchema.index({ 'admin.reviewedBy': 1 });

module.exports = mongoose.model('CustomOrder', customOrderSchema);
