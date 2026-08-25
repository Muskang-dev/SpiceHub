import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { MenuCard, Spinner } from '../components/common';

const CATS = [
  { name: 'Starters', emoji: '🥗' }, { name: 'Main Course', emoji: '🍛' },
  { name: 'Breads', emoji: '🫓' }, { name: 'Rice & Biryani', emoji: '🍚' },
  { name: 'Desserts', emoji: '🍮' }, { name: 'Beverages', emoji: '🥤' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    api.get('/menu?featured=true').then(r => { setFeatured(r.data); setLoading(false); });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="min-h-[88vh] grid md:grid-cols-2 items-center gap-10 max-w-6xl mx-auto px-4 py-12">
        <div className="fade-up">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-[#e05c2a] px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
            🌶 Authentic Indian Cuisine
          </div>
          <h1 className="font-head text-5xl md:text-6xl font-bold text-[#1a1a2e] leading-tight mb-5">
            Bold Flavours,<br/><span className="text-[#e05c2a]">Fresh Every Day</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-md leading-relaxed">
            From our kitchen to your table — order online or reserve your seat at SpiceHub.
          </p>
          <div className="flex gap-4 flex-wrap mb-10">
            <Link to="/menu" className="bg-[#e05c2a] text-white px-7 py-3 rounded-xl font-semibold text-base hover:bg-[#c04820] transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-200">Order Now</Link>
            <Link to="/bookings" className="border-2 border-[#e05c2a] text-[#e05c2a] px-7 py-3 rounded-xl font-semibold text-base hover:bg-orange-50 transition-all">Reserve a Table</Link>
          </div>
          <div className="flex gap-8">
            {[['50+','Menu Items'],['4.8★','Rating'],['30 min','Delivery']].map(([n,l]) => (
              <div key={l}>
                <div className="font-head text-2xl font-bold text-[#1a1a2e]">{n}</div>
                <div className="text-sm text-gray-500">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
            <img src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=700&q=80" alt="Delicious Indian food" className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 text-sm font-semibold text-[#e05c2a]">
            <i className="fas fa-fire"></i> Today's Special
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-[#fdf8f5] py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-head text-3xl font-bold text-[#1a1a2e] mb-2">Browse by Category</h2>
            <p className="text-gray-500">Handcrafted dishes from across India</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {CATS.map(({ name, emoji }) => (
              <Link key={name} to={`/menu?category=${encodeURIComponent(name)}`}
                className="flex flex-col items-center gap-2 bg-white border border-gray-100 rounded-2xl py-5 px-2 hover:border-[#e05c2a] hover:shadow-md hover:-translate-y-1 transition-all group">
                <span className="text-3xl">{emoji}</span>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-[#e05c2a] text-center leading-tight">{name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-head text-3xl font-bold text-[#1a1a2e] mb-2">Chef's Picks</h2>
            <p className="text-gray-500">Our most loved dishes, handpicked for you</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(item => (
                <MenuCard key={item._id} item={item} wishlistIds={wishlistIds}
                  onWishlistToggle={(id, added) => setWishlistIds(prev => added ? [...prev, id] : prev.filter(i => i !== id))} />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/menu" className="border-2 border-[#e05c2a] text-[#e05c2a] px-8 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors">View Full Menu</Link>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-[#1a1a2e] py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-head text-3xl font-bold text-white text-center mb-10">Why SpiceHub?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[['🌿','Fresh Ingredients','Sourced daily from local farms. No preservatives, ever.'],['⚡','Fast Delivery','Hot food at your door in under 30 minutes.'],['👨‍🍳','Expert Chefs','Trained in traditional Indian culinary arts.'],['💳','Easy Payment','Cash on delivery or online — your choice.']].map(([icon, title, desc]) => (
              <div key={title} className="text-center">
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="text-white font-semibold mb-1">{title}</h3>
                <p className="text-gray-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reserve CTA */}
      <section className="bg-gradient-to-r from-[#e05c2a] to-[#c04820] py-14">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-head text-3xl font-bold text-white mb-1">Dining In? Reserve Your Table</h2>
            <p className="text-orange-100">Book ahead and we'll have everything ready for your perfect evening.</p>
          </div>
          <Link to="/bookings" className="bg-white text-[#e05c2a] px-8 py-3 rounded-xl font-bold text-base hover:bg-orange-50 transition-colors whitespace-nowrap shadow-lg">Book a Table</Link>
        </div>
      </section>
    </div>
  );
}
