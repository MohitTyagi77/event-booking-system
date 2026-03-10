import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const EventCard = ({ event }) => {
  const soldOut = event.available_seats <= 0;

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.02 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-lg shadow-cyan-900/10"
    >
      <div className="h-48 overflow-hidden">
        <img src={event.img} alt={event.title} className="h-full w-full object-cover transition duration-500 hover:scale-110" />
      </div>
      <div className="space-y-3 p-5">
        <h3 className="text-xl font-bold">{event.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-300">{event.description}</p>
        <p className="text-sm text-cyan-300">{event.location}</p>
        <p className="text-sm text-slate-400">{new Date(event.date).toLocaleString()}</p>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-semibold ${soldOut ? 'text-rose-400' : 'text-emerald-400'}`}>
            {soldOut ? 'Sold Out' : `${event.available_seats} seats left`}
          </span>
          <span className="font-bold text-cyan-300">${event.price}</span>
        </div>
        <Link
          to={`/events/${event.id}`}
          className="inline-block rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          View Details
        </Link>
      </div>
    </motion.article>
  );
};

export default EventCard;
