const nodemailer = require('nodemailer');

// Email transporter configuration
const createTransporter = () => {
    // Debug Log
    console.log('📧 attempting to create email transporter...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✅' : 'Missing ❌');
    console.log('EMAIL_PASS:', process.env.EMAIL_APP_PASSWORD ? 'Set ✅' : 'Missing ❌');

    // Check if using production settings by mistake
    if (process.env.NODE_ENV === 'production') {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    } else {
        // Development: Use Gmail
        // Explicitly ensuring no spaces in password
        const cleanPassword = process.env.EMAIL_APP_PASSWORD ? process.env.EMAIL_APP_PASSWORD.replace(/\s/g, '') : '';

        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: cleanPassword
            }
        });
    }
};

// Send Order Confirmation Email
const sendOrderConfirmationEmail = async (order, userEmail, userName, attachments = []) => {
    try {
        const transporter = createTransporter();

        // Calculate total
        const total = order.totalPrice;

        // Email HTML template
        const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
            border-radius: 12px 12px 0 0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: -1px;
        }
        .content {
            background: #ffffff;
            padding: 40px;
            border-radius: 0 0 12px 12px;
            border: 1px solid #eef2f7;
            border-top: none;
        }
        .order-badge {
            display: inline-block;
            background: #f0f4ff;
            color: #5a67d8;
            padding: 6px 16px;
            border-radius: 50px;
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .product-item {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .total-section {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .total-amount {
            font-size: 24px;
            font-weight: 800;
            color: #764ba2;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #a0aec0;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 14px 35px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Order Confirmed!</h1>
        <p>Your style is on its way, ${userName}!</p>
    </div>
    
    <div class="content">
        <div class="order-badge">Order #${order._id.toString().slice(-8).toUpperCase()}</div>
        <p style="font-size: 18px; color: #4a5568;">Hi <strong>${userName}</strong>,</p>
        <p>Thank you for choosing <strong>TOPIA</strong>. We've received your order and our team is already working on your items. Your official invoice is attached to this email.</p>
        
        <div style="margin: 30px 0;">
            ${order.orderItems.map(item => `
                <div class="product-item">
                    <span style="color: #4a5568;">${item.name} <span style="color: #a0aec0;">(x${item.qty})</span></span>
                    <strong style="color: #2d3748;">${item.price.toFixed(2)} EGP</strong>
                </div>
            `).join('')}
        </div>
        
        <div class="total-section">
            <span style="font-weight: 600; color: #718096;">Total Amount</span>
            <span class="total-amount">${total.toFixed(2)} EGP</span>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile/orders" class="button">Track Your Order</a>
        </div>
    </div>
    
    <div class="footer">
        <p>Questions? We're here to help. Contact support@topia.com</p>
        <p>&copy; ${new Date().getFullYear()} TOPIA Men's Fashion. All rights reserved.</p>
    </div>
</body>
</html>
        `;

        // Send email
        console.log(`📎 Number of attachments: ${attachments.length}`);

        const mailOptions = {
            from: `"TOPIA E-Commerce" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Order Confirmation #${order._id.toString().slice(-8).toUpperCase()} - Topia`,
            html: emailHTML,
            attachments: attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Order confirmation email sent:', info.messageId);

        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error('❌ Error sending order confirmation email:', error);
        // Don't throw error - email is not critical
        return {
            success: false,
            error: error.message
        };
    }
};

// Send Order Status Update Email
const sendOrderStatusEmail = async (order, userEmail, userName, status) => {
    try {
        const transporter = createTransporter();

        const statusMessages = {
            'Processing': 'Your order is being processed',
            'Shipped': 'Your order has been shipped',
            'Delivered': 'Your order has been delivered',
            'Cancelled': 'Your order has been cancelled'
        };

        const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .status-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📦 Order Update</h1>
    </div>
    
    <div class="content">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>${statusMessages[status] || 'Your order status has been updated'}.</p>
        
        <div style="text-align: center;">
            <div class="status-badge">${status}</div>
        </div>
        
        <p><strong>Order ID:</strong> ${order._id}</p>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${order._id}" class="button">
                Track Your Order
            </a>
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: `"TOPIA E-Commerce" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Order Update: ${status} - Order #${order._id}`,
            html: emailHTML
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Order status email sent:', info.messageId);

        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error('❌ Error sending order status email:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Send Contact Form Email
const sendContactFormEmail = async (name, email, subject, message) => {
    try {
        const transporter = createTransporter();

        // Email to Admin (you receive the contact message)
        const adminEmailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .message-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .info-item {
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .info-item:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📬 New Contact Message</h1>
    </div>
    
    <div class="content">
        <p>You have received a new message from your website contact form.</p>
        
        <div class="message-box">
            <div class="info-item">
                <span class="label">👤 From:</span> ${name}
            </div>
            <div class="info-item">
                <span class="label">📧 Email:</span> <a href="mailto:${email}">${email}</a>
            </div>
            <div class="info-item">
                <span class="label">📌 Subject:</span> ${subject}
            </div>
        </div>
        
        <div class="message-box">
            <p class="label">💬 Message:</p>
            <p style="white-space: pre-wrap; margin-top: 10px;">${message}</p>
        </div>
        
        <p style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
            Sent from TOPIA E-Commerce Contact Form
        </p>
    </div>
</body>
</html>
        `;

        // Email to Customer (confirmation they sent the message)
        const customerEmailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .message-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Message Received!</h1>
    </div>
    
    <div class="content">
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for contacting TOPIA E-Commerce. We have received your message and will get back to you as soon as possible.</p>
        
        <div class="message-box">
            <h3 style="margin-top: 0;">Your Message:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p style="white-space: pre-wrap;">${message}</p>
        </div>
        
        <p>Our team typically responds within 24-48 hours. If your inquiry is urgent, please call us directly.</p>
    </div>
    
    <div class="footer">
        <p>&copy; ${new Date().getFullYear()} TOPIA E-Commerce. All rights reserved.</p>
    </div>
</body>
</html>
        `;

        // Send email to admin
        const adminMailOptions = {
            from: `"TOPIA Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Admin email
            replyTo: email, // Customer's email for easy reply
            subject: `[Contact Form] ${subject}`,
            html: adminEmailHTML
        };

        // Send confirmation to customer
        const customerMailOptions = {
            from: `"TOPIA E-Commerce" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `We received your message: ${subject}`,
            html: customerEmailHTML
        };

        // Send both emails
        const [adminInfo, customerInfo] = await Promise.all([
            transporter.sendMail(adminMailOptions),
            transporter.sendMail(customerMailOptions)
        ]);

        console.log('✅ Contact form emails sent:', {
            admin: adminInfo.messageId,
            customer: customerInfo.messageId
        });

        return {
            success: true,
            messageIds: {
                admin: adminInfo.messageId,
                customer: customerInfo.messageId
            }
        };
    } catch (error) {
        console.error('❌ Error sending contact form email:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Send Custom Order Notification Email
const sendCustomOrderNotification = async (customOrder, userEmail, userName) => {
    try {
        const transporter = createTransporter();

        const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .custom-badge {
            display: inline-block;
            background: #7C3AED;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: bold;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 Custom Order Received!</h1>
    </div>
    
    <div class="content">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>We've received your custom design request and our team is reviewing it.</p>
        
        <div style="text-align: center;">
            <div class="custom-badge">Order #${customOrder._id.toString().slice(-8).toUpperCase()}</div>
        </div>
        
        <p><strong>Product:</strong> ${customOrder.product?.name || 'Custom Product'}</p>
        <p><strong>Quantity:</strong> ${customOrder.quantity}</p>
        <p><strong>Print Location:</strong> ${customOrder.customization?.printLocation}</p>
        <p><strong>Status:</strong> ${customOrder.status}</p>
        
        <p>We'll contact you within 24-48 hours to confirm the details and provide a quote.</p>
        <p>Thank you for choosing TOPIA!</p>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: `"TOPIA E-Commerce" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Custom Order Received #${customOrder._id.toString().slice(-8).toUpperCase()}`,
            html: emailHTML
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Custom order notification sent:', info.messageId);

        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error('❌ Error sending custom order notification:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Send Custom Order Status Update Email  
const sendCustomOrderStatusUpdate = async (customOrder, userEmail, userName, newStatus) => {
    try {
        const transporter = createTransporter();

        const statusMessages = {
            'Pending Review': 'Your custom order is being reviewed by our design team.',
            'Approved': 'Great news! Your custom order has been approved.',
            'In Production': 'Your custom order is being produced.',
            'Completed': 'Your custom order is ready!',
            'Rejected': 'We regret that we cannot proceed with this custom order.'
        };

        const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .status-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: bold;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 Custom Order Update</h1>
    </div>
    
    <div class="content">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>${statusMessages[newStatus] || 'Your custom order status has been updated.'}</p>
        
        <div style="text-align: center;">
            <div class="status-badge">${newStatus}</div>
        </div>
        
      <p><strong>Order ID:</strong> #${customOrder._id.toString().slice(-8).toUpperCase()}</p>
        ${customOrder.estimatedCompletionDate ? `<p><strong>Estimated Completion:</strong> ${new Date(customOrder.estimatedCompletionDate).toLocaleDateString()}</p>` : ''}
        
        <p>Thank you for your patience!</p>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: `"TOPIA E-Commerce" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Custom Order Update: ${newStatus} - #${customOrder._id.toString().slice(-8).toUpperCase()}`,
            html: emailHTML
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Custom order status update sent:', info.messageId);

        return {
            success: true,
            messageId: info.messageId
        };
    } catch (error) {
        console.error('❌ Error sending custom order status update:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    sendOrderConfirmationEmail,
    sendOrderStatusEmail,
    sendContactFormEmail,
    sendCustomOrderNotification,
    sendCustomOrderStatusUpdate
};
