import { useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { useScrollSound } from '@/hooks/useScrollSound';
import { useScrollVelocity } from '@/hooks/useScrollVelocity';
import ParticleField from '@/components/ParticleField';
import MinimalNav from '@/components/MinimalNav';
import { Volume2, VolumeX } from 'lucide-react';

interface ScrollPageProps {
  children: ReactNode;
  totalFrames: number;
  pageName: string;
  showNav?: boolean;
  showSound?: boolean;
  showProgress?: boolean;
  frameBgClasses?: Record<number, string>;
}

const COOLDOWN_BASE = 1200;

export function ScrollPage({
  children,
  totalFrames,
  pageName,
  showNav = true,
  showSound = true,
  showProgress = true,
  frameBgClasses = {},
}: ScrollPageProps) {
  const [activeFrame, setActiveFrame] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { playTransitionSound, playSound, setMusicIntensity, isMuted, toggleMute, hasStarted, audioError } = useScrollSound();
  const { velocity, isScrolling } = useScrollVelocity();

  const cooldownRef = useRef(false);
  const touchStartY = useRef(0);

  const getCooldown = (index: number) => {
    if (index === totalFrames - 1) return 3000;
    return COOLDOWN_BASE;
  };

  const goToFrame = useCallback((index: number) => {
    if (cooldownRef.current) return;
    if (index < 0 || index >= totalFrames) return;

    cooldownRef.current = true;
    setActiveFrame(index);

    const intensity = index <= totalFrames - 2 ? 0.2 + (index * 0.1) : 0.9;
    setMusicIntensity(intensity);

    if (index === totalFrames - 1) {
      playSound('power');
    } else {
      playTransitionSound(index);
    }

    setHasScrolled(true);

    setTimeout(() => {
      cooldownRef.current = false;
    }, getCooldown(index));
  }, [playTransitionSound, playSound, setMusicIntensity, totalFrames]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (Math.abs(e.deltaY) < 25) return;
    if (e.deltaY > 0) goToFrame(activeFrame + 1);
    else goToFrame(activeFrame - 1);
  }, [activeFrame, goToFrame]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      goToFrame(activeFrame + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      goToFrame(activeFrame - 1);
    }
  }, [activeFrame, goToFrame]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const deltaY = touchStartY.current - e.touches[0].clientY;
    if (Math.abs(deltaY) > 40) {
      if (deltaY > 0) goToFrame(activeFrame + 1);
      else goToFrame(activeFrame - 1);
      touchStartY.current = e.touches[0].clientY;
    }
  }, [activeFrame, goToFrame]);

  useEffect(() => {
    document.documentElement.classList.add(pageName);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.documentElement.classList.remove(pageName);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleWheel, handleKeyDown, handleTouchStart, handleTouchMove, pageName]);

  const getBgClass = () => {
    return frameBgClasses[activeFrame] || '';
  };

  const fc = (i: number) => {
    if (i === activeFrame) return 'active';
    if (i < activeFrame) return 'prev';
    return 'next';
  };

  return (
    <div className={`fixed inset-0 bg-background overflow-hidden transition-colors duration-[2000ms] ${getBgClass()}`}>
      <ParticleField scrollVelocity={isScrolling ? velocity : 0.5} isScrolling={cooldownRef.current} activeFrame={activeFrame} />

      {showProgress && (
        <div className="fixed top-0 left-0 w-full h-[1px] bg-primary/10 z-50">
          <div className="h-full bg-primary/60 transition-all duration-1000 ease-out" style={{ width: `${((activeFrame + 1) / totalFrames) * 100}%` }} />
        </div>
      )}

      {showNav && <MinimalNav />}

      {showSound && (
        <button onClick={toggleMute} className="sound-toggle" aria-label={isMuted ? "Unmute" : "Mute"}>
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      )}

      {audioError && showSound && (
        <div className="fixed top-16 right-6 z-50 max-w-xs p-3 bg-destructive/10 border border-destructive/30 rounded backdrop-blur-sm">
          <p className="text-destructive text-xs">{audioError}</p>
        </div>
      )}

      {hasStarted && showSound && (
        <div className="fixed bottom-6 right-6 z-50 text-primary/40">
          <span className="text-xs tracking-widest animate-pulse">♪</span>
        </div>
      )}

      {/* Scroll hint */}
      {activeFrame === 0 && !hasScrolled && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
          <div className="w-[1px] h-8 bg-gradient-to-b from-transparent to-eden-dim" />
          <span className="text-eden-dim text-xs tracking-[0.3em] uppercase" style={{ animation: 'bounce-fade 2s ease-in-out infinite' }}>Scroll</span>
        </div>
      )}

      <div className="sticky-stage">
        {children}
      </div>
    </div>
  );
}

export function Frame({ children, index, activeFrame }: { children: ReactNode; index: number; activeFrame: number }) {
  const fc = (i: number) => {
    if (i === activeFrame) return 'active';
    if (i < activeFrame) return 'prev';
    return 'next';
  };

  return (
    <div className={`frame ${fc(index)}`}>
      {children}
    </div>
  );
}
