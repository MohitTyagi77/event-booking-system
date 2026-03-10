import { useEffect, useState } from 'react';
import api from '../services/api';

const initialForm = {
  title: '',
  description: '',
  location: '',
  date: '',
  total_seats: 100,
  available_seats: 100,
  price: 99,
  img: ''
};

const toDateTimeLocal = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [eventsRes, bookingsRes] = await Promise.all([api.get('/events'), api.get('/bookings')]);
      setEvents(eventsRes.data);
      setBookings(bookingsRes.data);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load admin data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      total_seats: Number(form.total_seats),
      available_seats: Number(form.available_seats),
      price: Number(form.price)
    };

    try {
      if (editId) {
        await api.put(`/events/${editId}`, payload);
      } else {
        await api.post('/events', payload);
      }
      setForm(initialForm);
      setEditId(null);
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save event');
    }
  };

  const onDelete = async (id) => {
    try {
      await api.delete(`/events/${id}`);
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete event');
    }
  };

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-2">
      <section>
        <h1 className="mb-4 text-3xl font-black">Admin Dashboard</h1>
        {error ? <p className="mb-3 text-sm text-rose-300">{error}</p> : null}
        <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-white/10 bg-slate-900/70 p-4">
          {Object.keys(initialForm).map((field) => (
            <input
              key={field}
              type={field.includes('date') ? 'datetime-local' : field.includes('seats') || field === 'price' ? 'number' : 'text'}
              placeholder={field}
              value={form[field]}
              onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
              className="w-full rounded bg-slate-800 px-3 py-2"
              required={field !== 'img'}
            />
          ))}
          <button className="rounded bg-cyan-400 px-4 py-2 font-bold text-slate-950">{editId ? 'Update' : 'Create'} Event</button>
        </form>
        <div className="mt-6 space-y-3">
          {events.map((event) => (
            <div key={event.id} className="rounded border border-white/10 bg-slate-900/60 p-3">
              <p className="font-semibold">{event.title}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    setEditId(event.id);
                    setForm({
                      title: event.title || '',
                      description: event.description || '',
                      location: event.location || '',
                      date: toDateTimeLocal(event.date),
                      total_seats: event.total_seats,
                      available_seats: event.available_seats,
                      price: event.price,
                      img: event.img || ''
                    });
                  }}
                  className="rounded bg-amber-400 px-3 py-1 text-sm text-black"
                >
                  Edit
                </button>
                <button onClick={() => onDelete(event.id)} className="rounded bg-rose-500 px-3 py-1 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-bold">Bookings</h2>
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded border border-white/10 bg-slate-900/60 p-3">
              <p className="font-semibold">{booking.name} · {booking.event_title}</p>
              <p className="text-sm text-slate-300">{booking.email} · Qty: {booking.quantity} · ${booking.total_amount}</p>
              <p className="text-xs uppercase text-emerald-300">{booking.status}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
