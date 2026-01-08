
try {
    console.log('Testing orderController.js...');
    const controller = require('./src/controllers/orderController');
    console.log('✅ orderController loaded successfully!');
    if (typeof controller.updateOrderStatus !== 'function') {
        console.error('❌ FATAL: updateOrderStatus is NOT exported correctly!');
    } else {
        console.log('✅ updateOrderStatus is exported correctly.');
    }

    console.log('Testing orderRoutes.js...');
    const routes = require('./src/routes/orderRoutes');
    console.log('✅ orderRoutes loaded successfully!');

    console.log('🎉 Everything looks good! The server should run.');
} catch (error) {
    console.error('💣 CRASH DETECTED:', error);
}
