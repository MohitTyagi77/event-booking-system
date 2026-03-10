import { Link, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/admin', label: 'Admin' }
];

const Navbar = () => (
  <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <Link to="/" className="text-xl font-black tracking-wide text-white">
        SMART<span className="text-cyan-400">EVENT</span>
      </Link>
      <div className="flex gap-6 text-sm font-semibold uppercase tracking-wider">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `transition hover:text-cyan-300 ${isActive ? 'text-cyan-300' : 'text-slate-300'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  </header>
);

export default Navbar;
