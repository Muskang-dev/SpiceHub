const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { MenuItem, Review, Wishlist } = require('../models');
const { protect } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/menu
router.get('/', async (req, res) => {
  try {
    const { category, veg, search, featured } = req.query;
    const q = { isAvailable: true };
    if (category) q.category = category;
    if (veg === 'true') q.isVeg = true;
    if (featured === 'true') q.isFeatured = true;
    if (search) q.name = { $regex: search, $options: 'i' };
    const items = await MenuItem.find(q).sort({ category: 1 });
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/menu/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    const reviews = await Review.find({ menuItem: req.params.id }).populate('user', 'name').sort({ createdAt: -1 });
    const related = await MenuItem.find({ category: item.category, _id: { $ne: item._id }, isAvailable: true }).limit(4);
    res.json({ item, reviews, related });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
