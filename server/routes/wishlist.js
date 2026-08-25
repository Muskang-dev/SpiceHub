const router = require('express').Router();
const { Wishlist } = require('../models');
const { protect } = require('../middleware/auth');
router.get('/', protect, async (req, res) => {
  const w = await Wishlist.findOne({ user: req.user._id }).populate('items');
  res.json(w ? w.items : []);
});
router.post('/toggle/:id', protect, async (req, res) => {
  let w = await Wishlist.findOne({ user: req.user._id });
  let added = false;
  if (!w) { w = await Wishlist.create({ user: req.user._id, items: [req.params.id] }); added = true; }
  else {
    const idx = w.items.map(i => i.toString()).indexOf(req.params.id);
    if (idx === -1) { w.items.push(req.params.id); added = true; } else { w.items.splice(idx, 1); }
    await w.save();
  }
  res.json({ success: true, added });
});
module.exports = router;
