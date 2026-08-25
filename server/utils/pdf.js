const PDFDocument = require('pdfkit');

/**
 * Generate an invoice/receipt PDF for an order
 * @param {Object} order - Populated Mongoose order document
 * @param {Object} res   - Express response (to pipe into) OR null to return buffer
 * @param {String} type  - 'confirmation' | 'invoice'
 */
function generateInvoicePDF(order, res, type = 'invoice') {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  if (res) {
    const filename = `spicehub-${type}-${order._id.toString().slice(-6).toUpperCase()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);
  }

  const primaryColor = '#e05c2a';
  const darkColor = '#1a1a2e';
  const grayColor = '#6b7280';
  const lightGray = '#f3f4f6';
  const pageWidth = doc.page.width - 100; // accounting for margins

  // ── Header ──
  doc.rect(0, 0, doc.page.width, 120).fill(darkColor);

  doc.fillColor('#ffffff')
     .font('Helvetica-Bold')
     .fontSize(28)
     .text('SpiceHub', 50, 35);

  doc.fillColor(primaryColor)
     .font('Helvetica')
     .fontSize(11)
     .text('Authentic Indian Cuisine', 50, 68);

  doc.fillColor('rgba(255,255,255,0.7)')
     .fontSize(9)
     .text('42, Spice Lane, New Delhi – 110001', 50, 85)
     .text('+91 98765 43210  |  hello@spicehub.in', 50, 98);

  // Invoice label (top right)
  const label = type === 'confirmation' ? 'ORDER CONFIRMATION' : 'INVOICE';
  doc.fillColor('#ffffff')
     .font('Helvetica-Bold')
     .fontSize(14)
     .text(label, 0, 45, { align: 'right', width: doc.page.width - 50 });

  doc.fillColor('rgba(255,255,255,0.7)')
     .font('Helvetica')
     .fontSize(9)
     .text(`#${order._id.toString().slice(-6).toUpperCase()}`, 0, 65, { align: 'right', width: doc.page.width - 50 });

  doc.moveDown(5);

  // ── Info Row ──
  const infoY = 145;
  doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(10);

  // Left: Bill To
  doc.text('BILL TO', 50, infoY);
  doc.fillColor(grayColor).font('Helvetica').fontSize(10);
  doc.text(order.user ? order.user.name : 'Customer', 50, infoY + 16);
  doc.text(order.user ? order.user.email : '', 50, infoY + 30);
  doc.text(order.phone, 50, infoY + 44);

  // Center: Delivery Address
  doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(10);
  doc.text('DELIVERY ADDRESS', 220, infoY);
  doc.fillColor(grayColor).font('Helvetica').fontSize(9);
  const addrLines = order.deliveryAddress.match(/.{1,35}/g) || [order.deliveryAddress];
  addrLines.slice(0, 3).forEach((line, i) => {
    doc.text(line, 220, infoY + 16 + i * 13);
  });

  // Right: Order Details
  doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(10);
  doc.text('ORDER DETAILS', 430, infoY);
  doc.fillColor(grayColor).font('Helvetica').fontSize(9);
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  doc.text(`Date: ${orderDate}`, 430, infoY + 16);
  doc.text(`Status: ${order.status}`, 430, infoY + 29);
  doc.text(`Payment: ${order.paymentMethod}`, 430, infoY + 42);
  if (order.scheduledFor) {
    const sched = new Date(order.scheduledFor).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    doc.text(`Scheduled: ${sched}`, 430, infoY + 55);
  }

  // Divider
  doc.moveDown(0.5);
  doc.moveTo(50, infoY + 80).lineTo(doc.page.width - 50, infoY + 80).strokeColor('#e5e7eb').lineWidth(1).stroke();

  // ── Items Table ──
  const tableTop = infoY + 100;
  const colWidths = { item: 230, qty: 60, price: 90, total: 90 };
  const cols = { item: 50, qty: 290, price: 360, total: 460 };

  // Table header
  doc.rect(50, tableTop, pageWidth, 28).fill(primaryColor);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
  doc.text('ITEM', cols.item + 8, tableTop + 9);
  doc.text('QTY', cols.qty, tableTop + 9, { width: colWidths.qty, align: 'center' });
  doc.text('UNIT PRICE', cols.price, tableTop + 9, { width: colWidths.price, align: 'right' });
  doc.text('TOTAL', cols.total, tableTop + 9, { width: colWidths.total, align: 'right' });

  // Table rows
  let rowY = tableTop + 28;
  order.items.forEach((item, idx) => {
    const rowBg = idx % 2 === 0 ? '#ffffff' : '#fdf8f5';
    doc.rect(50, rowY, pageWidth, 30).fill(rowBg);

    doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(9);
    doc.text(item.name, cols.item + 8, rowY + 10, { width: colWidths.item - 16 });

    doc.fillColor(grayColor).font('Helvetica').fontSize(9);
    doc.text(item.qty.toString(), cols.qty, rowY + 10, { width: colWidths.qty, align: 'center' });
    doc.text(`Rs. ${item.price.toFixed(2)}`, cols.price, rowY + 10, { width: colWidths.price, align: 'right' });

    doc.fillColor(darkColor).font('Helvetica-Bold');
    doc.text(`Rs. ${(item.price * item.qty).toFixed(2)}`, cols.total, rowY + 10, { width: colWidths.total, align: 'right' });

    rowY += 30;
  });

  // Table bottom border
  doc.moveTo(50, rowY).lineTo(doc.page.width - 50, rowY).strokeColor('#e5e7eb').lineWidth(0.5).stroke();

  // ── Totals Block ──
  const totalsX = 360;
  let totalsY = rowY + 20;

  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.05;

  const drawTotalRow = (label, value, bold = false, color = grayColor) => {
    doc.fillColor(grayColor).font('Helvetica').fontSize(9).text(label, totalsX, totalsY);
    doc.fillColor(color).font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 10 : 9)
       .text(value, 0, totalsY, { align: 'right', width: doc.page.width - 50 });
    totalsY += 18;
  };

  drawTotalRow('Subtotal', `Rs. ${subtotal.toFixed(2)}`);
  drawTotalRow('GST (5%)', `Rs. ${tax.toFixed(2)}`);

  if (order.discountAmount > 0) {
    drawTotalRow(`Coupon (${order.couponCode || ''})`, `- Rs. ${order.discountAmount.toFixed(2)}`, false, '#16a34a');
  }
  if (order.loyaltyPointsUsed > 0) {
    drawTotalRow('Loyalty Points', `- Rs. ${order.loyaltyPointsUsed.toFixed(2)}`, false, '#16a34a');
  }

  // Total divider
  doc.moveTo(totalsX, totalsY).lineTo(doc.page.width - 50, totalsY).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
  totalsY += 10;

  // Grand total
  doc.rect(totalsX, totalsY, doc.page.width - 50 - totalsX, 32).fill(darkColor);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text('GRAND TOTAL', totalsX + 10, totalsY + 10);
  doc.text(`Rs. ${order.totalAmount.toFixed(2)}`, 0, totalsY + 10, { align: 'right', width: doc.page.width - 50 });
  totalsY += 32;

  // ── Loyalty Points Earned ──
  if (order.loyaltyPointsEarned > 0) {
    totalsY += 12;
    doc.rect(50, totalsY, pageWidth, 28).fill('#fef3c7');
    doc.fillColor('#92400e').font('Helvetica-Bold').fontSize(9)
       .text(`★ You earned ${order.loyaltyPointsEarned} loyalty points on this order!`, 60, totalsY + 9);
    totalsY += 28;
  }

  // ── Notes ──
  if (order.notes) {
    totalsY += 16;
    doc.fillColor(darkColor).font('Helvetica-Bold').fontSize(9).text('SPECIAL INSTRUCTIONS', 50, totalsY);
    doc.fillColor(grayColor).font('Helvetica').fontSize(9).text(order.notes, 50, totalsY + 14);
    totalsY += 40;
  }

  // ── Footer ──
  const footerY = doc.page.height - 80;
  doc.rect(0, footerY, doc.page.width, 80).fill(lightGray);
  doc.fillColor(grayColor).font('Helvetica').fontSize(8).text(
    'Thank you for dining with SpiceHub! For any issues, contact hello@spicehub.in or call +91 98765 43210.',
    50, footerY + 15, { align: 'center', width: pageWidth }
  );
  doc.fillColor(primaryColor).fontSize(8).text(
    'www.spicehub.in  |  Powered by SpiceHub',
    50, footerY + 32, { align: 'center', width: pageWidth }
  );

  const year = new Date().getFullYear();
  doc.fillColor(grayColor).fontSize(7)
     .text(`© ${year} SpiceHub. All rights reserved. This is a computer-generated document.`,
       50, footerY + 50, { align: 'center', width: pageWidth });

  doc.end();
  return doc;
}

// Kitchen ticket (smaller, thermal-printer style)
function generateKitchenTicketPDF(order, res) {
  const doc = new PDFDocument({ margin: 20, size: [226, 600] }); // 80mm thermal width

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="kitchen-ticket-${order._id.toString().slice(-6).toUpperCase()}.pdf"`);
  doc.pipe(res);

  const W = doc.page.width - 40;

  // Header
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#000').text('SpiceHub', 20, 20, { align: 'center', width: W });
  doc.font('Helvetica').fontSize(8).fillColor('#555').text('Kitchen Order Ticket', 20, 38, { align: 'center', width: W });

  doc.moveTo(20, 54).lineTo(doc.page.width - 20, 54).dash(2, { space: 2 }).stroke();

  // Order meta
  doc.undash();
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#000')
     .text(`ORDER #${order._id.toString().slice(-6).toUpperCase()}`, 20, 62, { align: 'center', width: W });

  const now = new Date();
  doc.font('Helvetica').fontSize(8).fillColor('#555')
     .text(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), 20, 78, { align: 'center', width: W });

  if (order.scheduledFor) {
    const sched = new Date(order.scheduledFor).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#e05c2a')
       .text(`SCHEDULED: ${sched}`, 20, 92, { align: 'center', width: W });
  }

  doc.moveTo(20, 108).lineTo(doc.page.width - 20, 108).stroke();

  // Items
  let y = 118;
  order.items.forEach(item => {
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#000').text(`x${item.qty}`, 20, y);
    doc.font('Helvetica-Bold').fontSize(10).text(item.name, 45, y, { width: W - 25 });
    y += 22;
  });

  doc.moveTo(20, y + 4).lineTo(doc.page.width - 20, y + 4).dash(2, { space: 2 }).stroke();
  y += 14;

  if (order.notes) {
    doc.undash();
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#e05c2a').text('NOTE:', 20, y);
    y += 12;
    doc.font('Helvetica').fontSize(8).fillColor('#000').text(order.notes, 20, y, { width: W });
    y += 24;
  }

  doc.font('Helvetica').fontSize(8).fillColor('#555').text('— SpiceHub Kitchen —', 20, y + 10, { align: 'center', width: W });

  doc.end();
  return doc;
}

module.exports = { generateInvoicePDF, generateKitchenTicketPDF };
