import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';

const Checkout = () => {
  const { state } = useLocation();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', quantity: state?.quantity || 1 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!state?.event) return <p className="p-6">No event selected.</p>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        event_id: state.event.id,
        ...form,
        quantity: Number(form.quantity)
      });
      setResult(data);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const ticketPayload = JSON.stringify({ bookingId: result.bookingId, event: state.event.title, attendee: form.name });
    return (
      <main className="mx-auto max-w-xl space-y-6 px-6 py-12 text-center">
        <h1 className="text-4xl font-black text-emerald-400">Booking Confirmed!</h1>
        <p>Booking ID: {result.bookingId}</p>
        <div className="mx-auto w-fit rounded-xl bg-white p-4">
          <QRCodeSVG value={ticketPayload} size={220} />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <motion.form
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-6"
      >
        <h1 className="text-3xl font-black">Checkout</h1>
        {['name', 'email', 'mobile'].map((field) => (
          <input
            key={field}
            required
            type={field === 'email' ? 'email' : 'text'}
            placeholder={field[0].toUpperCase() + field.slice(1)}
            className="w-full rounded-lg bg-slate-800 px-4 py-3"
            value={form[field]}
            onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
          />
        ))}
        <input
          required
          min="1"
          max={state.event.available_seats}
          type="number"
          className="w-full rounded-lg bg-slate-800 px-4 py-3"
          value={form.quantity}
          onChange={(e) => setForm((prev) => ({ ...prev, quantity: Math.max(1, Number(e.target.value) || 1) }))}
        />
        <p>Total payable: ${(Number(state.event.price) * Number(form.quantity)).toFixed(2)}</p>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button disabled={submitting} className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-60">
          {submitting ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </motion.form>
    </main>
  );
};

export default Checkout;
