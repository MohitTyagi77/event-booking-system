import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data);
        setError('');
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load event');
      }
    };

    fetchEvent();
  }, [id]);

  const total = useMemo(() => (event ? Number(event.price) * Number(quantity || 0) : 0), [event, quantity]);

  if (error) return <p className="p-6 text-rose-300">{error}</p>;
  if (!event) return <p className="p-6">Loading event...</p>;

  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-2">
      <img src={event.img} alt={event.title} className="h-96 w-full rounded-2xl object-cover" />
      <section className="space-y-4">
        <h1 className="text-4xl font-black">{event.title}</h1>
        <p className="text-slate-300">{event.description}</p>
        <p className="text-cyan-300">{event.location}</p>
        <p>{new Date(event.date).toLocaleString()}</p>
        <iframe
          className="h-56 w-full rounded-xl"
          loading="lazy"
          title="Event location map"
          allowFullScreen
          src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&z=14&output=embed`}
        />
        <div className="flex items-center gap-4">
          <label>Tickets</label>
          <input
            type="number"
            min="1"
            max={event.available_seats}
            value={quantity}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isNaN(next)) return;
              setQuantity(Math.max(1, Math.min(next, Number(event.available_seats) || 1)));
            }}
            className="w-20 rounded bg-slate-800 px-2 py-1"
          />
        </div>
        <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
        <Link
          to="/checkout"
          state={{ event, quantity, total }}
          className="inline-block rounded-lg bg-cyan-400 px-5 py-3 font-bold text-slate-950"
        >
          Book Now
        </Link>
      </section>
    </main>
  );
};

export default EventDetails;
