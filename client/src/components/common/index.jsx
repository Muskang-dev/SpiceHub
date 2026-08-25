import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../utils/api';

// ── Spinner ──
export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6';
  return <div className={`${s} border-2 border-[#e05c2a] border-t-transparent rounded-full spinner`}></div>;
}

// ── Star Rating Display ──
export function Stars({ rating, count, size = 'sm' }) {
  const textSize = size === 'lg' ? 'text-lg' : 'text-sm';
  return (
    <div className="flex items-center gap-1">
      <div className={`flex ${textSize}`}>
        {[1,2,3,4,5].map(i => (
          <span key={i} className={i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
        ))}
      </div>
      <span className="text-xs text-gray-500">({count})</span>
    </div>
  );
}

// ── Menu Card ──
export function MenuCard({ item, wishlistIds = [], onWishlistToggle }) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(item);
    toast.success(`${item.name} added to cart!`);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Login to save items'); return; }
    try {
      const { data } = await api.post(`/wishlist/toggle/${item._id}`);
      onWishlistToggle && onWishlistToggle(item._id, data.added);
      toast.success(data.added ? '♥ Saved to wishlist!' : 'Removed from wishlist');
    } catch { toast.error('Could not update wishlist'); }
  };

  const isWishlisted = wishlistIds.includes(item._id);

  return (
    <Link to={`/menu/${item._id}`} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80'; }} />
        {/* Veg badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
          <span className={item.isVeg ? 'veg-dot' : 'nonveg-dot'}></span>
          <span className="text-xs font-medium text-gray-700">{item.isVeg ? 'Veg' : 'Non-Veg'}</span>
        </div>
        {/* Wishlist */}
        <button onClick={handleWishlist} className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-base transition-all hover:scale-110 z-10 ${isWishlisted ? 'text-[#e05c2a]' : 'text-gray-300 hover:text-[#e05c2a]'}`}>♥</button>
        {item.isFeatured && <span className="absolute bottom-2 left-2 bg-[#f4a623] text-[#1a1a2e] text-xs font-bold px-2 py-0.5 rounded-full">⭐ Chef's Pick</span>}
        <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">{item.spiceLevel}</span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs font-semibold text-[#e05c2a] uppercase tracking-wider mb-1">{item.category}</div>
        <h3 className="font-head font-semibold text-gray-900 mb-1 text-base leading-snug">{item.name}</h3>
        {item.avgRating > 0 && <Stars rating={item.avgRating} count={item.reviewCount} />}
        <p className="text-gray-500 text-xs mt-1 mb-3 flex-1 leading-relaxed line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <span className="font-head text-xl font-bold text-[#e05c2a]">₹{item.price}</span>
          {user ? (
            <button onClick={handleAdd} className="flex items-center gap-1 bg-[#e05c2a] text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#c04820] transition-colors">
              <i className="fas fa-plus text-xs"></i> Add
            </button>
          ) : (
            <Link to="/login" className="text-xs font-semibold text-[#e05c2a] border border-[#e05c2a] px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors" onClick={e => e.stopPropagation()}>Login</Link>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Admin Sidebar ──
const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: 'fa-tachometer-alt' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'fa-chart-line' },
  { to: '/admin/menu', label: 'Menu Items', icon: 'fa-utensils' },
  { to: '/admin/orders', label: 'Orders', icon: 'fa-receipt' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'fa-calendar-alt' },
  { to: '/admin/customers', label: 'Customers', icon: 'fa-users' },
  { to: '/admin/coupons', label: 'Coupons', icon: 'fa-tag' },
  { to: '/admin/reviews', label: 'Reviews', icon: 'fa-star' },
];

export function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="w-56 min-h-screen bg-[#1a1a2e] flex flex-col flex-shrink-0">
      <div className="px-5 py-4 border-b border-white/10">
        <Link to="/" className="font-head text-lg text-[#e05c2a]">🌶 SpiceHub</Link>
        <p className="text-xs text-gray-400 mt-0.5">Admin Panel</p>
      </div>
      <nav className="flex-1 py-3">
        {adminLinks.map(({ to, label, icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium border-l-[3px] transition-colors ${active ? 'border-[#e05c2a] bg-white/8 text-white' : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <i className={`fas ${icon} w-4`}></i> {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5"><i className="fas fa-globe w-4"></i> View Site</Link>
        <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 rounded-lg hover:bg-white/5"><i className="fas fa-sign-out-alt w-4"></i> Logout</button>
      </div>
    </aside>
  );
}

// ── Status Badge ──
const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Preparing: 'bg-purple-100 text-purple-800',
  'Out for Delivery': 'bg-cyan-100 text-cyan-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};
export function StatusBadge({ status }) {
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>{status}</span>;
}

// ── Empty State ──
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-head text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      {desc && <p className="text-gray-500 text-sm mb-4">{desc}</p>}
      {action}
    </div>
  );
}
