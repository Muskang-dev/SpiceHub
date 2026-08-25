import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { AdminSidebar, StatusBadge, Spinner } from '../../components/common';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  const downloadPDF = async (url, filename) => {
    try {
      const r = await api.get(url, { responseType: 'blob' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }));
      link.download = filename; document.body.appendChild(link); link.click(); link.remove();
    } catch { alert('Could not download PDF'); }
  };

  useEffect(() => { api.get('/admin/stats').then(r => setStats(r.data)); }, []);

  if (!stats) return <div className="flex h-screen"><AdminSidebar /><div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div></div>;

  const cards = [
    { label: 'Menu Items', value: stats.menuCount, icon: 'fa-utensils', color: 'bg-orange-50 text-orange-600', border: 'border-l-[#e05c2a]' },
    { label: 'Total Orders', value: stats.orderCount, icon: 'fa-receipt', color: 'bg-green-50 text-green-600', border: 'border-l-green-500' },
    { label: 'Customers', value: stats.userCount, icon: 'fa-users', color: 'bg-blue-50 text-blue-600', border: 'border-l-blue-500' },
    { label: 'Revenue', value: `₹${(stats.revenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: 'fa-rupee-sign', color: 'bg-purple-50 text-purple-600', border: 'border-l-purple-500' },
  ];

  const quickLinks = [
    { to: '/admin/analytics', icon: 'fa-chart-line', label: 'Analytics' },
    { to: '/admin/coupons/new', icon: 'fa-tag', label: 'New Coupon' },
    { to: '/admin/customers', icon: 'fa-users', label: 'Customers' },
    { to: '/admin/reviews', icon: 'fa-star', label: 'Reviews' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-head text-2xl font-bold text-[#1a1a2e]">Dashboard</h1>
          <span className="text-sm text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {cards.map(c => (
            <div key={c.label} className={`bg-white rounded-2xl border-l-4 ${c.border} shadow-sm p-4 flex items-center gap-3`}>
              <div className={`w-11 h-11 rounded-xl ${c.color} flex items-center justify-center`}>
                <i className={`fas ${c.icon}`}></i>
              </div>
              <div>
                <div className="font-head text-2xl font-bold text-[#1a1a2e]">{c.value}</div>
                <div className="text-xs text-gray-500">{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {quickLinks.map(l => (
            <Link key={l.to} to={l.to} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex flex-col items-center gap-2 hover:border-[#e05c2a] hover:shadow-md transition-all group">
              <i className={`fas ${l.icon} text-[#e05c2a] text-lg`}></i>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-[#e05c2a]">{l.label}</span>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* Recent Orders */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-head font-bold text-gray-800">Recent Orders</h2>
              <Link to="/admin/orders" className="text-xs text-[#e05c2a] font-semibold hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                  <th className="px-4 py-2.5 text-left">ID</th><th className="px-4 py-2.5 text-left">Customer</th>
                  <th className="px-4 py-2.5 text-right">Amount</th><th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5"></th>
                </tr></thead>
                <tbody>
                  {(stats.recentOrders || []).map(o => (
                    <tr key={o._id} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-mono font-bold text-xs text-gray-500">#{o._id.slice(-6).toUpperCase()}</td>
                      <td className="px-4 py-3 font-medium">{o.user?.name || 'Guest'}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#e05c2a]">₹{o.totalAmount?.toFixed(0)}</td>
                      <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => downloadPDF(`/admin/orders/${o._id}/kitchen-ticket`, `kitchen-${o._id.slice(-6)}.pdf`)} className="text-xs border border-gray-200 px-2 py-1 rounded-lg hover:border-[#e05c2a] hover:text-[#e05c2a] cursor-pointer"><i className="fas fa-print"></i></button>
                          <button onClick={() => downloadPDF(`/admin/orders/${o._id}/invoice`, `invoice-${o._id.slice(-6)}.pdf`)} className="text-xs border border-gray-200 px-2 py-1 rounded-lg hover:border-[#e05c2a] hover:text-[#e05c2a] cursor-pointer"><i className="fas fa-file-pdf"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Bookings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="font-head font-bold text-gray-800">Pending Bookings</h2>
              <Link to="/admin/bookings" className="text-xs text-[#e05c2a] font-semibold hover:underline">View All</Link>
            </div>
            {(stats.pendingBookings || []).length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No pending bookings 🎉</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 text-xs text-gray-400 uppercase">
                    <th className="px-4 py-2.5 text-left">Name</th><th className="px-4 py-2.5 text-left">Date & Time</th>
                    <th className="px-4 py-2.5 text-left">Guests</th><th className="px-4 py-2.5 text-left">Action</th>
                  </tr></thead>
                  <tbody>
                    {(stats.pendingBookings || []).map(b => (
                      <BookingRow key={b._id} booking={b} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function BookingRow({ booking: b }) {
  const [status, setStatus] = useState(b.status);
  const update = async (s) => { setStatus(s); await api.put(`/admin/bookings/${b._id}/status`, { status: s }); };
  return (
    <tr className="border-t border-gray-50 hover:bg-gray-50/50">
      <td className="px-4 py-3 font-medium">{b.name}</td>
      <td className="px-4 py-3 text-xs text-gray-500">{new Date(b.date).toLocaleDateString('en-IN')} {b.time}</td>
      <td className="px-4 py-3">{b.guests}</td>
      <td className="px-4 py-3">
        <select value={status} onChange={e => update(e.target.value)} className="border border-gray-200 rounded-lg text-xs px-2 py-1 focus:outline-none focus:border-[#e05c2a]">
          {['Pending','Confirmed','Cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
      </td>
    </tr>
  );
}
