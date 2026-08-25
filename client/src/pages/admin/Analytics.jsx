import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import { AdminSidebar, Spinner } from '../../components/common';

const COLORS = ['#e05c2a','#f4a623','#1a1a2e','#16a34a','#2563eb','#7c3aed','#db2777','#0891b2'];
const STATUS_COLORS = { Pending:'#f59e0b', Confirmed:'#3b82f6', Preparing:'#8b5cf6', 'Out for Delivery':'#06b6d4', Delivered:'#16a34a', Cancelled:'#ef4444' };

export default function Analytics() {
  const [data, setData] = useState(null);
  const [view, setView] = useState('30days');

  useEffect(() => { api.get('/admin/analytics').then(r => setData(r.data)); }, []);

  if (!data) return <div className="flex h-screen"><AdminSidebar /><div className="flex-1 flex items-center justify-center"><Spinner size="lg" /></div></div>;

  const revenueData = view === '30days' ? data.daily : data.monthly;
  const pieData = (data.byStatus || []).map(s => ({ name: s._id, value: s.count }));

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h1 className="font-head text-2xl font-bold text-[#1a1a2e]">Sales Analytics</h1>
          <div className="flex gap-2">
            <button onClick={() => setView('30days')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${view==='30days' ? 'bg-[#e05c2a] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#e05c2a]'}`}>30 Days</button>
            <button onClick={() => setView('12months')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${view==='12months' ? 'bg-[#e05c2a] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#e05c2a]'}`}>12 Months</button>
          </div>
        </div>

        {/* Revenue Line Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <h2 className="font-head font-bold text-gray-800 mb-4">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${v.toFixed(2)}`, 'Revenue']} contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="#e05c2a" strokeWidth={2.5} dot={{ r: 4, fill: '#e05c2a' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Top Items */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-head font-bold text-gray-800 mb-4">Top Selling Items</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.topItems || []} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis type="category" dataKey="_id" tick={{ fontSize: 11, fill: '#6b7280' }} width={110} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} formatter={(v) => [v, 'Qty Sold']} />
                <Bar dataKey="totalQty" radius={[0,6,6,0]}>
                  {(data.topItems || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-head font-bold text-gray-800 mb-4">Orders by Status</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name] || '#9ca3af'} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Revenue */}
          <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-head font-bold text-gray-800 mb-4">Revenue by Category</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.byCat || []} margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`₹${v.toFixed(2)}`, 'Revenue']} contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Bar dataKey="revenue" radius={[6,6,0,0]}>
                  {(data.byCat || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
