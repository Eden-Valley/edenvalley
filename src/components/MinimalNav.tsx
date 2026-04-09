import { Link } from 'react-router-dom';

const MinimalNav = () => (
  <nav className="fixed top-0 left-0 w-full z-[100] px-8 py-6 flex justify-between items-center pointer-events-none">
    <div className="pointer-events-auto group">
      <Link 
        to="/" 
        className="font-display text-sm tracking-[0.4em] text-foreground no-underline transition-all duration-500 hover:tracking-[0.6em] flex items-center gap-4"
      >
        <div className="relative w-6 h-6 group-hover:scale-110 transition-transform duration-500">
          <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-eden-green rotate-45" />
          <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-eden-green -rotate-45" />
          <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[1px] h-3 bg-eden-green/40" />
        </div>
        <span className="opacity-60 group-hover:opacity-100 transition-opacity uppercase">EDEN VALLEY</span>
      </Link>
    </div>
    
    <div className="pointer-events-auto flex items-center gap-8">
      {/* Dynamic sound toggle will be here if needed, but it's currently in Home.tsx */}
    </div>
  </nav>
);

export default MinimalNav;
