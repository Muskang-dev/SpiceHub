import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ deliveryAddress: user?.address || '', phone: '', paymentMethod: 'Cash on Delivery', notes: '', scheduledFor: '' });
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [loading, setLoading] = useState(false);

  const tax = cartTotal * 0.05;
  const pointsDiscount = usePoints ? Math.min(user?.loyaltyPoints || 0, Math.floor(cartTotal + tax - discount)) : 0;
  const grandTotal = Math.max(0, cartTotal + tax - discount - pointsDiscount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const { data } = await api.post('/orders/apply-coupon', { code: couponCode, subtotal: cartTotal });
      if (data.success) { setDiscount(data.discount); toast.success(data.message); }
      else { setDiscount(0); toast.error(data.message); }
    } catch { toast.error('Error applying coupon'); }
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!form.deliveryAddress || !form.phone) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        items: cart.map(i => ({ menuItem: i._id, name: i.name, price: i.price, qty: i.qty })),
        ...form, couponCode: couponCode || null, discountAmount: discount, usePoints,
        scheduledFor: form.scheduledFor || null,
      });
      clearCart();
      await refreshUser();
      toast.success(`Order placed! 🎉 Earned ${data.pointsEarned} loyalty points.`);
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-head text-3xl font-bold text-[#1a1a2e] mb-6">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={placeOrder} className="md:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="font-head text-xl font-bold text-[#1a1a2e]">Delivery Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
              <textarea value={form.deliveryAddress} onChange={e => setForm(f => ({...f, deliveryAddress: e.target.value}))} rows={3} required placeholder="Flat/House no., street, area, city..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a] resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} required placeholder="+91 XXXXX XXXXX" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select value={form.paymentMethod} onChange={e => setForm(f => ({...f, paymentMethod: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]">
                  <option>Cash on Delivery</option>
                  <option>Online</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Delivery <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="datetime-local" value={form.scheduledFor} min={new Date(Date.now() + 30*60000).toISOString().slice(0,16)} onChange={e => setForm(f => ({...f, scheduledFor: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
              <p className="text-xs text-gray-400 mt-1">Leave blank for immediate delivery (~30–45 min)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} placeholder="Extra spicy, no onions..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a] resize-none" />
            </div>
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-head text-lg font-bold text-[#1a1a2e] mb-3">Promo Code</h2>
            <div className="flex gap-2">
              <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter coupon code" className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a] font-mono tracking-wider" />
              <button type="button" onClick={applyCoupon} className="bg-[#e05c2a] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#c04820] transition-colors">Apply</button>
            </div>
            {discount > 0 && <p className="text-green-600 text-sm font-medium mt-2">✓ Coupon applied! You save ₹{discount.toFixed(2)}</p>}
          </div>

          {/* Loyalty */}
          {(user?.loyaltyPoints || 0) > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-yellow-800">⭐ {user.loyaltyPoints} Loyalty Points = ₹{user.loyaltyPoints}</p>
                  <p className="text-xs text-yellow-600 mt-0.5">Redeem as cash on this order</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div onClick={() => setUsePoints(p => !p)} className={`w-10 h-5 rounded-full transition-colors relative ${usePoints ? 'bg-yellow-500' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${usePoints ? 'left-5' : 'left-0.5'}`}></div>
                  </div>
                  <span className="text-sm font-medium text-yellow-800">Use points</span>
                </label>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-[#e05c2a] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#c04820] transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner"></div> Placing Order...</> : '🎉 Place Order'}
          </button>
        </form>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-fit sticky top-20">
          <h2 className="font-head text-xl font-bold text-[#1a1a2e] mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {cart.map(i => (
              <div key={i._id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate flex-1 mr-2">{i.name} × {i.qty}</span>
                <span className="font-medium">₹{(i.price * i.qty).toFixed(0)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-₹{discount.toFixed(2)}</span></div>}
            {pointsDiscount > 0 && <div className="flex justify-between text-yellow-600"><span>Loyalty Points</span><span>-₹{pointsDiscount.toFixed(2)}</span></div>}
            <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span className="text-[#e05c2a]">₹{grandTotal.toFixed(2)}</span></div>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">⭐ You'll earn ~{Math.floor(grandTotal / 10)} loyalty points</p>
        </div>
      </div>
    </div>
  );
}
