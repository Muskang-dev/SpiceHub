const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { MenuItem, Order, Booking, User, Coupon, Review } = require('../models');
const { protect, adminOnly } = require('../middleware/auth');

const upload = multer({ storage: multer.diskStorage({ destination: (req,file,cb)=>cb(null,path.join(__dirname,'../uploads')), filename:(req,file,cb)=>cb(null,Date.now()+path.extname(file.originalname)) }) });

router.use(protect, adminOnly);

// Dashboard stats
router.get('/stats', async (req, res) => {
  const [menuCount, orderCount, bookingCount, userCount, recentOrders, pendingBookings] = await Promise.all([
    MenuItem.countDocuments(), Order.countDocuments(), Booking.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    Booking.find({ status: 'Pending' }).sort({ date: 1 }).limit(5)
  ]);
  const rev = await Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]);
  res.json({ menuCount, orderCount, bookingCount, userCount, revenue: rev[0]?.total || 0, recentOrders, pendingBookings });
});

// Analytics
router.get('/analytics', async (req, res) => {
  const ago30 = new Date(); ago30.setDate(ago30.getDate() - 30);
  const ago12m = new Date(); ago12m.setMonth(ago12m.getMonth() - 12);
  const [daily, monthly, topItems, byStatus, byCat] = await Promise.all([
    Order.aggregate([{ $match: { status:{$ne:'Cancelled'}, createdAt:{$gte:ago30} } }, { $group: { _id:{$dateToString:{format:'%Y-%m-%d',date:'$createdAt'}}, revenue:{$sum:'$totalAmount'}, count:{$sum:1} } }, {$sort:{_id:1}}]),
    Order.aggregate([{ $match: { status:{$ne:'Cancelled'}, createdAt:{$gte:ago12m} } }, { $group: { _id:{$dateToString:{format:'%Y-%m',date:'$createdAt'}}, revenue:{$sum:'$totalAmount'}, count:{$sum:1} } }, {$sort:{_id:1}}]),
    Order.aggregate([{$unwind:'$items'},{$group:{_id:'$items.name',totalQty:{$sum:'$items.qty'},totalRevenue:{$sum:{$multiply:['$items.price','$items.qty']}}}},{$sort:{totalQty:-1}},{$limit:8}]),
    Order.aggregate([{$group:{_id:'$status',count:{$sum:1}}}]),
    Order.aggregate([{$unwind:'$items'},{$lookup:{from:'menuitems',localField:'items.menuItem',foreignField:'_id',as:'m'}},{$unwind:{path:'$m',preserveNullAndEmptyArrays:true}},{$group:{_id:'$m.category',revenue:{$sum:{$multiply:['$items.price','$items.qty']}}}},{$sort:{revenue:-1}}])
  ]);
  res.json({ daily, monthly, topItems, byStatus, byCat });
});

// Menu CRUD
router.get('/menu', async (req, res) => res.json(await MenuItem.find().sort({ category: 1 })));
router.post('/menu', upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body, isVeg: req.body.isVeg==='true', isFeatured: req.body.isFeatured==='true', isAvailable: req.body.isAvailable==='true', price: parseFloat(req.body.price) };
    if (req.file) data.image = `/uploads/${req.file.filename}`;
    res.status(201).json(await MenuItem.create(data));
  } catch(e) { res.status(400).json({ message: e.message }); }
});
router.put('/menu/:id', upload.single('image'), async (req, res) => {
  const data = { ...req.body, isVeg: req.body.isVeg==='true', isFeatured: req.body.isFeatured==='true', isAvailable: req.body.isAvailable==='true', price: parseFloat(req.body.price) };
  if (req.file) data.image = `/uploads/${req.file.filename}`;
  res.json(await MenuItem.findByIdAndUpdate(req.params.id, data, { new: true }));
});
router.delete('/menu/:id', async (req, res) => { await MenuItem.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted.' }); });

// Orders
router.get('/orders', async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  res.json(await Order.find(filter).sort({ createdAt: -1 }).populate('user', 'name email'));
});
router.put('/orders/:id/status', async (req, res) => res.json(await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })));
router.get('/orders/:id/invoice', async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user','name email');
  const { generateInvoicePDF } = require('../utils/pdf');
  generateInvoicePDF(order, res, 'invoice');
});
router.get('/orders/:id/kitchen-ticket', async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user','name');
  const { generateKitchenTicketPDF } = require('../utils/pdf');
  generateKitchenTicketPDF(order, res);
});

// Bookings
router.get('/bookings', async (req, res) => res.json(await Booking.find().sort({ date: 1 }).populate('user','name email')));
router.put('/bookings/:id/status', async (req, res) => res.json(await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })));

// Customers
router.get('/customers', async (req, res) => {
  const { search } = req.query;
  const filter = { role: 'user' };
  if (search) filter.$or = [{ name:{$regex:search,$options:'i'} }, { email:{$regex:search,$options:'i'} }];
  const customers = await User.find(filter).sort({ createdAt: -1 });
  const data = await Promise.all(customers.map(async c => ({ ...c.toObject(), orderCount: await Order.countDocuments({ user: c._id }) })));
  res.json(data);
});
router.get('/customers/:id', async (req, res) => {
  const customer = await User.findById(req.params.id);
  const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
  const reviews = await Review.find({ user: req.params.id }).populate('menuItem','name');
  res.json({ customer, orders, reviews });
});
router.put('/customers/:id/toggle', async (req, res) => {
  const u = await User.findById(req.params.id);
  res.json(await User.findByIdAndUpdate(req.params.id, { isActive: !u.isActive }, { new: true }));
});

// Coupons
router.get('/coupons', async (req, res) => res.json(await Coupon.find().sort({ createdAt: -1 })));
router.post('/coupons', async (req, res) => {
  try { res.status(201).json(await Coupon.create(req.body)); }
  catch(e) { res.status(400).json({ message: e.code===11000 ? 'Code already exists.' : e.message }); }
});
router.put('/coupons/:id', async (req, res) => res.json(await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/coupons/:id', async (req, res) => { await Coupon.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted.' }); });

// Reviews
router.get('/reviews', async (req, res) => res.json(await Review.find().sort({ createdAt: -1 }).populate('user','name').populate('menuItem','name')));
router.delete('/reviews/:id', async (req, res) => { await Review.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted.' }); });

module.exports = router;
