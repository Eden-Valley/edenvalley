import { Link } from 'react-router-dom';
import MinimalNav from '@/components/MinimalNav';

const RoleChoice = () => (
  <div className="grain-overlay min-h-screen bg-background flex flex-col items-center justify-center p-8">
    <MinimalNav />
    <h1 className="font-display text-foreground font-light tracking-[0.1em] mb-16" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
      What is your intention?
    </h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2px] max-w-[900px] w-full">
      <Link to="/test" className="choice-card">
        <span className="text-2xl mb-6 text-primary">◎</span>
        <h2 className="font-body text-xs tracking-[0.3em] mb-4">FOUND & BUILD</h2>
        <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">
          I carry a vision that must exist,<br />or an energy that's looking for its cause.
        </p>
        <span className="font-mono text-xs text-primary mt-8 tracking-[0.15em]">ENTER →</span>
      </Link>
      <Link to="/funder" className="choice-card">
        <span className="text-2xl mb-6 text-primary">◈</span>
        <h2 className="font-body text-xs tracking-[0.3em] mb-4">FUND</h2>
        <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">
          I'm looking to invest in innovation structures<br />that are structurally infallible.
        </p>
        <span className="font-mono text-xs text-primary mt-8 tracking-[0.15em]">DISCOVER →</span>
      </Link>
    </div>
  </div>
);

export default RoleChoice;
