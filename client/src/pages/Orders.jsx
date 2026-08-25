// Orders.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Spinner, StatusBadge, EmptyState } from '../components/common';
import toast from 'react-hot-toast';

export default function Orders() {
  const [data, setData] = useState({ orders: [], reviewedKeys: [] });
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ orderId: null, itemId: null, name: '', rating: 5, comment: '' });
  const [downloading, setDownloading] = useState(null);

  const downloadPDF = async (orderId, type) => {
    setDownloading(orderId);
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `spicehub-${type}-${orderId.slice(-6).toUpperCase()}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Could not download PDF. Check you are logged in.'); }
    finally { setDownloading(null); }
  };

  useEffect(() => { api.get('/orders').then(r => { setData(r.data); setLoading(false); }); }, []);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/orders/${reviewForm.orderId}/review/${reviewForm.itemId}`, { rating: reviewForm.rating, comment: reviewForm.comment });
      toast.success('Review submitted! 🌟');
      setReviewForm({ orderId: null, itemId: null, name: '', rating: 5, comment: '' });
      const r = await api.get('/orders'); setData(r.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Error submitting review'); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-head text-3xl font-bold text-[#1a1a2e] mb-6">My Orders</h1>
      {data.orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders yet" desc="Start by exploring our menu!" action={<Link to="/menu" className="bg-[#e05c2a] text-white px-6 py-2.5 rounded-xl font-semibold">Order Now</Link>} />
      ) : (
        <div className="space-y-4">
          {data.orders.map(order => (
            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                  <span className="font-bold text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</span>
                  <span className="text-gray-400 text-sm ml-2">{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                  {order.scheduledFor && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">⏰ {new Date(order.scheduledFor).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>}
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {order.items.map((item, i) => <span key={i} className="bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full font-medium">{item.name} × {item.qty}</span>)}
              </div>
              {order.couponCode && <p className="text-green-600 text-xs mb-1">🏷 Coupon <strong>{order.couponCode}</strong> — saved ₹{order.discountAmount?.toFixed(2)}</p>}
              {order.loyaltyPointsEarned > 0 && <p className="text-yellow-600 text-xs mb-2">⭐ Earned {order.loyaltyPointsEarned} loyalty points</p>}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-head text-xl font-bold text-[#e05c2a]">₹{order.totalAmount.toFixed(2)}</span>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => downloadPDF(order._id, order.status === 'Delivered' ? 'invoice' : 'confirmation')} disabled={downloading === order._id} className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:border-[#e05c2a] hover:text-[#e05c2a] transition-colors flex items-center gap-1 disabled:opacity-50"><i className="fas fa-file-pdf"></i> {downloading === order._id ? 'Downloading...' : order.status === 'Delivered' ? 'Invoice' : 'Confirmation'}</button>
                  {order.status === 'Delivered' && order.items.map(item => {
                    const key = `${order._id}-${item.menuItem}`;
                    return !data.reviewedKeys.includes(key) ? (
                      <button key={item.menuItem} onClick={() => setReviewForm({ orderId: order._id, itemId: item.menuItem, name: item.name, rating: 5, comment: '' })} className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors flex items-center gap-1"><i className="fas fa-star"></i> Review {item.name}</button>
                    ) : <span key={item.menuItem} className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg border border-green-200">✓ Reviewed</span>;
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review modal */}
      {reviewForm.orderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-head text-xl font-bold mb-1">Review {reviewForm.name}</h3>
            <p className="text-gray-400 text-sm mb-4">Share your experience</p>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setReviewForm(f => ({...f, rating: s}))} className={`text-3xl transition-transform hover:scale-110 ${s <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Comment <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))} rows={3} maxLength={500} placeholder="How was the dish?" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a] resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-[#e05c2a] text-white py-2.5 rounded-xl font-semibold hover:bg-[#c04820]">Submit Review</button>
                <button type="button" onClick={() => setReviewForm({ orderId: null, itemId: null, name: '', rating: 5, comment: '' })} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600 hover:border-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
