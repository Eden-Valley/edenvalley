import { Link } from 'react-router-dom';

const MinimalNav = () => (
  <nav className="fixed top-0 left-0 z-50 p-6">
    <Link to="/" className="font-display text-sm tracking-[0.3em] text-foreground no-underline opacity-50 hover:opacity-100 transition-opacity">
      🌳 EV
    </Link>
  </nav>
);

export default MinimalNav;
