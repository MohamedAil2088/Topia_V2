try {
    const app = require('../src/server');
    module.exports = app;
} catch (error) {
    console.error("Critical Initialization Error:", error);
    module.exports = (req, res) => {
        res.status(500).json({
            status: "error",
            message: "فشل تشغيل السيرفر",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    };
}
