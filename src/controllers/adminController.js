const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
    try {
        // Get total sales (sum of all paid orders)
        const salesData = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalSales = salesData.length > 0 ? salesData[0].total : 0;

        // Get total orders count
        const totalOrders = await Order.countDocuments();

        // Get total products count
        const totalProducts = await Product.countDocuments();

        // Get total users count
        const totalUsers = await User.countDocuments();

        // Get recent orders (last 10)
        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(); // Return plain objects to modify status

        // Map status for recent orders
        const formattedRecentOrders = recentOrders.map(order => ({
            ...order,
            orderStatus: order.isDelivered ? 'delivered' : (order.isPaid ? 'confirmed' : 'pending')
        }));

        // Get order stats by status (Simulated Grouping)
        // Since we don't have orderStatus field, we classify by isDelivered/isPaid
        const deliveredCount = await Order.countDocuments({ isDelivered: true });
        const paidNotDelivered = await Order.countDocuments({ isPaid: true, isDelivered: false });
        const pendingCount = await Order.countDocuments({ isPaid: false });

        const ordersByStatus = [
            { _id: 'delivered', count: deliveredCount },
            { _id: 'processing', count: paidNotDelivered },
            { _id: 'pending', count: pendingCount }
        ];

        // Get monthly sales (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    isPaid: true
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    total: { $sum: '$totalPrice' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Get user tier distribution
        const tierDistribution = await User.aggregate([
            { $group: { _id: '$tier', count: { $sum: 1 } } }
        ]);

        // Get elite packaging stats
        const elitePackagingData = await Order.aggregate([
            { $match: { isElitePackaging: true } },
            { $group: { _id: null, total: { $sum: '$packagingPrice' }, count: { $sum: 1 } } }
        ]);
        const elitePackagingStats = elitePackagingData.length > 0 ? elitePackagingData[0] : { total: 0, count: 0 };

        res.json({
            success: true,
            data: {
                totalSales: totalSales.toFixed(2),
                totalOrders,
                totalProducts,
                totalUsers,
                recentOrders,
                ordersByStatus,
                monthlySales,
                tierDistribution,
                elitePackagingStats
            }
        });
    } catch (error) {
        console.error('❌ Admin Stats Error:', error);
        console.error('Error Stack:', error.stack);
        res.status(500).json({ success: false, message: error.message });
    }
};
