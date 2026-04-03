import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

const LoadingScreen = ({ onComplete, duration = 3800 }: { onComplete: () => void, duration?: number }) => {
  const [phase, setPhase] = useState(0);
  const { lang } = useLanguage();

  useEffect(() => {
    const p1 = Math.floor(duration * 0.08);
    const p2 = Math.floor(duration * 0.42);
    const p3 = Math.floor(duration * 0.74);

    const timers = [
      setTimeout(() => setPhase(1), p1),
      setTimeout(() => setPhase(2), p2),
      setTimeout(() => setPhase(3), p3),
      setTimeout(() => onComplete(), duration),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete, duration]);

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

      {/* Language indicator */}
      <div
        className="absolute top-8 right-8 text-muted-foreground transition-all duration-[1000ms] ease-out"
        style={{
          opacity: phase >= 1 ? 1 : 0,
          fontSize: '0.75rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {lang === 'fr' ? 'Français' : 
         lang === 'es' ? 'Español' : 
         lang === 'ru' ? 'Русский' : 
         lang === 'ar' ? 'العربية' : 
         lang === 'zh' ? '中文' : 
         lang === 'ja' ? '日本語' : 'English'}
      </div>

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
            opacity: phase >= 2 ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
