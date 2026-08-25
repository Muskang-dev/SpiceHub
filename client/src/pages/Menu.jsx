import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { MenuCard, Spinner, EmptyState } from '../components/common';
import { useAuth } from '../context/AuthContext';

const CATS = ['Starters','Main Course','Breads','Rice & Biryani','Desserts','Beverages'];

export default function Menu() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [filters, setFilters] = useState({ category: initialCategory, veg: false, search: '' });
  const [search, setSearch] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (filters.category) params.category = filters.category;
    if (filters.veg) params.veg = true;
    if (filters.search) params.search = filters.search;
    const { data } = await api.get('/menu', { params });
    setItems(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Keep the category filter in sync if the URL's ?category= changes
  // (e.g. navigating here again from a Home page category card)
  useEffect(() => {
    const cat = searchParams.get('category') || '';
    setFilters(f => (f.category === cat ? f : { ...f, category: cat }));
  }, [searchParams]);

  useEffect(() => {
    if (user) api.get('/wishlist').then(r => setWishlistIds(r.data.map(i => i._id)));
  }, [user]);

  const handleSearch = (e) => { e.preventDefault(); setFilters(f => ({ ...f, search })); };
  const handleWishlistToggle = (id, added) => setWishlistIds(prev => added ? [...prev, id] : prev.filter(i => i !== id));

  return (
    <div>
      <div className="page-banner">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="font-head text-4xl font-bold mb-1">Our Menu</h1>
          <p className="text-orange-100">Fresh, flavourful, made with love</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search + Veg filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-52">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e05c2a]" />
            <button type="submit" className="bg-[#e05c2a] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#c04820] transition-colors">Search</button>
          </form>
          <label className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => setFilters(f => ({ ...f, veg: !f.veg }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${filters.veg ? 'bg-green-500' : 'bg-gray-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${filters.veg ? 'left-5' : 'left-0.5'}`}></div>
            </div>
            <span className="text-sm font-medium text-gray-700">Veg Only</span>
          </label>
          {(filters.search || filters.veg || filters.category) && (
            <button onClick={() => { setFilters({ category: '', veg: false, search: '' }); setSearch(''); }} className="text-sm text-gray-500 hover:text-[#e05c2a] border border-gray-200 px-3 py-2 rounded-lg hover:border-[#e05c2a] transition-colors">Clear</button>
          )}
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          <button onClick={() => setFilters(f => ({ ...f, category: '' }))}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${!filters.category ? 'bg-[#e05c2a] text-white border-[#e05c2a]' : 'border-gray-200 text-gray-600 hover:border-[#e05c2a] hover:text-[#e05c2a]'}`}>All</button>
          {CATS.map(cat => (
            <button key={cat} onClick={() => setFilters(f => ({ ...f, category: cat }))}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors ${filters.category === cat ? 'bg-[#e05c2a] text-white border-[#e05c2a]' : 'border-gray-200 text-gray-600 hover:border-[#e05c2a] hover:text-[#e05c2a]'}`}>{cat}</button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : items.length === 0 ? (
          <EmptyState icon="🍽" title="No items found" desc="Try a different search or category." action={<button onClick={() => { setFilters({ category:'', veg:false, search:'' }); setSearch(''); }} className="bg-[#e05c2a] text-white px-6 py-2 rounded-xl font-semibold">View All</button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map(item => <MenuCard key={item._id} item={item} wishlistIds={wishlistIds} onWishlistToggle={handleWishlistToggle} />)}
          </div>
        )}
      </div>
    </div>
  );
}
