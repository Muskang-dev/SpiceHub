import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Spinner, Stars } from '../components/common';
import toast from 'react-hot-toast';

export default function ItemDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/menu/${id}`).then(r => { setData(r.data); setLoading(false); }).catch(() => navigate('/menu'));
  }, [id]);

  useEffect(() => {
    if (user) api.get('/wishlist').then(r => setIsWishlisted(r.data.some(i => i._id === id)));
  }, [id, user]);

  const handleAddToCart = () => {
    if (!user) { toast.error('Please login to order'); navigate('/login'); return; }
    addToCart(data.item, qty);
    toast.success(`${data.item.name} added to cart!`);
  };

  const toggleWishlist = async () => {
    if (!user) { toast.error('Login to save items'); return; }
    const r = await api.post(`/wishlist/toggle/${id}`);
    setIsWishlisted(r.data.added);
    toast.success(r.data.added ? '♥ Saved to wishlist!' : 'Removed from wishlist');
  };

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><Spinner size="lg" /></div>;
  if (!data) return null;

  const { item, reviews, related } = data;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-[#fdf8f5] border-b border-gray-100 py-3">
        <div className="max-w-6xl mx-auto px-4 text-sm text-gray-500 flex items-center gap-2">
          <Link to="/" className="hover:text-[#e05c2a]">Home</Link> / <Link to="/menu" className="hover:text-[#e05c2a]">Menu</Link> / <span className="text-gray-800 font-medium">{item.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main detail layout */}
        <div className="grid md:grid-cols-2 gap-10 mb-14">
          {/* Image */}
          <div className="rounded-3xl overflow-hidden shadow-xl aspect-[4/3]">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80'; }} />
          </div>

          {/* Info */}
          <div>
            <div className="text-xs font-bold text-[#e05c2a] uppercase tracking-widest mb-2">{item.category}</div>
            <h1 className="font-head text-4xl font-bold text-[#1a1a2e] mb-3">{item.name}</h1>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${item.isVeg ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                <span className={item.isVeg ? 'veg-dot' : 'nonveg-dot'}></span>{item.isVeg ? 'Pure Veg' : 'Non-Veg'}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200"><i className="fas fa-fire"></i> {item.spiceLevel}</span>
              {item.isFeatured && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">⭐ Chef's Pick</span>}
            </div>

            {item.avgRating > 0 && <Stars rating={item.avgRating} count={item.reviewCount} size="lg" />}
            <p className="text-gray-600 mt-4 mb-6 leading-relaxed">{item.description}</p>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="font-head text-4xl font-bold text-[#e05c2a]">₹{item.price}</span>
              <span className="text-sm text-gray-400">+ 5% GST</span>
            </div>

            {/* Add to cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center text-xl font-bold hover:bg-gray-50 transition-colors">−</button>
                <span className="w-10 h-11 flex items-center justify-center font-bold text-base">{qty}</span>
                <button onClick={() => setQty(q => Math.min(20, q + 1))} className="w-10 h-11 flex items-center justify-center text-xl font-bold hover:bg-gray-50 transition-colors">+</button>
              </div>
              <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-2 bg-[#e05c2a] text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-[#c04820] transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-200">
                <i className="fas fa-shopping-cart"></i> Add to Cart
              </button>
              <button onClick={toggleWishlist} className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl transition-all ${isWishlisted ? 'border-[#e05c2a] bg-orange-50 text-[#e05c2a]' : 'border-gray-200 text-gray-300 hover:border-[#e05c2a] hover:text-[#e05c2a]'}`}>♥</button>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[['fa-clock','30–45 min'],['fa-truck','Free delivery'],['fa-star',`${Math.floor(item.price * 1.05 / 10)} loyalty pts`]].map(([icon, text]) => (
                <div key={text} className="flex flex-col items-center gap-1 bg-[#fdf8f5] rounded-xl p-3 text-center">
                  <i className={`fas ${icon} text-[#e05c2a]`}></i>
                  <span className="text-xs text-gray-600 font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews + Related */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Reviews */}
          <div className="md:col-span-2">
            <h2 className="font-head text-2xl font-bold text-[#1a1a2e] mb-5">Customer Reviews</h2>
            {reviews.length === 0 ? (
              <div className="text-center py-10 bg-[#fdf8f5] rounded-2xl border border-dashed border-gray-200 text-gray-500">
                <div className="text-4xl mb-2">💬</div>
                <p className="font-medium">No reviews yet</p>
                <p className="text-sm mt-1">Order it and be the first to review!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[#e05c2a] text-white flex items-center justify-center font-bold font-head">{r.user?.name?.charAt(0) || 'U'}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-sm">{r.user?.name || 'Customer'}</div>
                        <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                      </div>
                      <div className="flex">
                        {[1,2,3,4,5].map(i => <span key={i} className={`text-base ${i <= r.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>)}
                      </div>
                    </div>
                    {r.comment ? <p className="text-gray-600 text-sm italic leading-relaxed">"{r.comment}"</p> : <p className="text-gray-400 text-sm italic">No written comment.</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related */}
          <div>
            <h2 className="font-head text-2xl font-bold text-[#1a1a2e] mb-5">More {item.category}</h2>
            <div className="space-y-3">
              {related.map(r => (
                <Link key={r._id} to={`/menu/${r._id}`} className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3 hover:border-[#e05c2a] hover:shadow-md transition-all group">
                  <img src={r.image} alt={r.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" onError={e => { e.target.src = 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&q=80'; }} />
                  <div>
                    <div className="font-semibold text-sm text-gray-800 group-hover:text-[#e05c2a] transition-colors">{r.name}</div>
                    {r.avgRating > 0 && <div className="flex items-center gap-1 text-xs text-yellow-500 mt-0.5">{'★'.repeat(Math.round(r.avgRating))} <span className="text-gray-400">({r.reviewCount})</span></div>}
                    <div className="text-[#e05c2a] font-bold text-sm mt-0.5">₹{r.price}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
