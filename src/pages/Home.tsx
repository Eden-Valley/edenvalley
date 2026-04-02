import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const TOTAL_FRAMES = 11;
const SCROLL_PER_FRAME = 160;

const Home = () => {
  const [activeFrame, setActiveFrame] = useState(0);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const idx = Math.min(Math.floor(scrollY / SCROLL_PER_FRAME), TOTAL_FRAMES - 1);
    setActiveFrame(idx);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const isActive = (i: number) => {
    if (i === TOTAL_FRAMES - 1) return activeFrame >= i;
    return i === activeFrame;
  };

  return (
    <div className="grain-overlay" style={{ height: `calc(${TOTAL_FRAMES} * ${SCROLL_PER_FRAME}px + 100vh)` }}>
      <div className="sticky-stage bg-background">
        {/* Frame 1 */}
        <div className={`frame ${isActive(0) ? 'active' : ''}`}>
          <p className="font-display text-foreground font-light tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
            Some people see the map.
          </p>
          <span className="absolute bottom-8 text-eden-dim text-lg" style={{ animation: 'bounce-fade 2s ease-in-out infinite' }}>▼</span>
        </div>

        {/* Frame 2 */}
        <div className={`frame ${isActive(1) ? 'active' : ''}`}>
          <p className="font-display text-foreground font-light tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
            Some people build the road.
          </p>
        </div>

        {/* Frame 3 */}
        <div className={`frame ${isActive(2) ? 'active' : ''}`}>
          <p className="font-display text-foreground font-light tracking-tight" style={{ fontSize: 'clamp(2.5rem, 7vw, 7rem)' }}>
            Almost nobody does both.
          </p>
        </div>

        {/* Frame 4 */}
        <div className={`frame ${isActive(3) ? 'active' : ''}`}>
          <div className="max-w-2xl">
            <p className="font-display text-foreground font-light tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
              And that's not a bug.<br />
              <span className="text-muted-foreground">That's how civilization was always built.</span>
            </p>
          </div>
        </div>

        {/* Frame 5 */}
        <div className={`frame ${isActive(4) ? 'active' : ''}`}>
          <div className="max-w-2xl space-y-4">
            <p className="font-display tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
              <span className="text-white font-semibold">Wozniak</span>{' '}
              <span className="text-eden-dim">saw the map.</span>
            </p>
            <p className="font-display tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
              <span className="text-white font-semibold">Jobs</span>{' '}
              <span className="text-eden-dim">built the road.</span>
            </p>
          </div>
        </div>

        {/* Frame 6 */}
        <div className={`frame ${isActive(5) ? 'active' : ''}`}>
          <div className="max-w-2xl space-y-4">
            <p className="font-display tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
              <span className="text-white font-semibold">Walt</span>{' '}
              <span className="text-eden-dim">dreamed.</span>
            </p>
            <p className="font-display tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
              <span className="text-white font-semibold">Roy</span>{' '}
              <span className="text-eden-dim">managed.</span>
            </p>
            <p className="font-body text-muted-foreground mt-8" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', lineHeight: 1.8 }}>
              The greatest empires were never built by one person.<br />
              They were built by <em>two halves<br />who stopped pretending to be whole.</em>
            </p>
          </div>
        </div>

        {/* Frame 7 - red tint */}
        <div className={`frame ${isActive(6) ? 'active' : ''}`} style={isActive(6) ? { background: 'radial-gradient(ellipse at center, #1a0505 0%, hsl(0,0%,4%) 70%)' } : {}}>
          <p className="font-display text-foreground font-light tracking-tight" style={{ fontSize: 'clamp(2.5rem, 7vw, 7rem)' }}>
            But society forgot.
          </p>
        </div>

        {/* Frame 8 */}
        <div className={`frame ${isActive(7) ? 'active' : ''}`} style={isActive(7) ? { background: 'radial-gradient(ellipse at center, #1a0505 0%, hsl(0,0%,4%) 70%)' } : {}}>
          <div className="max-w-2xl">
            <p className="font-display text-foreground font-light tracking-tight leading-relaxed" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              It told the mapmakers to lay bricks.<br />
              It told the builders to draw maps.<br />
              <span className="text-muted-foreground">And it told investors to fund people<br />who claim they can do both.</span>
            </p>
          </div>
        </div>

        {/* Frame 9 */}
        <div className={`frame ${isActive(8) ? 'active' : ''}`}>
          <div className="max-w-2xl">
            <p className="font-display text-foreground font-light italic tracking-tight" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              We all burned out<br />
              <span className="text-eden-crimson">pretending to be complete.</span>
            </p>
          </div>
        </div>

        {/* Frame 10 - white flash */}
        <div className={`frame ${isActive(9) ? 'active white-flash' : ''}`}>
          <p className="font-display font-bold tracking-tight" style={{ fontSize: 'clamp(4rem, 12vw, 12rem)', color: isActive(9) ? '#0A0A0A' : undefined }}>
            No more.
          </p>
        </div>

        {/* Frame 11 - CTA */}
        <div className={`frame ${isActive(10) ? 'active' : ''}`}>
          <p className="font-display text-foreground tracking-[0.3em]" style={{ fontSize: 'clamp(2rem, 4vw, 4rem)', animation: 'glow-pulse 3s ease-in-out infinite' }}>
            🌳 EDEN VALLEY
          </p>
          <Link to="/role" className="eden-btn mt-8">
            WHO ARE YOU, REALLY?
          </Link>
          <p className="font-body text-muted-foreground mt-6 text-sm max-w-md">
            We don't look for complete profiles. We look for specialized genius.
          </p>
          <p className="font-mono text-xs text-eden-faint mt-8 tracking-wide">
            🌍 EN | FR | ES | RU | AR | ZH | JA
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
