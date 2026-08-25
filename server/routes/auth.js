const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { protect } = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered.' });
    const user = await User.create({ name, email, password, phone });
    res.status(201).json({ token: sign(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role, loyaltyPoints: user.loyaltyPoints } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid email or password.' });
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated. Contact support.' });
    res.json({ token: sign(user._id), user: { _id: user._id, name: user.name, email: user.email, role: user.role, loyaltyPoints: user.loyaltyPoints } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

module.exports = router;
