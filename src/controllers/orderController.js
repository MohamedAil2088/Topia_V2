const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderConfirmationEmail, sendOrderStatusEmail } = require('../services/emailService');
const { generateInvoiceBuffer } = require('../services/pdfService');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.addOrderItems = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            paymentDetails,
            paymentResult,
            itemsPrice,
            taxPrice,
            shippingPrice,
            discountPrice,
            isElitePackaging,
            packagingPrice,
            totalPrice
        } = req.body;

        console.log('📦 NEW ORDER REQUEST RECEIVED! (VERSION 3.0)');
        console.log('Payment Method:', paymentMethod);
        console.log('Payment Result (Raw):', paymentResult ? JSON.stringify(paymentResult) : 'N/A');
        console.log('Payment Details (Raw):', paymentDetails ? JSON.stringify(paymentDetails) : 'N/A');

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'لا يوجد عناصر في الطلب' });
        } else {
            // Explicitly extract the data to ensure nothing is lost due to naming mismatch
            const mappedPaymentDetails = {
                walletNumber: paymentDetails?.walletNumber || '',
                transactionId: paymentDetails?.transactionId || paymentResult?.id || '',
                receiptImage: paymentDetails?.receiptImage || paymentResult?.receiptImage || ''
            };

            const mappedPaymentResult = {
                id: paymentResult?.id || paymentDetails?.transactionId || '',
                status: paymentResult?.status || 'Pending Verification',
                receiptImage: paymentResult?.receiptImage || paymentDetails?.receiptImage || ''
            };

            console.log('🛠️ Mapped Payment Data:', JSON.stringify({ mappedPaymentDetails, mappedPaymentResult }));

            const orderData = {
                orderItems,
                shippingAddress,
                paymentMethod,
                paymentDetails: mappedPaymentDetails,
                paymentResult: mappedPaymentResult,
                itemsPrice,
                taxPrice,
                shippingPrice,
                discountPrice,
                isElitePackaging,
                packagingPrice,
                totalPrice,
                isGuest: !req.user,
                guestInfo: !req.user ? req.body.guestInfo : undefined
            };

            if (req.user) {
                orderData.user = req.user._id;
            }

            const order = new Order(orderData);
            const createdOrder = await order.save();
            console.log('✅ ORDER SAVED IN DATABASE. ID:', createdOrder._id);

            // 🔻 Inventory Management: Decrement Stock & Increment Sold
            for (const item of orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock = product.stock - item.qty;
                    product.sold = product.sold + item.qty;
                    await product.save();
                    console.log(`📉 Stock updated for ${product.name}: ${product.stock}`);

                    // ⚠️ LOW STOCK NOTIFICATION
                    if (product.stock <= 5) {
                        console.log(`⚠️ LOW STOCK ALERT: ${product.name} only has ${product.stock} left!`);
                        // In a real app, you could emit via Socket.io to the Admin here
                        if (req.io) {
                            req.io.emit('admin_notification', {
                                type: 'LOW_STOCK',
                                message: `Product ${product.name} is running low! (${product.stock} left)`,
                                productId: product._id
                            });
                        }
                    }
                }
            }
            // 🔺 End Inventory Management

            // 🎁 LOYALTY POINTS: Add 1 point for every 10 EGP spent
            if (req.user) {
                const user = await User.findById(req.user._id);
                if (user) {
                    const pointsEarned = Math.floor(totalPrice / 10);
                    user.points = (user.points || 0) + pointsEarned; // Initialize if undefined
                    await user.save();
                    console.log(`🎁 User ${user.name} earned ${pointsEarned} points! Total points: ${user.points}`);
                }
            }

            // Send Order Confirmation Email (Async)
            try {
                const recipientEmail = req.user ? req.user.email : req.body.guestInfo?.email;
                const recipientName = req.user ? req.user.name : req.body.guestInfo?.name;

                if (recipientEmail) {
                    console.log(`📧 Generating PDF and sending email to: ${recipientEmail} (New Layout)`);

                    generateInvoiceBuffer(createdOrder)
                        .then(pdfBuffer => {
                            const attachments = [
                                {
                                    filename: `Topia_Invoice_${createdOrder._id.toString().slice(-8).toUpperCase()}.pdf`,
                                    content: pdfBuffer,
                                    contentType: 'application/pdf'
                                }
                            ];
                            return sendOrderConfirmationEmail(createdOrder, recipientEmail, recipientName, attachments);
                        })
                        .then(() => console.log('✅ Email with PDF attachment sent successfully'))
                        .catch(err => console.error('❌ Email/PDF failed:', err.message));
                }
            } catch (err) {
                console.error('❌ Order Email Error (Outer):', err.message);
            }

            // Emit Socket Notification
            if (req.io) {
                req.io.emit('new_order', {
                    _id: createdOrder._id,
                    totalPrice: createdOrder.totalPrice,
                    name: req.user ? req.user.name : req.body.guestInfo?.name,
                    createdAt: createdOrder.createdAt
                });
            }

            res.status(201).json({ success: true, data: createdOrder });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            res.json({ success: true, data: order });
        } else {
            res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();

            const body = req.body || {};

            order.paymentResult = {
                id: body.id || `manual_${Date.now()}`,
                status: body.status || 'COMPLETED',
                update_time: body.update_time || new Date().toISOString(),
                email_address: body.email_address || (order.user ? order.user.email : 'admin@manual.com')
            };

            const updatedOrder = await order.save();

            // Send Payment Notification
            try {
                const recipientEmail = order.user ? order.user.email : order.guestInfo?.email;
                const recipientName = order.user ? order.user.name : order.guestInfo?.name;

                if (recipientEmail) {
                    await sendOrderStatusEmail(updatedOrder, recipientEmail, recipientName, 'Processing');
                }
            } catch (err) {
                console.error('Payment Email Error:', err);
            }

            res.json({ success: true, data: updatedOrder });
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error) {
        console.error('Update to Paid Error:', error); // Log for debug
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
exports.updateOrderToDelivered = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            order.isDelivered = true;
            order.deliveredAt = Date.now();

            const updatedOrder = await order.save();

            // Send Shipment Email
            try {
                const recipientEmail = order.user ? order.user.email : order.guestInfo?.email;
                const recipientName = order.user ? order.user.name : order.guestInfo?.name;

                if (recipientEmail) {
                    await sendEmail({
                        email: recipientEmail,
                        subject: `Order Shipped #${updatedOrder._id} 🚚`,
                        message: `
                            <div style="font-family: Arial, sans-serif; color: #333;">
                                <h1>Good News, ${recipientName}!</h1>
                                <p>Your order <strong>#${updatedOrder._id}</strong> has been marked as <strong>Delivered</strong>.</p>
                                <p>We hope you enjoy your purchase.</p>
                            </div>
                        `
                    });
                }
            } catch (err) {
                console.error('Shipment Email Error:', err);
            }

            res.json({ success: true, data: updatedOrder });
        } else {
            res.status(404).json({ success: false, message: 'الطلب غير موجود' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order to shipped
// @route   PUT /api/orders/:id/ship
// @access  Private/Admin
exports.updateOrderToShipped = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (order) {
            order.isShipped = true;
            order.shippedAt = Date.now();

            const updatedOrder = await order.save();

            // Send Email Notification
            try {
                const recipientEmail = order.user ? order.user.email : order.guestInfo?.email;
                const recipientName = order.user ? order.user.name : order.guestInfo?.name;

                if (recipientEmail) {
                    await sendOrderStatusEmail(updatedOrder, recipientEmail, recipientName, 'Shipped');
                }
            } catch (err) {
                console.error('Shipment Email Error:', err);
            }

            res.json(updatedOrder);
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const pageSize = 8;
        const page = Number(req.query.pageNumber) || 1;

        const count = await Order.countDocuments({ user: req.user._id });
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        // Filter out any corrupted orders without _id
        const validOrders = orders.filter(order => {
            if (!order._id) {
                console.error('⚠️ Found order without _id:', JSON.stringify(order));
                return false;
            }
            return true;
        });

        if (validOrders.length !== orders.length) {
            console.warn(`⚠️ Filtered out ${orders.length - validOrders.length} corrupted orders`);
        }

        res.json({
            success: true,
            data: validOrders,
            page,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } catch (error) {
        console.error('❌ Error in getMyOrders:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name');
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get unique products purchased by user
// @route   GET /api/orders/myproducts
// @access  Private
exports.getPurchasedProducts = async (req, res) => {
    try {
        const pageSize = 8;
        const page = Number(req.query.pageNumber) || 1;

        const orders = await Order.find({ user: req.user._id }).select('orderItems');

        // Extract products and remove duplicates by ID
        const productsMap = new Map();

        orders.forEach(order => {
            order.orderItems.forEach(item => {
                if (item.product && !productsMap.has(item.product.toString())) {
                    productsMap.set(item.product.toString(), {
                        _id: item.product,
                        name: item.name,
                        image: item.image,
                        price: item.price
                    });
                }
            });
        });

        const allProducts = Array.from(productsMap.values());
        const total = allProducts.length;

        // Paginate the array
        const startIndex = (page - 1) * pageSize;
        const paginatedProducts = allProducts.slice(startIndex, startIndex + pageSize);

        res.json({
            success: true,
            data: paginatedProducts,
            page,
            pages: Math.ceil(total / pageSize),
            total
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update order generic status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = req.body.status;

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ success: false, message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};