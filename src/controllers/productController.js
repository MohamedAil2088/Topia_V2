const Product = require('../models/Product');
const Order = require('../models/Order');
const NodeCache = require('node-cache');
const productCache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Helper to clear cache starting with key
const clearProductCache = () => {
    productCache.flushAll(); // Simple strategy: clear all product cache on mutation
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin)
exports.createProduct = async (req, res) => {
    try {
        // التأكد من أن المستخدم موجود في الطلب (من الـ Middleware)
        req.body.user = req.user._id;

        const product = await Product.create(req.body);
        clearProductCache(); // Clear cache
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
    try {
        console.log('📦 GET /api/products - Query params:', req.query);

        // Temporarily disable cache for debugging
        // const cacheKey = req.originalUrl;
        // const cachedData = productCache.get(cacheKey);
        // if (cachedData) {
        //     return res.json(cachedData);
        // }

        // 1. Basic Filtering
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword', 'minPrice', 'maxPrice'];
        excludedFields.forEach(el => delete queryObj[el]);

        // Advanced filtering (gt, gte, lt, lte)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // Build final filter object
        let filter = JSON.parse(queryStr);

        // Add Category Filter (only if it's a valid non-empty string)
        if (req.query.category && req.query.category.trim() !== '') {
            filter.category = req.query.category;
        }

        // Add Keyword Search to Filter
        if (req.query.keyword && req.query.keyword.trim() !== '') {
            filter.name = {
                $regex: req.query.keyword,
                $options: 'i'
            };
        }

        // Fix for isCustomizable filter (Handle legacy products)
        if (req.query.isCustomizable) {
            if (req.query.isCustomizable === 'false') {
                filter.$or = [
                    { isCustomizable: false },
                    { isCustomizable: { $exists: false } },
                    { isCustomizable: null }
                ];
                delete filter.isCustomizable; // Remove the strict check
            } else {
                filter.isCustomizable = true;
            }
        }

        // Add Price Range Filter
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice && Number(req.query.minPrice) > 0) {
                filter.price.$gte = Number(req.query.minPrice);
            }
            if (req.query.maxPrice && Number(req.query.maxPrice) > 0) {
                filter.price.$lte = Number(req.query.maxPrice);
            }
        }

        console.log('🔍 Filter object:', JSON.stringify(filter, null, 2));

        // Initialize Query with Filter
        let query = Product.find(filter).populate('category', 'name');

        // 2. Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
            console.log('📊 Sorting by:', sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // 3. Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        // Execution
        const products = await query;
        const total = await Product.countDocuments(filter);

        console.log(`✅ Found ${products.length} products (total: ${total})`);

        const responseData = {
            success: true,
            count: products.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: products
        };

        // productCache.set(cacheKey, responseData); // Disabled for debugging
        res.json(responseData);
    } catch (error) {
        console.error("❌ Error in getAllProducts:", error);
        console.error("Stack:", error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('user', 'name'); // Show who created it

        if (!product) {
            return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
exports.updateProduct = async (req, res) => {
    try {
        // تحديث الـ slug إذا تغير الاسم
        if (req.body.name) {
            req.body.slug = req.body.name.split(' ').join('-').toLowerCase() + '-' + Date.now();
        }

        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
        }

        clearProductCache(); // Clear cache
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
        }

        clearProductCache(); // Clear cache
        res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
        }

        // Find products with same category, excluding current product
        const related = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        })
            .limit(4) // Get top 4 related products
            .populate('category', 'name');

        res.json({
            success: true,
            count: related.length,
            data: related
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
exports.createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            const alreadyReviewed = (product.reviews || []).find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ success: false, message: 'لقد قمت بتقييم هذا المنتج مسبقاً' });
            }

            // 🔐 VERIFIED PURCHASE CHECK 🔐
            console.log('🔍 Checking verified purchase for user:', req.user._id, 'on product:', req.params.id);

            if (!Order || typeof Order.find !== 'function') {
                console.error('❌ Order model is not correctly loaded!');
                throw new Error('Internal Server Error: Order model missing');
            }

            // Check if user bought this product & order is paid OR delivered
            const userOrders = await Order.find({
                user: req.user._id,
                'orderItems.product': req.params.id,
                $or: [{ isPaid: true }, { isDelivered: true }]
            });

            console.log('📦 Found relevant orders:', userOrders.length);

            if (userOrders.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'يمكنك تقييم المنتج فقط بعد شرائه واستلامه (Verified Purchase Only) ⭐'
                });
            }

            const review = {
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id
            };

            if (!product.reviews) {
                product.reviews = [];
            }
            product.reviews.push(review);

            product.numReviews = product.reviews.length;

            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            clearProductCache();

            res.status(201).json({ success: true, message: 'Review added' });
        } else {
            res.status(404).json({ success: false, message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
