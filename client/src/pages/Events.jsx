import { useEffect, useMemo, useState } from 'react';
import EventCard from '../components/EventCard';
import api from '../services/api';
import { useSocketData } from '../context/SocketContext';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ search: '', location: '', date: '' });
  const [error, setError] = useState('');
  const { seatUpdates } = useSocketData();

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events', { params: filters });
      setEvents(data);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load events');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters.search, filters.location, filters.date]);

  const mergedEvents = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        available_seats: seatUpdates[event.id] ?? event.available_seats
      })),
    [events, seatUpdates]
  );

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <h1 className="text-4xl font-black">Events</h1>
      <div className="grid gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 md:grid-cols-3">
        <input
          placeholder="Search by title"
          className="rounded-lg bg-slate-800 px-4 py-2"
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
        />
        <input
          placeholder="Filter by location"
          className="rounded-lg bg-slate-800 px-4 py-2"
          onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
        />
        <input
          type="date"
          className="rounded-lg bg-slate-800 px-4 py-2"
          onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
        />
      </div>
      {error ? <p className="text-rose-300">{error}</p> : null}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mergedEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </main>
  );
};

export default Events;
