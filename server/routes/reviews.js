const router = require('express').Router();
const { Review, Coupon } = require('../models');
const { protect } = require('../middleware/auth');
router.get('/menu/:id', async (req, res) => {
  const reviews = await Review.find({ menuItem: req.params.id }).populate('user','name').sort({ createdAt: -1 });
  res.json(reviews);
});
module.exports = router;
