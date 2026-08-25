const router = require('express').Router();
const { Order, User, Coupon, Review, MenuItem } = require('../models');
const { protect } = require('../middleware/auth');

// GET /api/orders
router.get('/', protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  const reviews = await Review.find({ user: req.user._id });
  const reviewedKeys = reviews.map(r => `${r.order}-${r.menuItem}`);
  res.json({ orders, reviewedKeys });
});

// POST /api/orders/apply-coupon
router.post('/apply-coupon', protect, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.json({ success: false, message: 'Invalid coupon code.' });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.json({ success: false, message: 'Coupon expired.' });
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return res.json({ success: false, message: 'Usage limit reached.' });
    if (coupon.usedBy.map(id => id.toString()).includes(req.user._id.toString())) return res.json({ success: false, message: 'Already used this coupon.' });
    if (subtotal < coupon.minOrderAmount) return res.json({ success: false, message: `Min order ₹${coupon.minOrderAmount} required.` });
    let discount = coupon.discountType === 'flat' ? Math.min(coupon.discountValue, subtotal) : (subtotal * coupon.discountValue) / 100;
    if (coupon.discountType === 'percent' && coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    res.json({ success: true, discount: Math.round(discount * 100) / 100, message: `Saved ₹${discount.toFixed(2)}!` });
  } catch (err) { res.json({ success: false, message: 'Error applying coupon.' }); }
});

// POST /api/orders
router.post('/', protect, async (req, res) => {
  try {
    const { items, deliveryAddress, phone, paymentMethod, notes, couponCode, discountAmount, scheduledFor, usePoints } = req.body;
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * 0.05;
    const discount = parseFloat(discountAmount) || 0;
    const userDoc = await User.findById(req.user._id);
    let pointsUsed = 0;
    if (usePoints && userDoc.loyaltyPoints > 0) pointsUsed = Math.min(userDoc.loyaltyPoints, Math.floor(subtotal + tax - discount));
    const totalAmount = Math.max(0, subtotal + tax - discount - pointsUsed);
    const pointsEarned = Math.floor(totalAmount / 10);
    const order = await Order.create({ user: req.user._id, items, totalAmount, deliveryAddress, phone, paymentMethod, notes, couponCode: couponCode || null, discountAmount: discount + pointsUsed, loyaltyPointsUsed: pointsUsed, loyaltyPointsEarned: pointsEarned, scheduledFor: scheduledFor ? new Date(scheduledFor) : null });
    if (couponCode && discount > 0) await Coupon.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 }, $push: { usedBy: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: pointsEarned - pointsUsed, totalSpent: totalAmount } });
    res.status(201).json({ order, pointsEarned });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/orders/:orderId/review/:itemId
router.post('/:orderId/review/:itemId', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
    if (!order || order.status !== 'Delivered') return res.status(400).json({ message: 'Can only review delivered orders.' });
    await Review.create({ menuItem: req.params.itemId, user: req.user._id, order: req.params.orderId, rating: parseInt(rating), comment });
    const allReviews = await Review.find({ menuItem: req.params.itemId });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await MenuItem.findByIdAndUpdate(req.params.itemId, { avgRating: parseFloat(avg.toFixed(1)), reviewCount: allReviews.length });
    res.status(201).json({ message: 'Review submitted!' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Already reviewed.' });
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id/invoice (PDF)
router.get('/:id/invoice', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    const { generateInvoicePDF } = require('../utils/pdf');
    generateInvoicePDF(order, res, order.status === 'Delivered' ? 'invoice' : 'confirmation');
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
