# 🌶 SpiceHub — MERN Stack Restaurant E-Commerce Platform

A full-featured restaurant ordering, reservation, and management web app built with **MongoDB, Express, React, Node.js**.

---

## 🔗 Live Demo
 
[https://spice-hub-ten.vercel.app/)

## 🚀 Quick Start

```bash
# 1. Install all dependencies (root, server, client)
npm run install:all

# 2. Configure environment
# Edit server/.env — set your MONGODB_URI

# 3. Seed database (29 menu items, 8 users, 45 orders, reviews, wishlists, bookings, coupons)
npm run seed

# 4. Run both server + client together
npm run dev
```

- **API** → http://localhost:5000
- **React App** → http://localhost:3000

---

## 🔐 Login Credentials

| Role  | Email | Password |
|-------|-------|----------|
| **Admin** | admin@spicehub.in | admin123 |
| User | priya@example.com | password123 |
| User | rahul@example.com | password123 |
| User | ananya@example.com | password123 |
| User | kabir@example.com | password123 |
| User | sneha@example.com | password123 |
| User | arjun@example.com | password123 |
| User | diya@example.com | password123 |
| User | vikram@example.com | password123 |

---

## 🏷 Test Coupon Codes

| Code | Description |
|------|-------------|
| `WELCOME50` | Flat ₹50 off orders above ₹200 |
| `SPICE20` | 20% off (max ₹150) on orders above ₹500 |
| `BIRYANI100` | Flat ₹100 off orders above ₹800 |
| `FESTIVAL30` | 30% off (max ₹200) on orders above ₹300 |
| `FIRSTBITE` | Flat ₹75 off orders above ₹300 |

---

## 📦 Seed Data (what `node seed.js` creates)

- **29 menu items** across 6 categories with real descriptions, images, avg ratings, review counts
- **5 coupons** ready to test at checkout
- **1 admin** + **8 sample users** with realistic Indian names and phone numbers
- **45 orders** spread across the last 30 days (powers the analytics charts)
- **Reviews** with realistic comments per star rating (some with no comment — realistic)
- **Wishlists** pre-filled for all 8 sample users
- **18 reservations** — mix of past, upcoming, confirmed, pending, cancelled

---

## ✨ Full Feature List

### Customer Side
| Feature | Details |
|---------|---------|
| **Home** | Hero, featured dishes, category grid, why-us, reserve CTA |
| **Menu** | Filter by category, search, veg-only toggle, star ratings, wishlist ♥ |
| **Food Detail** | Full page with image, ratings, reviews, related items, add to cart, wishlist |
| **Cart** | localStorage-based, qty controls, live totals |
| **Checkout** | Coupon codes (AJAX), loyalty points toggle, scheduled delivery picker |
| **Orders** | History with status tracking, PDF confirmation/invoice download, review modal |
| **Reviews** | 1–5 star modal after delivery (once per item per order) |
| **Reservations** | Full booking form with date, time, guests, occasion — modal UI |
| **Wishlist** | Save/remove items with AJAX heart toggle, dedicated page |
| **Loyalty Points** | Earn 1 pt per ₹10 spent, redeem as ₹1 per pt at checkout |
| **Scheduled Delivery** | Pick a future date/time for delivery |
| **Auth** | JWT-based login/register, persistent sessions via localStorage |

### Admin Panel (`/admin`)
| Feature | Details |
|---------|---------|
| **Dashboard** | Revenue, orders, customers, menu item counts + quick action cards |
| **Analytics** | Recharts: daily/monthly revenue line chart, top items bar, status doughnut, category bar |
| **Menu Manager** | Add/edit/delete items, image URL or file upload, veg/featured/available toggles |
| **Orders Manager** | Filter by status, update status inline, print kitchen ticket PDF, invoice PDF |
| **Kitchen Tickets** | 80mm thermal-printer format PDF with order items, qty, notes, scheduled time |
| **Bookings** | Confirm/cancel reservations with inline status dropdown |
| **Customers** | List all users, search, view full order + review history in modal, activate/deactivate |
| **Coupons** | Full CRUD — flat or percent, expiry, usage limits, min order, max discount cap |
| **Reviews** | Moderate and remove customer reviews |

---

## 📁 Project Structure

```
spicehub-mern/
├── package.json            # Root — concurrently runs server + client
│
├── server/
│   ├── server.js           # Express + CORS + routes
│   ├── seed.js             # Rich seed data
│   ├── .env                # MongoDB URI + JWT secret
│   ├── models/index.js     # All 6 Mongoose models
│   ├── middleware/auth.js  # JWT protect + adminOnly
│   ├── routes/
│   │   ├── auth.js         # Register, Login, /me
│   │   ├── menu.js         # List + Detail
│   │   ├── orders.js       # Place, coupon, PDF, review
│   │   ├── wishlist.js     # Toggle, list
│   │   ├── bookings.js     # Create, cancel
│   │   ├── reviews.js      # By menu item
│   │   ├── coupons.js      # List
│   │   ├── cart.js         # Placeholder
│   │   └── admin.js        # Full admin CRUD + analytics
│   └── utils/pdf.js        # pdfkit invoice + kitchen ticket
│
└── client/
    ├── public/index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── index.js
        ├── App.jsx           # All routes
        ├── index.css         # Tailwind + custom CSS
        ├── utils/api.js      # Axios with JWT interceptor
        ├── context/
        │   ├── AuthContext.jsx  # JWT auth state
        │   └── CartContext.jsx  # localStorage cart
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.jsx   # Sticky nav, mobile menu, user dropdown
        │   │   └── Footer.jsx
        │   └── common/index.jsx # MenuCard, Spinner, Stars, AdminSidebar, StatusBadge, EmptyState
        └── pages/
            ├── Home.jsx        ├── Menu.jsx         ├── ItemDetail.jsx
            ├── Cart.jsx        ├── Checkout.jsx      ├── Orders.jsx
            ├── Wishlist.jsx    ├── Bookings.jsx      ├── Login.jsx / Register.jsx
            └── admin/
                ├── Dashboard.jsx   ├── Analytics.jsx  ├── Menu.jsx
                ├── Orders.jsx      ├── Bookings.jsx   ├── Customers.jsx
                ├── Coupons.jsx     └── Reviews.jsx
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router v6, Tailwind CSS |
| **State** | Context API (Auth + Cart), localStorage |
| **HTTP** | Axios with JWT interceptor |
| **Charts** | Recharts (Line, Bar, Pie) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **File Upload** | multer |
| **PDF** | pdfkit (invoice + kitchen ticket) |
| **Icons** | Font Awesome 6 |
| **Fonts** | Playfair Display + DM Sans |
| **Dev** | concurrently, nodemon |
