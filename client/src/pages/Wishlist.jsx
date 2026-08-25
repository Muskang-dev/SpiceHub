// Wishlist.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { MenuCard, Spinner, EmptyState } from '../components/common';

export function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/wishlist').then(r => { setItems(r.data); setLoading(false); }); }, []);
  const handleToggle = (id, added) => { if (!added) setItems(prev => prev.filter(i => i._id !== id)); };
  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-head text-3xl font-bold text-[#1a1a2e] mb-6">My Wishlist <span className="text-lg text-gray-400 font-normal">({items.length} items)</span></h1>
      {items.length === 0 ? <EmptyState icon="🤍" title="Wishlist is empty" desc="Save favourite dishes by clicking ♥ on any menu item." action={<Link to="/menu" className="bg-[#e05c2a] text-white px-6 py-2.5 rounded-xl font-semibold">Browse Menu</Link>} /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map(item => <MenuCard key={item._id} item={item} wishlistIds={items.map(i => i._id)} onWishlistToggle={handleToggle} />)}
        </div>
      )}
    </div>
  );
}
export default Wishlist;
