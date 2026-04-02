import { useState, useEffect } from 'react';

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1600),
      setTimeout(() => setPhase(3), 2800),
      setTimeout(() => onComplete(), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center overflow-hidden">
      {/* Breathing ambient light */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-0 transition-opacity duration-[2000ms]"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)',
          opacity: phase >= 1 ? 0.6 : 0,
          animation: phase >= 1 ? 'loading-breathe 3s ease-in-out infinite' : 'none',
        }}
      />

      {/* Vertical line reveal */}
      <div
        className="absolute w-[1px] bg-primary/30 transition-all duration-[1200ms] ease-out"
        style={{
          height: phase >= 1 ? '40vh' : '0',
          opacity: phase >= 3 ? 0 : 1,
        }}
      />

      {/* Title */}
      <div className="relative flex flex-col items-center gap-4">
        <div
          className="font-display tracking-[0.4em] text-foreground transition-all duration-[1000ms] ease-out"
          style={{
            fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)',
            letterSpacing: phase >= 2 ? '0.4em' : '0.1em',
          }}
        >
          EDEN VALLEY
        </div>
        <div
          className="h-[1px] bg-primary/40 transition-all duration-[800ms] ease-out"
          style={{
            width: phase >= 2 ? '120px' : '0',
            opacity: phase >= 3 ? 0 : 1,
          }}
        />
      </div>

      {/* Fade out overlay */}
      <div
        className="absolute inset-0 bg-background transition-opacity duration-[800ms]"
        style={{ opacity: phase >= 3 ? 1 : 0 }}
      />
    </div>
  );
};

export default LoadingScreen;
