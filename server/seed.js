require('dotenv').config();
const mongoose = require('mongoose');

const MenuItem = require('./models').MenuItem;
const User     = require('./models').User;
const Coupon   = require('./models').Coupon;
const Order    = require('./models').Order;
const Booking  = require('./models').Booking;
const Review   = require('./models').Review;
const Wishlist = require('./models').Wishlist;

// ─────────────────────────────────────────────
// MENU ITEMS
// ─────────────────────────────────────────────
const menuItems = [
  // Starters
  { name: 'Paneer Tikka',         description: 'Marinated cottage cheese cubes grilled in a tandoor with bell peppers and onions. Served with mint chutney.',        price: 280, category: 'Starters',      isVeg: true,  isFeatured: true,  spiceLevel: 'Medium',     avgRating: 4.6, reviewCount: 14, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80' },
  { name: 'Chicken Seekh Kebab',  description: 'Minced chicken mixed with aromatic spices and herbs, hand-skewered and grilled over charcoal to perfection.',        price: 320, category: 'Starters',      isVeg: false, isFeatured: false, spiceLevel: 'Hot',        avgRating: 4.4, reviewCount: 9,  image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80' },
  { name: 'Samosa (2 pcs)',       description: 'Crispy golden pastry filled with spiced potatoes and peas. Served with mint chutney and tamarind sauce.',             price: 80,  category: 'Starters',      isVeg: true,  isFeatured: false, spiceLevel: 'Mild',       avgRating: 4.2, reviewCount: 21, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
  { name: 'Veg Spring Rolls',     description: 'Crispy rolls stuffed with stir-fried vegetables, cabbage and glass noodles. Served with sweet chilli sauce.',         price: 160, category: 'Starters',      isVeg: true,  isFeatured: false, spiceLevel: 'Mild',       avgRating: 4.0, reviewCount: 6,  image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400&q=80' },
  { name: 'Hara Bhara Kebab',     description: 'Soft patties of fresh spinach, green peas and paneer with a golden crispy outer crust. A healthy indulgence.',       price: 200, category: 'Starters',      isVeg: true,  isFeatured: false, spiceLevel: 'Mild',       avgRating: 4.1, reviewCount: 5,  image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80' },
  { name: 'Tandoori Chicken',     description: 'Whole chicken marinated overnight in yoghurt and spices, roasted in a clay tandoor. A timeless classic.',             price: 420, category: 'Starters',      isVeg: false, isFeatured: true,  spiceLevel: 'Medium',     avgRating: 4.7, reviewCount: 18, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80' },
  // Main Course
  { name: 'Butter Chicken',       description: 'Tender chicken pieces in a rich, velvety tomato-cream gravy finished with butter and kasuri methi. The all-time favourite.', price: 380, category: 'Main Course', isVeg: false, isFeatured: true, spiceLevel: 'Medium', avgRating: 4.8, reviewCount: 32, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80' },
  { name: 'Dal Makhani',          description: 'Slow-cooked whole black lentils in a buttery tomato sauce, simmered overnight for extraordinary depth of flavour.',   price: 260, category: 'Main Course', isVeg: true,  isFeatured: true,  spiceLevel: 'Mild',   avgRating: 4.5, reviewCount: 19, image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400&q=80' },
  { name: 'Palak Paneer',         description: 'Fresh cottage cheese cubes in a velvety, spiced spinach gravy with a touch of cream and whole spices.',                price: 290, category: 'Main Course', isVeg: true,  isFeatured: false, spiceLevel: 'Medium', avgRating: 4.3, reviewCount: 11, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
  { name: 'Mutton Rogan Josh',    description: 'Slow-braised mutton in an aromatic Kashmiri gravy of whole spices, Kashmiri chilli and saffron. Deeply satisfying.',  price: 450, category: 'Main Course', isVeg: false, isFeatured: true,  spiceLevel: 'Hot',    avgRating: 4.7, reviewCount: 15, image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400&q=80' },
  { name: 'Chana Masala',         description: 'Hearty chickpeas cooked in a tangy, spiced tomato and onion gravy with amchur and garam masala.',                      price: 220, category: 'Main Course', isVeg: true,  isFeatured: false, spiceLevel: 'Medium', avgRating: 4.2, reviewCount: 8,  image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80' },
  { name: 'Chicken Kadai',        description: 'Succulent chicken cooked with capsicum, tomatoes and whole spices in a traditional iron wok over a high flame.',       price: 360, category: 'Main Course', isVeg: false, isFeatured: true,  spiceLevel: 'Hot',    avgRating: 4.6, reviewCount: 13, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80' },
  { name: 'Shahi Paneer',         description: 'Soft paneer cubes in a luxurious royal gravy of cashews, cream, saffron and aromatic spices. Fit for royalty.',       price: 310, category: 'Main Course', isVeg: true,  isFeatured: false, spiceLevel: 'Mild',   avgRating: 4.4, reviewCount: 10, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
  { name: 'Fish Curry',           description: 'Fresh river fish cooked in a tangy coconut and tomato gravy with curry leaves, mustard seeds and kokum.',              price: 400, category: 'Main Course', isVeg: false, isFeatured: false, spiceLevel: 'Hot',    avgRating: 4.3, reviewCount: 7,  image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=400&q=80' },
  // Breads
  { name: 'Butter Naan',          description: 'Soft leavened flatbread baked in a blazing tandoor and generously brushed with melted butter.',                        price: 60,  category: 'Breads',       isVeg: true,  isFeatured: false, spiceLevel: 'Mild',   avgRating: 4.3, reviewCount: 12, image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&q=80' },
  { name: 'Garlic Naan',          description: 'Tandoor-baked naan topped with fragrant roasted garlic and fresh coriander. Pairs perfectly with any curry.',          price: 70,  category: 'Breads',       isVeg: true,  isFeatured: false, spiceLevel: 'Mild',   avgRating: 4.4, reviewCount: 9,  image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80' },
  { name: 'Stuffed Paratha',      description: 'Whole wheat flatbread stuffed with spiced aloo or paneer filling, cooked on a griddle with butter. Served with pickle.',  price: 90, category: 'Breads', isVeg: true,  isFeatured: false, spiceLevel: 'Medium', avgRating: 4.2, reviewCount: 7,  image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80' },
  { name: 'Missi Roti',           description: 'Spiced flatbread made with gram flour and whole wheat, flavoured with fenugreek leaves, ajwain and chilli.',            price: 55,  category: 'Breads',       isVeg: true,  isFeatured: false, spiceLevel: 'Medium', avgRating: 4.0, reviewCount: 4,  image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80' },
  // Rice & Biryani
  { name: 'Chicken Biryani',      description: 'Fragrant dum-cooked basmati rice layered with spiced chicken, caramelised onions, mint and saffron. Served with raita.', price: 380, category: 'Rice & Biryani', isVeg: false, isFeatured: true, spiceLevel: 'Medium', avgRating: 4.9, reviewCount: 41, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
  { name: 'Veg Biryani',          description: 'Aromatic basmati rice slow-cooked dum-style with seasonal vegetables, whole spices and fried onions.',                  price: 280, category: 'Rice & Biryani', isVeg: true,  isFeatured: false, spiceLevel: 'Medium', avgRating: 4.2, reviewCount: 13, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&q=80' },
  { name: 'Mutton Biryani',       description: 'Slow-cooked tender mutton on the bone, layered with fragrant basmati rice, saffron milk and crispy fried onions.',     price: 480, category: 'Rice & Biryani', isVeg: false, isFeatured: true, spiceLevel: 'Hot',    avgRating: 4.8, reviewCount: 27, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80' },
  { name: 'Jeera Rice',           description: 'Light and fragrant basmati rice tempered with whole cumin seeds and clarified butter. Perfect with any curry.',          price: 120, category: 'Rice & Biryani', isVeg: true,  isFeatured: false, spiceLevel: 'Mild',   avgRating: 4.1, reviewCount: 6,  image: 'https://images.unsplash.com/photo-1536304993881-ff86e0c9c1c7?w=400&q=80' },
  // Desserts
  { name: 'Gulab Jamun (2 pcs)',  description: 'Soft milk-solid dumplings soaked in warm rose-flavoured sugar syrup. A classic Indian sweet served warm.',              price: 100, category: 'Desserts',     isVeg: true,  isFeatured: false, spiceLevel: 'Mild',   avgRating: 4.5, reviewCount: 16, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
  { name: 'Mango Kulfi',          description: 'Traditional Indian frozen dessert made with reduced whole milk and real Alphonso mango pulp. Served on a stick.',       price: 130, category: 'Desserts',     isVeg: true,  isFeatured: false, spiceLevel: 'Mild',   avgRating: 4.6, reviewCount: 11, image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=80' },
  { name: 'Rasmalai',             description: 'Delicate paneer dumplings served chilled in saffron and cardamom infused sweetened milk. Garnished with pistachios.',   price: 150, category: 'Desserts',     isVeg: true,  isFeatured: false, spiceLevel: 'Mild',   avgRating: 4.7, reviewCount: 9,  image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400&q=80' },
  { name: 'Kheer',                description: 'Slow-cooked creamy rice pudding with cardamom, saffron, rose water and a generous garnish of dry fruits.',              price: 110, category: 'Desserts',     isVeg: true,  isFeatured: false, spiceLevel: 'Mild',   avgRating: 4.3, reviewCount: 8,  image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },
  // Beverages
  { name: 'Mango Lassi',          description: 'Thick, chilled yoghurt blended with ripe Alphonso mangoes, a pinch of cardamom and a drizzle of rose syrup.',          price: 120, category: 'Beverages',    isVeg: true,  isFeatured: false, spiceLevel: 'Mild',   avgRating: 4.5, reviewCount: 14, image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80' },
  { name: 'Masala Chai',          description: 'Spiced Indian tea brewed strong with ginger, cardamom, cinnamon and cloves, finished with full-cream milk.',             price: 60,  category: 'Beverages',    isVeg: true,  isFeatured: false, spiceLevel: 'Mild',   avgRating: 4.4, reviewCount: 19, image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=400&q=80' },
  { name: 'Fresh Lime Soda',      description: 'Refreshing fizzy lime drink served sweet, salted or mixed. The ultimate summer cooler.',                                 price: 70,  category: 'Beverages',    isVeg: true,  isFeatured: false, spiceLevel: 'Mild',   avgRating: 4.2, reviewCount: 10, image: 'https://images.unsplash.com/photo-1523371054106-bbf80586c38c?w=400&q=80' },
  { name: 'Rose Sharbat',         description: 'Chilled rose syrup with cold milk and basil seeds. A fragrant, refreshing classic from the streets of Delhi.',          price: 90,  category: 'Beverages',    isVeg: true,  isFeatured: false, spiceLevel: 'Mild',   avgRating: 4.3, reviewCount: 7,  image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80' },
  { name: 'Thandai',              description: 'A traditional chilled Indian drink made with milk, mixed nuts, rose petals, cardamom and saffron. Festive and refreshing.', price: 110, category: 'Beverages', isVeg: true, isFeatured: false, spiceLevel: 'Mild',  avgRating: 4.5, reviewCount: 6,  image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80' },
];

// ─────────────────────────────────────────────
// COUPONS
// ─────────────────────────────────────────────
const coupons = [
  { code: 'WELCOME50',  description: 'Flat ₹50 off your first order',           discountType: 'flat',    discountValue: 50,  minOrderAmount: 200, isActive: true, expiresAt: new Date(Date.now() + 365*24*60*60*1000) },
  { code: 'SPICE20',    description: '20% off (max ₹150) on orders above ₹500', discountType: 'percent', discountValue: 20,  minOrderAmount: 500, maxDiscount: 150, usageLimit: 100, isActive: true, expiresAt: new Date(Date.now() + 180*24*60*60*1000) },
  { code: 'BIRYANI100', description: 'Flat ₹100 off on orders above ₹800',      discountType: 'flat',    discountValue: 100, minOrderAmount: 800, usageLimit: 50,  isActive: true, expiresAt: new Date(Date.now() + 90*24*60*60*1000) },
  { code: 'FESTIVAL30', description: '30% off (max ₹200) on orders above ₹300', discountType: 'percent', discountValue: 30,  minOrderAmount: 300, maxDiscount: 200, usageLimit: 200, isActive: true, expiresAt: new Date(Date.now() + 30*24*60*60*1000) },
  { code: 'FIRSTBITE',  description: 'Flat ₹75 off for new customers',          discountType: 'flat',    discountValue: 75,  minOrderAmount: 300, usageLimit: 500, isActive: true, expiresAt: new Date(Date.now() + 60*24*60*60*1000) },
];

// ─────────────────────────────────────────────
// SAMPLE USERS (realistic Indian names)
// ─────────────────────────────────────────────
const sampleUsers = [
  { name: 'Priya Sharma',    email: 'priya@example.com',   phone: '9876543201', loyaltyPoints: 240, totalSpent: 2400 },
  { name: 'Rahul Verma',     email: 'rahul@example.com',   phone: '9876543202', loyaltyPoints: 85,  totalSpent: 850  },
  { name: 'Ananya Reddy',    email: 'ananya@example.com',  phone: '9876543203', loyaltyPoints: 420, totalSpent: 4200 },
  { name: 'Kabir Mehta',     email: 'kabir@example.com',   phone: '9876543204', loyaltyPoints: 150, totalSpent: 1500 },
  { name: 'Sneha Nair',      email: 'sneha@example.com',   phone: '9876543205', loyaltyPoints: 310, totalSpent: 3100 },
  { name: 'Arjun Kapoor',    email: 'arjun@example.com',   phone: '9876543206', loyaltyPoints: 60,  totalSpent: 600  },
  { name: 'Diya Joshi',      email: 'diya@example.com',    phone: '9876543207', loyaltyPoints: 190, totalSpent: 1900 },
  { name: 'Vikram Singh',    email: 'vikram@example.com',  phone: '9876543208', loyaltyPoints: 530, totalSpent: 5300 },
];

// ─────────────────────────────────────────────
// REVIEW COMMENTS by star rating
// ─────────────────────────────────────────────
const reviewComments = {
  5: [
    'Absolutely amazing! Best Indian food in the city — will order again.',
    'The flavours were spot on. Rich, authentic and beautifully presented.',
    'Perfectly spiced and arrived hot. Highly recommend!',
    'Incredible food. My entire family loved every bite. 10/10!',
    null, // Some 5-star reviews have no comment
  ],
  4: [
    'Really good, very tasty. Portion size could be a little bigger.',
    'Great taste and quick delivery. Will definitely order again.',
    'Loved it! The gravy was rich and the naan was perfectly soft.',
    'Good quality food. Minor delay in delivery but worth the wait.',
    null,
  ],
  3: [
    'Decent food, nothing extraordinary. Expected a bit more spice.',
    'Okay experience. Food was good but arrived slightly cold.',
    'Average. The portion size was smaller than expected.',
  ],
  2: [
    'Disappointed with the spice level — too bland for my taste.',
    'Food was okay but not what I expected based on the description.',
  ],
};

function randomComment(rating) {
  const pool = reviewComments[rating] || reviewComments[3];
  return pool[Math.floor(Math.random() * pool.length)];
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─────────────────────────────────────────────
// MAIN SEED FUNCTION
// ─────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // ── Clear all collections ──
  await Promise.all([
    MenuItem.deleteMany({}),
    User.deleteMany({}),
    Coupon.deleteMany({}),
    Order.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Wishlist.deleteMany({}),
  ]);
  console.log('🗑  Cleared all collections');

  // ── Seed menu items ──
  const insertedItems = await MenuItem.insertMany(menuItems);
  console.log(`✅ Seeded ${insertedItems.length} menu items`);

  // ── Seed coupons ──
  await Coupon.insertMany(coupons);
  console.log(`✅ Seeded ${coupons.length} coupons`);

  // ── Create admin ──
  // NOTE: Do NOT pre-hash here. The User model's pre('save') hook hashes automatically.
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@spicehub.in',
    password: 'admin123',
    role: 'admin',
    loyaltyPoints: 0,
    totalSpent: 0
  });
  console.log(`✅ Admin created: admin@spicehub.in / admin123`);

  // ── Create sample users ──
  const userDocs = [];
  for (const u of sampleUsers) {
    // Plain password — model pre('save') hook will hash it
    const doc = await User.create({ ...u, password: 'password123', role: 'user', isActive: true });
    userDocs.push(doc);
  }
  console.log(`✅ Created ${userDocs.length} sample users (password: password123)`);

  // ── Seed orders (spread over last 30 days for analytics) ──
  const statuses = ['Delivered', 'Delivered', 'Delivered', 'Delivered', 'Preparing', 'Out for Delivery', 'Confirmed', 'Cancelled'];
  const addresses = [
    'Flat 4B, Sunrise Apartments, Connaught Place, New Delhi - 110001',
    'House 12, Green Park Extension, New Delhi - 110016',
    '301, Royal Residency, Lajpat Nagar II, New Delhi - 110024',
    'Plot 7, Sector 18, Noida, UP - 201301',
    'B-44, Defence Colony, New Delhi - 110024',
  ];

  const createdOrders = [];
  for (let i = 0; i < 45; i++) {
    const user = userDocs[randomBetween(0, userDocs.length - 1)];
    // pick 1–4 random items
    const itemCount = randomBetween(1, 4);
    const shuffled = [...insertedItems].sort(() => Math.random() - 0.5).slice(0, itemCount);
    const items = shuffled.map(m => ({ menuItem: m._id, name: m.name, price: m.price, qty: randomBetween(1, 3) }));
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * 0.05;
    const totalAmount = parseFloat((subtotal + tax).toFixed(2));
    const pointsEarned = Math.floor(totalAmount / 10);
    const status = statuses[randomBetween(0, statuses.length - 1)];
    const createdAt = daysAgo(randomBetween(0, 29));

    const order = await Order.create({
      user: user._id,
      items,
      totalAmount,
      deliveryAddress: addresses[randomBetween(0, addresses.length - 1)],
      phone: user.phone,
      paymentMethod: Math.random() > 0.4 ? 'Cash on Delivery' : 'Online',
      status,
      loyaltyPointsEarned: pointsEarned,
      discountAmount: 0,
      createdAt,
    });
    createdOrders.push({ order, user, items });
  }
  console.log(`✅ Seeded ${createdOrders.length} orders (spread over 30 days)`);

  // ── Seed reviews (only on Delivered orders) ──
  const deliveredOrders = createdOrders.filter(o => o.order.status === 'Delivered');
  let reviewCount = 0;
  const seenKeys = new Set();

  for (const { order, user, items } of deliveredOrders) {
    // Review 1–2 random items per order, not all
    const toReview = items.slice(0, randomBetween(1, Math.min(2, items.length)));
    for (const item of toReview) {
      const key = `${user._id}-${item.menuItem}`;
      if (seenKeys.has(key)) continue; // enforce unique index
      seenKeys.add(key);

      const rating = randomBetween(3, 5);
      const comment = randomComment(rating);
      try {
        await Review.create({
          menuItem: item.menuItem,
          user: user._id,
          order: order._id,
          rating,
          comment: comment || undefined,
          createdAt: new Date(order.createdAt.getTime() + 2 * 60 * 60 * 1000),
        });
        reviewCount++;
      } catch (e) { /* skip duplicate */ }
    }
  }
  console.log(`✅ Seeded ${reviewCount} reviews`);

  // ── Seed wishlists ──
  for (const user of userDocs) {
    const wishCount = randomBetween(2, 6);
    const wishItems = [...insertedItems].sort(() => Math.random() - 0.5).slice(0, wishCount);
    await Wishlist.create({ user: user._id, items: wishItems.map(i => i._id) });
  }
  console.log(`✅ Seeded wishlists for ${userDocs.length} users`);

  // ── Seed bookings ──
  const occasions = ['None', 'Birthday', 'Anniversary', 'Business', 'None', 'None'];
  const times = ['12:00 PM', '12:30 PM', '1:00 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM'];
  const bookingStatuses = ['Confirmed', 'Pending', 'Pending', 'Cancelled', 'Confirmed'];

  for (let i = 0; i < 18; i++) {
    const user = userDocs[randomBetween(0, userDocs.length - 1)];
    const daysOffset = randomBetween(-10, 20); // mix of past & future
    const date = daysAgo(-daysOffset);
    await Booking.create({
      user: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      date,
      time: times[randomBetween(0, times.length - 1)],
      guests: randomBetween(1, 8),
      occasion: occasions[randomBetween(0, occasions.length - 1)],
      status: bookingStatuses[randomBetween(0, bookingStatuses.length - 1)],
      createdAt: daysAgo(randomBetween(1, 15)),
    });
  }
  console.log(`✅ Seeded 18 reservations`);

  // ── Summary ──
  console.log('\n' + '─'.repeat(52));
  console.log('🌶  SpiceHub seed complete!\n');
  console.log('🔐  Admin login:');
  console.log('    Email    : admin@spicehub.in');
  console.log('    Password : admin123\n');
  console.log('👥  Sample user login (any of these):');
  sampleUsers.forEach(u => console.log(`    ${u.email.padEnd(28)} / password123`));
  console.log('\n🏷  Coupon codes to test at checkout:');
  coupons.forEach(c => console.log(`    ${c.code.padEnd(14)} — ${c.description}`));
  console.log('\n📊  Analytics data: 45 orders across last 30 days');
  console.log(`📝  Reviews: ${reviewCount} reviews with realistic comments`);
  console.log('♥   Wishlists: pre-filled for all sample users');
  console.log('📅  Bookings: 18 reservations (mix of past & upcoming)');
  console.log('─'.repeat(52));

  await mongoose.connection.close();
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
