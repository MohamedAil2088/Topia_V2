const PDFDocument = require('pdfkit');

/**
 * Generates a Highly Professional PDF invoice buffer for an order.
 * @param {Object} order The order object
 * @returns {Promise<Buffer>}
 */
const generateInvoiceBuffer = (order) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            info: {
                Title: `Invoice ${order._id}`,
                Author: 'TOPIA Men\'s Fashion',
            }
        });

        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });

        // --- Header Section ---
        // Blue/Purple Accent Bar at the top
        doc.rect(0, 0, 595, 20).fill('#667eea');

        // Logo / Brand Name
        doc.fillColor('#1a202c').font('Helvetica-Bold').fontSize(28).text('TOPIA', 50, 50, { letterSpacing: 2 });
        doc.fontSize(10).font('Helvetica').fillColor('#718096').text('PREMIUM MEN\'S FASHION', 50, 75);

        // Invoice Label
        doc.fillColor('#1a202c').font('Helvetica-Bold').fontSize(20).text('INVOICE', 400, 50, { align: 'right' });
        doc.fontSize(10).font('Helvetica').fillColor('#718096').text(`Order ID: #${order._id.toString().slice(-8).toUpperCase()}`, 400, 75, { align: 'right' });
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 90, { align: 'right' });

        doc.moveTo(50, 120).lineTo(545, 120).strokeColor('#edf2f7').lineWidth(1).stroke();

        // --- Customer & Company Info ---
        const infoTop = 140;
        doc.fillColor('#4a5568').font('Helvetica-Bold').fontSize(10).text('BILL TO:', 50, infoTop);
        doc.fillColor('#1a202c').font('Helvetica-Bold').fontSize(11).text(order.user?.name || order.guestInfo?.name || 'Customer', 50, infoTop + 15);
        doc.font('Helvetica').fillColor('#4a5568').text(order.shippingAddress.address, 50, infoTop + 30);
        doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.country}`, 50, infoTop + 45);
        doc.text(`Phone: ${order.shippingAddress.phone || order.guestInfo?.phone || 'N/A'}`, 50, infoTop + 60);

        doc.fillColor('#4a5568').font('Helvetica-Bold').fontSize(10).text('FROM:', 350, infoTop);
        doc.fillColor('#1a202c').font('Helvetica-Bold').fontSize(11).text('TOPIA E-Commerce', 350, infoTop + 15);
        doc.font('Helvetica').fillColor('#4a5568').text('Cairo, Egypt', 350, infoTop + 30);
        doc.text('support@topia.com', 350, infoTop + 45);
        doc.text('www.topia-fashion.com', 350, infoTop + 60);

        // --- Table Section ---
        const tableTop = 240;

        // Table Header Background
        doc.rect(50, tableTop, 495, 25).fill('#f7fafc');

        doc.fillColor('#4a5568').font('Helvetica-Bold').fontSize(9);
        doc.text('PRODUCT DESCRIPTION', 60, tableTop + 8);
        doc.text('QTY', 300, tableTop + 8, { width: 40, align: 'center' });
        doc.text('UNIT PRICE', 360, tableTop + 8, { width: 80, align: 'right' });
        doc.text('LINE TOTAL', 460, tableTop + 8, { width: 80, align: 'right' });

        // Items
        let currentY = tableTop + 35;
        doc.font('Helvetica').fontSize(10).fillColor('#2d3748');

        order.orderItems.forEach((item, index) => {
            // Alternating backgrounds for rows
            if (index % 2 === 0) {
                doc.rect(50, currentY - 5, 495, 25).fill('#ffffff');
            }

            doc.fillColor('#2d3748').text(item.name, 60, currentY, { width: 230 });
            doc.text(item.qty.toString(), 300, currentY, { width: 40, align: 'center' });
            doc.text(`${item.price.toFixed(2)} EGP`, 360, currentY, { width: 80, align: 'right' });
            doc.text(`${(item.price * item.qty).toFixed(2)} EGP`, 460, currentY, { width: 80, align: 'right' });

            currentY += 25;

            // Draw a very thin line after each item
            doc.moveTo(50, currentY - 5).lineTo(545, currentY - 5).strokeColor('#f7fafc').lineWidth(0.5).stroke();
        });

        // --- Totals Section ---
        const totalsY = currentY + 20;
        const totalX = 350;

        doc.fontSize(10).fillColor('#718096').font('Helvetica');
        doc.text('Subtotal:', totalX, totalsY);
        doc.fillColor('#2d3748').text(`${order.itemsPrice.toFixed(2)} EGP`, 460, totalsY, { width: 80, align: 'right' });

        doc.text('Shipping:', totalX, totalsY + 20);
        doc.text(`${order.shippingPrice.toFixed(2)} EGP`, 460, totalsY + 20, { width: 80, align: 'right' });

        if (order.discountPrice > 0) {
            doc.fillColor('#38a169').text('Discount:', totalX, totalsY + 40);
            doc.text(`-${order.discountPrice.toFixed(2)} EGP`, 460, totalsY + 40, { width: 80, align: 'right' });
        }

        doc.rect(totalX, totalsY + 60, 195, 35).fill('#f7fafc');
        doc.fontSize(12).fillColor('#667eea').font('Helvetica-Bold').text('TOTAL AMOUNT:', totalX + 10, totalsY + 72);
        doc.text(`${order.totalPrice.toFixed(2)} EGP`, 460, totalsY + 72, { width: 80, align: 'right' });

        // --- Payment Status Stamp ---
        if (order.isPaid) {
            doc.save();
            doc.rotate(-20, { origin: [100, totalsY + 50] });
            doc.rect(70, totalsY + 40, 100, 30).lineWidth(2).strokeColor('#38a169').stroke();
            doc.fillColor('#38a169').font('Helvetica-Bold').fontSize(14).text('PAID', 70, totalsY + 48, { width: 100, align: 'center' });
            doc.restore();
        }

        // --- Footer ---
        doc.fillColor('#a0aec0').font('Helvetica').fontSize(8).text('Thank you for choosing TOPIA. We appreciate your business!', 50, 750, { align: 'center' });
        doc.text('If you have any questions about this invoice, please contact support@topia.com', 50, 762, { align: 'center' });

        doc.end();
    });
};

module.exports = { generateInvoiceBuffer };
