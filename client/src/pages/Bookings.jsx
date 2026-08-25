import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, EmptyState, StatusBadge } from '../components/common';
import toast from 'react-hot-toast';

const TIMES = ['12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','7:00 PM','7:30 PM','8:00 PM','8:30 PM','9:00 PM','9:30 PM','10:00 PM'];

export default function Bookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', date: '', time: '', guests: 2, occasion: 'None', notes: '' });

  const fetchBookings = () => api.get('/bookings').then(r => { setBookings(r.data); setLoading(false); });
  
  useEffect(() => { fetchBookings(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/bookings', form);
      toast.success('Table reserved! We will confirm shortly. 🍽');
      setShowForm(false);
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Reservation failed'); }
    finally { setSubmitting(false); }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    await api.put(`/bookings/${id}/cancel`);
    toast.success('Reservation cancelled.');
    fetchBookings();
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-head text-3xl font-bold text-[#1a1a2e]">My Reservations</h1>
        <button onClick={() => setShowForm(true)} className="bg-[#e05c2a] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#c04820] transition-colors flex items-center gap-2">
          <i className="fas fa-plus text-sm"></i> Reserve a Table
        </button>
      </div>

      {bookings.length === 0 ? (
        <EmptyState icon="🍽" title="No reservations yet" desc="Reserve a table for a perfect dining experience." action={<button onClick={() => setShowForm(true)} className="bg-[#e05c2a] text-white px-6 py-2.5 rounded-xl font-semibold">Reserve Now</button>} />
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <i className="fas fa-calendar-alt text-[#e05c2a]"></i>
                    {new Date(b.date).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
                  </h3>
                  <p className="text-gray-500 text-sm mt-0.5">
                    <i className="fas fa-clock mr-1"></i>{b.time} &nbsp;·&nbsp; <i className="fas fa-users mr-1"></i>{b.guests} guests
                    {b.occasion !== 'None' && <span className="ml-2">🎉 {b.occasion}</span>}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              {b.notes && <p className="text-sm text-gray-500 italic mt-1">Note: {b.notes}</p>}
              {b.status !== 'Cancelled' && (
                <button onClick={() => cancel(b._id)} className="mt-3 text-xs border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Cancel Reservation</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking info sidebar */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        {[['fa-clock','Opening Hours','Lunch: 12–3 PM\nDinner: 7–11 PM'],['fa-phone','Call to Reserve','+91 98765 43210'],['fa-map-marker-alt','Location','42, Spice Lane\nNew Delhi – 110001']].map(([icon, title, text]) => (
          <div key={title} className="bg-[#fdf8f5] rounded-2xl border border-orange-100 p-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-2"><i className={`fas ${icon} text-[#e05c2a]`}></i> {title}</h4>
            <p className="text-sm text-gray-600 whitespace-pre-line">{text}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg my-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-head text-2xl font-bold">Reserve a Table</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e => setForm(f => ({...f, date: e.target.value}))} required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <select value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))} required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]">
                    <option value="">Select time</option>
                    {TIMES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guests *</label>
                  <input type="number" min="1" max="20" value={form.guests} onChange={e => setForm(f => ({...f, guests: e.target.value}))} required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occasion</label>
                  <select value={form.occasion} onChange={e => setForm(f => ({...f, occasion: e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a]">
                    {['None','Birthday','Anniversary','Business','Other'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} rows={2} placeholder="Dietary needs, seating preferences..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#e05c2a] resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={submitting} className="flex-1 bg-[#e05c2a] text-white py-3 rounded-xl font-bold hover:bg-[#c04820] transition-colors disabled:opacity-60">
                  {submitting ? 'Reserving...' : 'Confirm Reservation'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-3 rounded-xl font-semibold text-gray-600 hover:border-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
