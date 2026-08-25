import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setDdOpen(false); };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="font-head text-2xl font-bold text-[#e05c2a] flex-shrink-0">
          🌶 SpiceHub
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          <Link to="/" className="px-3 py-2 rounded-lg text-sm font-medium hover:text-[#e05c2a] hover:bg-orange-50 transition-colors">Home</Link>
          <Link to="/menu" className="px-3 py-2 rounded-lg text-sm font-medium hover:text-[#e05c2a] hover:bg-orange-50 transition-colors">Menu</Link>
          <Link to="/bookings" className="px-3 py-2 rounded-lg text-sm font-medium hover:text-[#e05c2a] hover:bg-orange-50 transition-colors">Reserve</Link>

          {user && (
            <>
              <Link to="/wishlist" className="px-2 py-2 text-lg hover:text-[#e05c2a] transition-colors" title="Wishlist">♥</Link>
              <Link to="/cart" className="relative px-2 py-2 text-lg hover:text-[#e05c2a] transition-colors">
                <i className="fas fa-shopping-cart"></i>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#e05c2a] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{cartCount}</span>
                )}
              </Link>
            </>
          )}

          {user ? (
            <div className="relative ml-2">
              <button onClick={() => setDdOpen(p => !p)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:border-[#e05c2a] hover:text-[#e05c2a] transition-colors">
                <div className="w-7 h-7 rounded-full bg-[#e05c2a] text-white flex items-center justify-center text-xs font-bold">{user.name.charAt(0)}</div>
                {user.name.split(' ')[0]}
                <i className="fas fa-chevron-down text-xs"></i>
              </button>
              {ddOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 bg-orange-50 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                    {user.loyaltyPoints > 0 && <p className="text-xs text-[#e05c2a] font-medium mt-0.5">⭐ {user.loyaltyPoints} pts</p>}
                  </div>
                  <Link to="/orders" onClick={() => setDdOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"><i className="fas fa-receipt w-4 text-gray-400"></i> My Orders</Link>
                  <Link to="/bookings" onClick={() => setDdOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"><i className="fas fa-calendar w-4 text-gray-400"></i> My Bookings</Link>
                  {user.role === 'admin' && <Link to="/admin" onClick={() => setDdOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 text-purple-600 font-medium transition-colors"><i className="fas fa-cog w-4"></i> Admin Panel</Link>}
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"><i className="fas fa-sign-out-alt w-4"></i> Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2 ml-2">
              <Link to="/login" className="px-4 py-2 rounded-lg border-2 border-[#e05c2a] text-[#e05c2a] text-sm font-semibold hover:bg-orange-50 transition-colors">Login</Link>
              <Link to="/register" className="px-4 py-2 rounded-lg bg-[#e05c2a] text-white text-sm font-semibold hover:bg-[#c04820] transition-colors">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden ml-auto p-2" onClick={() => setOpen(p => !p)}>
          <i className={`fas ${open ? 'fa-times' : 'fa-bars'} text-gray-700`}></i>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          <Link to="/" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-orange-50 hover:text-[#e05c2a]">Home</Link>
          <Link to="/menu" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-orange-50 hover:text-[#e05c2a]">Menu</Link>
          <Link to="/bookings" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-orange-50 hover:text-[#e05c2a]">Reserve a Table</Link>
          {user ? (
            <>
              <Link to="/cart" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-orange-50">Cart {cartCount > 0 && <span className="ml-1 bg-[#e05c2a] text-white text-xs px-1.5 py-0.5 rounded-full">{cartCount}</span>}</Link>
              <Link to="/wishlist" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-orange-50">♥ Wishlist</Link>
              <Link to="/orders" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-orange-50">My Orders</Link>
              {user.role === 'admin' && <Link to="/admin" onClick={() => setOpen(false)} className="py-2.5 px-3 rounded-lg text-sm font-medium text-purple-600">Admin Panel</Link>}
              <button onClick={handleLogout} className="py-2.5 px-3 rounded-lg text-sm font-medium text-red-500 text-left">Logout</button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link to="/login" onClick={() => setOpen(false)} className="flex-1 py-2 text-center rounded-lg border-2 border-[#e05c2a] text-[#e05c2a] text-sm font-semibold">Login</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="flex-1 py-2 text-center rounded-lg bg-[#e05c2a] text-white text-sm font-semibold">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
