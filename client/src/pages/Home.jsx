import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const highlights = [
  'AI-powered event recommendations',
  'Instant seat updates via Socket.IO',
  'One-click booking with QR tickets'
];

const Home = () => (
  <main className="gradient-bg overflow-hidden">
    <section className="relative flex min-h-screen items-center px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Premium Live Experiences</p>
          <h1 className="text-5xl font-black leading-tight md:text-7xl">
            Smart Event Booking
            <span className="block bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
              for the Next Era
            </span>
          </h1>
          <p className="max-w-xl text-lg text-slate-300">
            A modern booking platform inspired by immersive event landing pages, featuring cinematic visuals,
            smooth scrolling interactions, and real-time seat intelligence.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/events" className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 hover:bg-cyan-300">
              Explore Events
            </Link>
            <a href="#highlights" className="rounded-xl border border-white/30 px-6 py-3 font-semibold hover:bg-white/10">
              Why Smart Event?
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="parallax rounded-3xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200')", backgroundSize: 'cover' }}
        >
          <div className="h-[500px] rounded-2xl bg-black/40 p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Featured Week</p>
            <h2 className="mt-4 text-3xl font-bold">Future Fest 2026</h2>
          </div>
        </motion.div>
      </div>
    </section>

    <section id="highlights" className="mx-auto max-w-6xl space-y-6 px-6 py-24">
      {highlights.map((text, index) => (
        <motion.div
          key={text}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.15 }}
          className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-xl font-semibold"
        >
          {text}
        </motion.div>
      ))}
    </section>
  </main>
);

export default Home;
