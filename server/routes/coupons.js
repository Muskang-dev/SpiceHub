const router = require('express').Router();
const { Coupon } = require('../models');
const { protect } = require('../middleware/auth');
router.get('/', protect, async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});
module.exports = router;
