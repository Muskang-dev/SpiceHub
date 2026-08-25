import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { AdminSidebar, StatusBadge, Spinner } from '../../components/common';
import toast from 'react-hot-toast';

// ── Admin Orders ──
export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const STATUSES = ['','Pending','Confirmed','Preparing','Out for Delivery','Delivered','Cancelled'];

  const downloadPDF = async (url, filename) => {
    try {
      const r = await api.get(url, { responseType: 'blob' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
      link.download = filename; document.body.appendChild(link); link.click(); link.remove();
    } catch { toast.error('Could not download PDF'); }
  };

  const fetch = () => api.get('/admin/orders', { params: statusFilter ? { status: statusFilter } : {} }).then(r => { setOrders(r.data); setLoading(false); });
  useEffect(() => { setLoading(true); fetch(); }, [statusFilter]);

  const updateStatus = async (id, status) => {
    await api.put(`/admin/orders/${id}/status`, { status });
    toast.success('Status updated!'); fetch();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h1 className="font-head text-2xl font-bold text-[#1a1a2e]">All Orders</h1>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05c2a]">
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
        </div>
        {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                  <th className="px-4 py-3 text-left">Order ID</th><th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Items</th><th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Scheduled</th><th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-center">Actions</th>
                </tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o._id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-xs text-gray-500">#{o._id.slice(-6).toUpperCase()}</td>
                      <td className="px-4 py-3"><div className="font-medium">{o.user?.name || 'Guest'}</div><div className="text-xs text-gray-400">{o.user?.email}</div></td>
                      <td className="px-4 py-3 max-w-[160px]"><div className="flex flex-wrap gap-1">{o.items.slice(0,2).map((it,i)=><span key={i} className="bg-orange-50 text-orange-700 text-xs px-2 py-0.5 rounded-full">{it.name}×{it.qty}</span>)}{o.items.length>2&&<span className="text-xs text-gray-400">+{o.items.length-2}</span>}</div></td>
                      <td className="px-4 py-3 text-right font-bold text-[#e05c2a]">₹{o.totalAmount?.toFixed(0)}{o.discountAmount>0&&<div className="text-xs text-green-500 font-normal">-₹{o.discountAmount?.toFixed(0)}</div>}</td>
                      <td className="px-4 py-3">{o.scheduledFor?<span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">⏰{new Date(o.scheduledFor).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span>:<span className="text-gray-300 text-xs">—</span>}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)} className="border border-gray-200 rounded-lg text-xs px-2 py-1 focus:outline-none focus:border-[#e05c2a]">
                          {['Pending','Confirmed','Preparing','Out for Delivery','Delivered','Cancelled'].map(s=><option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => downloadPDF(`/admin/orders/${o._id}/kitchen-ticket`, `kitchen-${o._id.slice(-6)}.pdf`)} title="Kitchen Ticket" className="border border-gray-200 px-2.5 py-1.5 rounded-lg text-xs hover:border-[#e05c2a] hover:text-[#e05c2a]"><i className="fas fa-print"></i></button>
                          <button onClick={() => downloadPDF(`/admin/orders/${o._id}/invoice`, `invoice-${o._id.slice(-6)}.pdf`)} title="Invoice" className="border border-gray-200 px-2.5 py-1.5 rounded-lg text-xs hover:border-[#e05c2a] hover:text-[#e05c2a]"><i className="fas fa-file-pdf"></i></button>
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
    </div>
  );
}

// ── Admin Bookings ──
export function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetch = () => api.get('/admin/bookings').then(r => { setBookings(r.data); setLoading(false); });
  useEffect(() => { fetch(); }, []);
  const updateStatus = async (id, status) => { await api.put(`/admin/bookings/${id}/status`, { status }); fetch(); };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <h1 className="font-head text-2xl font-bold text-[#1a1a2e] mb-5">All Reservations</h1>
        {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                  <th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Date & Time</th><th className="px-4 py-3 text-left">Guests</th>
                  <th className="px-4 py-3 text-left">Occasion</th><th className="px-4 py-3 text-left">Status</th>
                </tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-semibold">{b.name}</td>
                      <td className="px-4 py-3"><div className="text-xs">{b.email}</div><div className="text-xs text-gray-400">{b.phone}</div></td>
                      <td className="px-4 py-3 text-xs"><div>{new Date(b.date).toLocaleDateString('en-IN')}</div><div className="text-gray-400">{b.time}</div></td>
                      <td className="px-4 py-3">{b.guests}</td>
                      <td className="px-4 py-3 text-xs">{b.occasion !== 'None' ? <span className="bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full">🎉 {b.occasion}</span> : '—'}</td>
                      <td className="px-4 py-3">
                        <select value={b.status} onChange={e => updateStatus(b._id, e.target.value)} className="border border-gray-200 rounded-lg text-xs px-2 py-1 focus:outline-none focus:border-[#e05c2a]">
                          {['Pending','Confirmed','Cancelled'].map(s=><option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Admin Customers ──
export function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);

  const fetch = (q = '') => api.get('/admin/customers', { params: q ? { search: q } : {} }).then(r => { setCustomers(r.data); setLoading(false); });
  useEffect(() => { fetch(); }, []);

  const viewCustomer = async (c) => { setSelected(c); const r = await api.get(`/admin/customers/${c._id}`); setDetail(r.data); };
  const toggle = async (c) => { await api.put(`/admin/customers/${c._id}/toggle`); fetch(search); toast.success(c.isActive ? 'Customer deactivated' : 'Customer activated'); };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h1 className="font-head text-2xl font-bold text-[#1a1a2e]">Customers</h1>
          <form onSubmit={e => { e.preventDefault(); fetch(search); }} className="flex gap-2">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..." className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#e05c2a]" />
            <button type="submit" className="bg-[#e05c2a] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#c04820]">Search</button>
          </form>
        </div>
        {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                  <th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-right">Orders</th><th className="px-4 py-3 text-right">Spent</th>
                  <th className="px-4 py-3 text-right">Points</th><th className="px-4 py-3 text-left">Joined</th>
                  <th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">Actions</th>
                </tr></thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c._id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#e05c2a] text-white flex items-center justify-center text-xs font-bold">{c.name.charAt(0)}</div><span className="font-semibold">{c.name}</span></div></td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{c.email}</td>
                      <td className="px-4 py-3 text-right"><span className="bg-orange-50 text-[#e05c2a] text-xs font-bold px-2 py-0.5 rounded-full">{c.orderCount}</span></td>
                      <td className="px-4 py-3 text-right font-medium">₹{(c.totalSpent||0).toFixed(0)}</td>
                      <td className="px-4 py-3 text-right"><span className="bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded-full">⭐ {c.loyaltyPoints||0}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => viewCustomer(c)} className="border border-gray-200 px-2.5 py-1.5 rounded-lg text-xs hover:border-[#e05c2a] hover:text-[#e05c2a]">View</button>
                          <button onClick={() => toggle(c)} className={`border px-2.5 py-1.5 rounded-lg text-xs ${c.isActive ? 'border-red-100 text-red-400 hover:bg-red-50' : 'border-green-100 text-green-500 hover:bg-green-50'}`}>{c.isActive ? 'Deactivate' : 'Activate'}</button>
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

      {/* Customer detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl my-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-head text-xl font-bold">{selected.name}</h2>
              <button onClick={() => { setSelected(null); setDetail(null); }} className="text-gray-400 hover:text-gray-600 text-xl"><i className="fas fa-times"></i></button>
            </div>
            {!detail ? <div className="flex justify-center py-8"><Spinner /></div> : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[['Total Orders', detail.orders.length],['Total Spent', `₹${(detail.customer.totalSpent||0).toFixed(0)}`],['Loyalty Points', `⭐ ${detail.customer.loyaltyPoints||0}`]].map(([l,v]) => (
                    <div key={l} className="bg-gray-50 rounded-xl p-3 text-center"><div className="font-bold text-gray-800 text-lg">{v}</div><div className="text-xs text-gray-500">{l}</div></div>
                  ))}
                </div>
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">Order History</h3>
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {detail.orders.map(o => (
                    <div key={o._id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 text-sm">
                      <span className="font-mono text-xs text-gray-500">#{o._id.slice(-6).toUpperCase()}</span>
                      <span className="text-gray-600 text-xs">{o.items.slice(0,2).map(i => i.name).join(', ')}{o.items.length > 2 ? '...' : ''}</span>
                      <span className="font-bold text-[#e05c2a]">₹{o.totalAmount?.toFixed(0)}</span>
                      <StatusBadge status={o.status} />
                    </div>
                  ))}
                </div>
                {detail.reviews.length > 0 && <>
                  <h3 className="font-semibold text-gray-700 mb-3 text-sm">Reviews Left</h3>
                  <div className="space-y-2">
                    {detail.reviews.map(r => (
                      <div key={r._id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 text-sm">
                        <span className="text-gray-600">{r.menuItem?.name}</span>
                        <span className="text-yellow-400">{'★'.repeat(r.rating)}</span>
                        {r.comment && <span className="text-xs text-gray-500 italic flex-1 truncate">"{r.comment}"</span>}
                      </div>
                    ))}
                  </div>
                </>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Admin Coupons ──
const BLANK_COUPON = { code:'', description:'', discountType:'flat', discountValue:'', minOrderAmount:0, maxDiscount:'', usageLimit:'', isActive:true, expiresAt:'' };

export function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK_COUPON);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetch = () => api.get('/admin/coupons').then(r => { setCoupons(r.data); setLoading(false); });
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(BLANK_COUPON); setEditId(null); setShowModal(true); };
  const openEdit = (c) => { setForm({ ...c, expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : '' }); setEditId(c._id); setShowModal(true); };

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, discountValue: parseFloat(form.discountValue), minOrderAmount: parseFloat(form.minOrderAmount||0), maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null, usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null, expiresAt: form.expiresAt || null };
      if (editId) await api.put(`/admin/coupons/${editId}`, payload);
      else await api.post('/admin/coupons', payload);
      toast.success(editId ? 'Coupon updated!' : 'Coupon created!');
      setShowModal(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving coupon'); }
    finally { setSaving(false); }
  };

  const del = async (id, code) => { if (!window.confirm(`Delete coupon ${code}?`)) return; await api.delete(`/admin/coupons/${id}`); toast.success('Deleted.'); fetch(); };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-head text-2xl font-bold text-[#1a1a2e]">Promo Coupons</h1>
          <button onClick={openAdd} className="bg-[#e05c2a] text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-[#c04820]"><i className="fas fa-plus"></i> New Coupon</button>
        </div>
        {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                  <th className="px-4 py-3 text-left">Code</th><th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Discount</th><th className="px-4 py-3 text-right">Min Order</th>
                  <th className="px-4 py-3 text-center">Used</th><th className="px-4 py-3 text-left">Expires</th>
                  <th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3 text-center">Actions</th>
                </tr></thead>
                <tbody>
                  {coupons.map(c => (
                    <tr key={c._id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-gray-700 tracking-wider">{c.code}</td>
                      <td className="px-4 py-3"><span className="bg-orange-50 text-[#e05c2a] text-xs px-2 py-0.5 rounded-full">{c.discountType === 'flat' ? 'Flat ₹' : 'Percent %'}</span></td>
                      <td className="px-4 py-3 text-right font-bold">{c.discountType === 'flat' ? `₹${c.discountValue}` : `${c.discountValue}%`}{c.maxDiscount ? <span className="text-xs text-gray-400 ml-1">(max ₹{c.maxDiscount})</span> : ''}</td>
                      <td className="px-4 py-3 text-right text-gray-500">₹{c.minOrderAmount}</td>
                      <td className="px-4 py-3 text-center text-xs">{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => openEdit(c)} className="border border-gray-200 px-2.5 py-1.5 rounded-lg text-xs hover:border-[#e05c2a] hover:text-[#e05c2a]"><i className="fas fa-edit"></i></button>
                          <button onClick={() => del(c._id, c.code)} className="border border-red-100 px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-50"><i className="fas fa-trash"></i></button>
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
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg my-4">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-head text-xl font-bold">{editId ? 'Edit' : 'New'} Coupon</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Coupon Code *</label>
                  <input value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value.toUpperCase()}))} required placeholder="SPICE20" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a] font-mono tracking-wider uppercase" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Type *</label>
                  <select value={form.discountType} onChange={e => setForm(f => ({...f, discountType: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]">
                    <option value="flat">Flat Amount (₹)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="e.g. 20% off on orders above ₹500" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Discount Value *</label>
                  <input type="number" value={form.discountValue} onChange={e => setForm(f => ({...f, discountValue: e.target.value}))} required min="0" placeholder="e.g. 50" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Min Order (₹)</label>
                  <input type="number" value={form.minOrderAmount} onChange={e => setForm(f => ({...f, minOrderAmount: e.target.value}))} min="0" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {form.discountType === 'percent' && <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Max Discount (₹)</label>
                  <input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({...f, maxDiscount: e.target.value}))} min="0" placeholder="Optional cap" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
                </div>}
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({...f, usageLimit: e.target.value}))} min="1" placeholder="Unlimited" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Expiry Date</label>
                  <input type="date" value={form.expiresAt} onChange={e => setForm(f => ({...f, expiresAt: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({...f, isActive: e.target.checked}))} className="accent-[#e05c2a]" />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-[#e05c2a] text-white py-2.5 rounded-xl font-semibold hover:bg-[#c04820] disabled:opacity-60">{saving ? 'Saving...' : editId ? 'Update' : 'Create'} Coupon</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 py-2.5 rounded-xl font-semibold text-gray-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Admin Reviews ──
export function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetch = () => api.get('/admin/reviews').then(r => { setReviews(r.data); setLoading(false); });
  useEffect(() => { fetch(); }, []);
  const del = async (id) => { if (!window.confirm('Remove this review?')) return; await api.delete(`/admin/reviews/${id}`); toast.success('Review removed.'); fetch(); };

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <h1 className="font-head text-2xl font-bold text-[#1a1a2e] mb-5">Customer Reviews</h1>
        {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div> : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                  <th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Rating</th><th className="px-4 py-3 text-left">Comment</th>
                  <th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-center">Action</th>
                </tr></thead>
                <tbody>
                  {reviews.map(r => (
                    <tr key={r._id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium">{r.user?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{r.menuItem?.name || '—'}</td>
                      <td className="px-4 py-3 text-yellow-400 text-base">{'★'.repeat(r.rating)}<span className="text-gray-200">{'★'.repeat(5 - r.rating)}</span></td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px]">{r.comment ? <span className="italic text-xs">"{r.comment}"</span> : <em className="text-gray-300 text-xs">No comment</em>}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => del(r._id)} className="border border-red-100 text-red-400 px-2.5 py-1.5 rounded-lg text-xs hover:bg-red-50"><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminOrders;
