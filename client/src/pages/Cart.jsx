// ── Cart.jsx ──
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/common';

export function Cart() {
  const { cart, updateQty, removeFromCart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const tax = cartTotal * 0.05;

  if (cart.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <EmptyState icon="🛒" title="Your cart is empty" desc="Add some delicious items from our menu!" action={<Link to="/menu" className="bg-[#e05c2a] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#c04820] transition-colors">Browse Menu</Link>} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-head text-3xl font-bold text-[#1a1a2e] mb-6">Your Cart <span className="text-lg text-gray-400 font-normal">({cart.length} items)</span></h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {cart.map(item => (
            <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&q=80'; }} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-500">₹{item.price} each</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => updateQty(item._id, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-50 font-bold">−</button>
                  <span className="w-8 h-8 flex items-center justify-center text-sm font-bold">{item.qty}</span>
                  <button onClick={() => updateQty(item._id, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-50 font-bold">+</button>
                </div>
                <span className="font-bold text-gray-800 w-16 text-right">₹{(item.price * item.qty).toFixed(0)}</span>
                <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 p-1"><i className="fas fa-trash text-sm"></i></button>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1 mt-2"><i className="fas fa-trash"></i> Clear Cart</button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-fit sticky top-20">
          <h2 className="font-head text-xl font-bold text-[#1a1a2e] mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="text-green-600 font-medium">Free</span></div>
            <div className="flex justify-between"><span className="text-gray-500">GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
          </div>
          <div className="border-t border-gray-100 pt-3 mb-4">
            <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-[#e05c2a]">₹{(cartTotal + tax).toFixed(2)}</span></div>
          </div>
          {user ? (
            <Link to="/checkout" className="block w-full bg-[#e05c2a] text-white text-center py-3 rounded-xl font-bold hover:bg-[#c04820] transition-colors">Proceed to Checkout</Link>
          ) : (
            <Link to="/login" className="block w-full bg-[#e05c2a] text-white text-center py-3 rounded-xl font-bold hover:bg-[#c04820] transition-colors">Login to Order</Link>
          )}
          <Link to="/menu" className="block w-full text-center py-2.5 mt-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-[#e05c2a] hover:text-[#e05c2a] transition-colors">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;
