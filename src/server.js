const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// إنشاء تطبيق Express
const app = express();

// تحميل متغيرات البيئة
dotenv.config();

// Force Vercel Redeploy - Timestamp: %TIMESTAMP%
console.log('Server starting... Vercel Fix Deployment');

const connectDB = require('./config/database');

// Sentry Init
const { initSentry, Sentry } = require('./utils/sentry');
initSentry();

// Sentry Request Handler (Must be the first middleware)
Sentry.setupExpressErrorHandler(app);

// الاتصال بقاعدة البيانات (Ensure DB is connected for every request)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database Connection Failed:", error);
    res.status(500).json({ error: "Database Connection Failed" });
  }
});

// استيراد Routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

const { Server } = require("socket.io");
const http = require('http');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://topia-mens.vercel.app",
      "https://topia-store-two.vercel.app",
      "https://topia-front-v2.vercel.app",
      /^https:\/\/topia-.*\.vercel\.app$/,
      /^https:\/\/topia-front-v2-.*\.vercel\.app$/
    ],
    methods: ["GET", "POST"]
  }
});

// Make io available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/test-early', (req, res) => res.send('Early test works'));

// =======================
// 🛡️ CORS - MUST BE FIRST!
// =======================
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://topia-mens.vercel.app",
    "https://topia-store-two.vercel.app",
    "https://topia-front-v2.vercel.app",
    /^https:\/\/topia-.*\.vercel\.app$/,
    /^https:\/\/topia-front-v2-.*\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// =======================
// 🛡️ Security Middlewares
// =======================

// 1. Set Security Headers
// TEMPORARILY DISABLED - May cause issues with Node.js v24
// app.use(helmet());

// 2. Limit Requests from same IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per 15 minutes
  message: 'Too many requests from this IP, please try again in 15 minutes!'
});
app.use('/api', limiter); // Apply to all API routes

// Body Parser - MUST BE BEFORE ROUTES
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Special stricter limit for Auth routes - DISABLED FOR DEV
// const authLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, 
//   max: 10, 
//   message: 'Too many login attempts, please try again after an hour'
// });
// app.use('/api/auth', authLimiter);

// 3. Body Parser (Moved Up)
// Already handled above

// 3. Data Sanitization against NoSQL query injection
// TEMPORARILY DISABLED - Causing issues with Node.js v24
// app.use(mongoSanitize());

// 4. Data Sanitization against XSS
// TEMPORARILY DISABLED - May cause issues with Node.js v24
// app.use(xss());

// 5. Prevent Parameter Pollution
// TEMPORARILY DISABLED - May cause issues with Node.js v24
// app.use(hpp());

const errorHandler = require('./middleware/errorHandler');

const path = require('path');
const uploadRoutes = require('./routes/uploadRoutes');

// ... (other routes)

// استخدام Routes
app.get('/api/auth/ping', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin/reviews', require('./routes/adminReviewRoutes')); // Admin Review Management
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes')); // Payment Route
app.use('/api/contact', require('./routes/contactRoutes')); // Contact Form Route
app.use('/api/custom-orders', require('./routes/customOrderRoutes')); // Custom Orders Route
app.use('/api/designs', require('./routes/designRoutes')); // Design Templates Route
app.use('/api/settings', require('./routes/settingRoutes')); // Store Settings Route


// جعل مجلد uploads عاماً (Static) - فقط في البيئة المحلية
const isServerless = process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
if (!isServerless) {
  const uploadsPath = path.join(__dirname, '../uploads');
  app.use('/uploads', express.static(uploadsPath));
}

// Route أساسي للاختبار
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'مرحباً! 🚀 Backend للمتجر الإلكتروني يعمل بنجاح',
    version: '1.0.1'
  });
});

// Route للاختبار
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API يعمل بنجاح! ✅'
  });
});

// Error Handler Middleware
app.use(errorHandler);

// تشغيل السيرفر
const PORT = process.env.PORT || 5000;

// Export app for Vercel
module.exports = app;

// Only listen if running locally (node src/server.js)
if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 URL: http://localhost:${PORT} (IPv4/IPv6 accessible)`);
  });
}
