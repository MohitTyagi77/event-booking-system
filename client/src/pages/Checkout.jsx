import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../services/api';
import { useSocketData } from '../context/SocketContext';

const confettiItems = Array.from({ length: 18 }).map((_, i) => i);

const Checkout = () => {
  const { state } = useLocation();
  const { socket, socketId, lockUpdates } = useSocketData();
  const [form, setForm] = useState({ name: '', email: '', mobile: '', quantity: state?.quantity || 1 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalPayable = useMemo(
    () => (state?.unitPrice ? Number(state.unitPrice) * Number(form.quantity) : Number(state?.event?.price || 0) * Number(form.quantity)),
    [state, form.quantity]
  );

  useEffect(() => {
    if (!state?.event?.id || !socket) return;

    const applyLock = () => {
      socket.emit('lockSeat', { eventId: state.event.id, quantity: Number(form.quantity) });
    };

    const handleSeatLockResult = ({ eventId, ok, message }) => {
      if (Number(eventId) !== Number(state.event.id)) return;
      if (!ok) setError(message || 'Unable to lock seats right now');
      else setError('');
    };

    applyLock();
    socket.on('seatLockResult', handleSeatLockResult);

    return () => {
      socket.emit('releaseSeat', { eventId: state.event.id });
      socket.off('seatLockResult', handleSeatLockResult);
    };
  }, [socket, state?.event?.id, form.quantity]);

  if (!state?.event) return <p className="p-6">No event selected.</p>;

  const effectiveAvailableSeats = lockUpdates[state.event.id]?.effectiveAvailableSeats ?? state.event.available_seats;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/bookings', {
        event_id: state.event.id,
        socket_id: socketId,
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

  const downloadQr = () => {
    const canvas = document.getElementById('ticket-qr');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `ticket-${result?.bookingId || 'booking'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (result) {
    const ticketPayload = JSON.stringify({
      bookingId: result.bookingId,
      event: state.event.title,
      attendee: form.name,
      quantity: Number(form.quantity),
      ticketCategory: state.ticketCategory || 'Standard'
    });

    return (
      <main className="mx-auto max-w-xl space-y-6 px-6 py-12 text-center">
        <div className="pointer-events-none relative h-24 overflow-hidden">
          {confettiItems.map((item) => (
            <motion.span
              key={item}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 90, opacity: [0, 1, 0] }}
              transition={{ duration: 1.6, delay: item * 0.06, repeat: Infinity, repeatDelay: 0.6 }}
              className="absolute inline-block h-3 w-2 rounded-sm"
              style={{
                left: `${(item * 100) / confettiItems.length}%`,
                background: item % 2 === 0 ? '#22d3ee' : '#f472b6'
              }}
            />
          ))}
        </div>

        <h1 className="text-4xl font-black text-emerald-400">Booking Confirmed!</h1>
        <p>Booking ID: {result.bookingId}</p>
        <p className="text-sm text-slate-300">{state.ticketCategory || 'Standard'} ticket · Qty {Number(form.quantity)}</p>
        <div className="mx-auto w-fit rounded-xl bg-white p-4">
          <QRCodeCanvas id="ticket-qr" value={ticketPayload} size={220} />
        </div>
        <button onClick={downloadQr} className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950">
          Download QR Ticket
        </button>
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
        <p className="text-sm text-slate-300">Category: {state.ticketCategory || 'Standard'}</p>
        <p className="text-sm text-cyan-300">Real-time available seats: {effectiveAvailableSeats}</p>
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
          max={Math.max(1, Number(effectiveAvailableSeats))}
          type="number"
          className="w-full rounded-lg bg-slate-800 px-4 py-3"
          value={form.quantity}
          onChange={(e) => setForm((prev) => ({ ...prev, quantity: Math.max(1, Number(e.target.value) || 1) }))}
        />
        <p>Total payable: ${totalPayable.toFixed(2)}</p>
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        <button
          disabled={submitting || Number(form.quantity) > Number(effectiveAvailableSeats)}
          className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-60"
        >
          {submitting ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </motion.form>
    </main>
  );
};

export default Checkout;
