import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { AdminSidebar, Spinner } from '../../components/common';
import toast from 'react-hot-toast';

const CATS = ['Starters','Main Course','Breads','Rice & Biryani','Desserts','Beverages'];
const SPICE = ['Mild','Medium','Hot','Extra Hot'];
const BLANK = { name:'', description:'', price:'', category:'Starters', spiceLevel:'Medium', isVeg:true, isFeatured:false, isAvailable:true, image:'' };

export default function AdminMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = () => api.get('/admin/menu').then(r => { setItems(r.data); setLoading(false); });
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(BLANK); setEditId(null); setImageFile(null); setShowModal(true); };
  const openEdit = (item) => { setForm({ ...item, price: item.price.toString() }); setEditId(item._id); setImageFile(null); setShowModal(true); };

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (editId) await api.put(`/admin/menu/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/admin/menu', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(editId ? 'Item updated!' : 'Item added!');
      setShowModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving item'); }
    finally { setSaving(false); }
  };

  const del = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    await api.delete(`/admin/menu/${id}`); toast.success('Item deleted.'); fetch();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-head text-2xl font-bold text-[#1a1a2e]">Menu Items</h1>
          <button onClick={openAdd} className="bg-[#e05c2a] text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-[#c04820]"><i className="fas fa-plus"></i> Add Item</button>
        </div>

        {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                  <th className="px-4 py-3 text-left">Image</th><th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-center">Veg</th><th className="px-4 py-3 text-center">Featured</th>
                  <th className="px-4 py-3 text-center">Available</th><th className="px-4 py-3 text-center">Rating</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr></thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item._id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3"><img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" onError={e => { e.target.src='https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=100&q=80'; }} /></td>
                      <td className="px-4 py-3 font-semibold text-gray-800 max-w-[140px] truncate">{item.name}</td>
                      <td className="px-4 py-3"><span className="bg-orange-50 text-[#e05c2a] text-xs px-2 py-0.5 rounded-full font-medium">{item.category}</span></td>
                      <td className="px-4 py-3 text-right font-bold text-[#e05c2a]">₹{item.price}</td>
                      <td className="px-4 py-3 text-center"><span className={`w-3 h-3 rounded-full inline-block ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span></td>
                      <td className="px-4 py-3 text-center"><span className={`w-3 h-3 rounded-full inline-block ${item.isFeatured ? 'bg-yellow-400' : 'bg-gray-200'}`}></span></td>
                      <td className="px-4 py-3 text-center"><span className={`w-3 h-3 rounded-full inline-block ${item.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}></span></td>
                      <td className="px-4 py-3 text-center text-xs">{item.avgRating > 0 ? <span className="text-yellow-500">★ {item.avgRating} ({item.reviewCount})</span> : <span className="text-gray-300">—</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => openEdit(item)} className="border border-gray-200 px-2.5 py-1.5 rounded-lg text-xs hover:border-[#e05c2a] hover:text-[#e05c2a]"><i className="fas fa-edit"></i></button>
                          <button onClick={() => del(item._id, item.name)} className="border border-red-100 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-50"><i className="fas fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl my-4">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-head text-xl font-bold">{editId ? 'Edit' : 'Add'} Menu Item</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]">
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} required rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} required min="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Spice Level</label>
                  <select value={form.spiceLevel} onChange={e => setForm(f => ({...f, spiceLevel: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]">
                    {SPICE.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Image URL or Upload</label>
                <input value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))} placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a] mb-2" />
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="text-xs text-gray-500" />
              </div>
              <div className="flex gap-4 pt-1">
                {[['isVeg','Vegetarian'],['isFeatured','Featured'],['isAvailable','Available']].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.checked}))} className="accent-[#e05c2a]" />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-[#e05c2a] text-white py-2.5 rounded-xl font-semibold hover:bg-[#c04820] disabled:opacity-60">{saving ? 'Saving...' : editId ? 'Update Item' : 'Add Item'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
