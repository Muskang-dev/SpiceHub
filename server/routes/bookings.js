const router = require('express').Router();
const { Booking } = require('../models');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).sort({ date: -1 });
  res.json(bookings);
});
router.post('/', protect, async (req, res) => {
  try {
    const booking = await Booking.create({ ...req.body, user: req.user._id });
    res.status(201).json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.put('/:id/cancel', protect, async (req, res) => {
  await Booking.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { status: 'Cancelled' });
  res.json({ message: 'Booking cancelled.' });
});
module.exports = router;
