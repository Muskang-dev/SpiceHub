require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
// CLIENT_URL may be a single origin or a comma-separated list (e.g. for
// staging + production frontends). Falls back to allowing all origins if unset,
// so the API doesn't silently 500 on CORS if the env var is missing.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB Error:', err));

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/menu',     require('./routes/menu'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/reviews',  require('./routes/reviews'));
app.use('/api/coupons',  require('./routes/coupons'));
app.use('/api/admin',    require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: '🌶 SpiceHub API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🍛 SpiceHub API → http://localhost:${PORT}`));
