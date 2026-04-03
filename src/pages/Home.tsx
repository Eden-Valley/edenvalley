import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollSound } from '@/hooks/useScrollSound';
import { useScrollVelocity } from '@/hooks/useScrollVelocity';
import ParticleField from '@/components/ParticleField';
import { Volume2, VolumeX } from 'lucide-react';

const TOTAL_FRAMES = 14;
const COOLDOWN_BASE = 1200;

const Home = () => {
  const [activeFrame, setActiveFrame] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { t } = useLanguage();
  const { playTransitionSound, playSound, setMusicIntensity, isMuted, toggleMute, hasStarted, audioError } = useScrollSound();
  const { velocity, isScrolling } = useScrollVelocity();
  
  const cooldownRef = useRef(false);
  const touchStartY = useRef(0);

  // Frame-specific cooldowns for pacing
  const getCooldown = (index: number) => {
    if (index === 7) return 2500; // Quote frame — linger
    if (index === 12) return 3000; // "No more" — dramatic hold
    return COOLDOWN_BASE;
  };

  const goToFrame = useCallback((index: number) => {
    if (cooldownRef.current) return;
    if (index < 0 || index >= TOTAL_FRAMES) return;

    cooldownRef.current = true;
    setActiveFrame(index);
    
    const intensity = index <= 8 ? 0.2 + (index * 0.05) : 0.9;
    setMusicIntensity(intensity);
    
    if (index === 12) {
      playSound('power');
    } else {
      playTransitionSound(index);
    }
    
    setHasScrolled(true);

    setTimeout(() => {
      cooldownRef.current = false;
    }, getCooldown(index));
  }, [playTransitionSound, playSound, setMusicIntensity]);

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
    document.documentElement.classList.add('home-page');
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.documentElement.classList.remove('home-page');
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleWheel, handleKeyDown, handleTouchStart, handleTouchMove]);

  const fc = (i: number) => {
    if (i === activeFrame) return 'active';
    if (i < activeFrame) return 'prev';
    return 'next';
  };

  // Dynamic background based on frame
  const getBgClass = () => {
    if (activeFrame >= 9 && activeFrame <= 11) return 'frame-bg-crimson';
    if (activeFrame === 12) return '';
    if (activeFrame === 13) return 'frame-bg-eden';
    return '';
  };

  return (
    <div className={`fixed inset-0 bg-background overflow-hidden transition-colors duration-[2000ms] ${getBgClass()}`}>
      <ParticleField scrollVelocity={isScrolling ? velocity : 0.5} isScrolling={cooldownRef.current} activeFrame={activeFrame} />
      
      {/* Progress */}
      <div className="fixed top-0 left-0 w-full h-[1px] bg-primary/10 z-50">
        <div className="h-full bg-primary/60 transition-all duration-1000 ease-out" style={{ width: `${((activeFrame + 1) / TOTAL_FRAMES) * 100}%` }} />
      </div>

      {/* Sound */}
      <button onClick={toggleMute} className="sound-toggle" aria-label={isMuted ? "Unmute" : "Mute"}>
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      {audioError && (
        <div className="fixed top-16 right-6 z-50 max-w-xs p-3 bg-destructive/10 border border-destructive/30 rounded backdrop-blur-sm">
          <p className="text-destructive text-xs">{audioError}</p>
        </div>
      )}

      {hasStarted && (
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
        
        {/* Frame 0: Opening — massive single line */}
        <div className={`frame ${fc(0)}`}>
          <div className="max-w-5xl px-6 md:px-12">
            <p className="font-display text-foreground font-extralight tracking-tight leading-[0.9] text-morph-in" style={{ fontSize: 'clamp(2.5rem, 10vw, 8rem)' }}>
              {t('home.f1')}
            </p>
          </div>
        </div>

        {/* Frame 1: Build the road */}
        <div className={`frame ${fc(1)}`}>
          <div className="max-w-5xl px-6 md:px-12">
            <p className="font-display text-foreground font-extralight tracking-tight leading-[0.9] text-morph-in" style={{ fontSize: 'clamp(2.5rem, 10vw, 8rem)' }}>
              {t('home.f2')}
            </p>
          </div>
        </div>

        {/* Frame 2: Almost nobody — massive impact */}
        <div className={`frame ${fc(2)}`}>
          <div className="max-w-6xl px-6 md:px-12">
            <p className="font-display text-foreground font-bold tracking-tighter leading-[0.85] reveal-scale" style={{ fontSize: 'clamp(3rem, 14vw, 12rem)' }}>
              {t('home.f3')}
            </p>
          </div>
        </div>

        {/* Frame 3: Not a bug — split reveal */}
        <div className={`frame ${fc(3)}`}>
          <div className="max-w-4xl px-6 md:px-12 space-y-8">
            <p className="font-display text-foreground font-light tracking-tight leading-[1.1] reveal-split-left stagger-1" style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}>
              {t('home.f4a')}
            </p>
            <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed reveal-split-right stagger-3 max-w-lg mx-auto">
              {t('home.f4b')}
            </p>
          </div>
        </div>

        {/* Frame 4: Wozniak — left aligned, dramatic */}
        <div className={`frame ${fc(4)}`}>
          <div className="max-w-5xl w-full px-6 md:px-12 text-left md:text-center">
            <p className="font-display text-foreground font-bold tracking-tighter leading-none letter-cascade stagger-1" style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }}>
              {t('home.f5.woz')}
            </p>
            <p className="font-body text-muted-foreground mt-4 md:mt-6 text-sm md:text-base leading-relaxed reveal-up stagger-3 max-w-md mx-auto md:mx-auto">
              {t('home.f5.wozSub')}
            </p>
          </div>
        </div>

        {/* Frame 5: Jobs — contrasting style */}
        <div className={`frame ${fc(5)}`}>
          <div className="max-w-5xl w-full px-6 md:px-12 text-right md:text-center">
            <p className="font-display text-foreground font-bold tracking-tighter leading-none letter-cascade stagger-1" style={{ fontSize: 'clamp(3rem, 10vw, 8rem)' }}>
              {t('home.f5.jobs')}
            </p>
            <p className="font-body text-muted-foreground mt-4 md:mt-6 text-sm md:text-base leading-relaxed reveal-up stagger-3 max-w-md ml-auto md:mx-auto">
              {t('home.f5.jobsSub')}
            </p>
          </div>
        </div>

        {/* Frame 6: Walt & Roy — overlapping text */}
        <div className={`frame ${fc(6)}`}>
          <div className="max-w-4xl px-6 md:px-12 space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12">
              <p className="font-display text-foreground font-semibold tracking-tight reveal-split-left stagger-1" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
                {t('home.f6.walt')}
              </p>
              <span className="text-eden-dim font-mono text-xs tracking-widest reveal-scale stagger-2">&</span>
              <p className="font-display text-foreground font-semibold tracking-tight reveal-split-right stagger-3" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
                {t('home.f6.roy')}
              </p>
            </div>
            <p className="font-body text-muted-foreground text-sm md:text-base leading-relaxed reveal-up stagger-5 max-w-lg mx-auto text-center">
              {t('home.f6.waltSub')}
            </p>
          </div>
        </div>

        {/* Frame 7: The Quote — breathing, centered */}
        <div className={`frame ${fc(7)} frame-bg-warm`}>
          <div className="max-w-3xl px-6 md:px-12 text-center">
            <p className="font-display text-foreground font-light italic leading-relaxed reveal-text stagger-1" style={{ fontSize: 'clamp(1.3rem, 3vw, 2.5rem)', animation: activeFrame === 7 ? 'breathe-scale 4s ease-in-out infinite' : undefined }}>
              {t('home.f6.quote1')}
            </p>
            <p className="font-display text-primary font-semibold not-italic mt-6 reveal-up stagger-3" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 3rem)' }}>
              {t('home.f6.quote2')}
            </p>
          </div>
        </div>

        {/* Frame 8: But society forgot — massive, dark */}
        <div className={`frame ${fc(8)} frame-bg-deep`}>
          <div className="max-w-6xl px-6 md:px-12">
            <p className="font-display text-foreground font-extralight tracking-tighter leading-[0.85] reveal-scale-massive" style={{ fontSize: 'clamp(3rem, 12vw, 10rem)' }}>
              {t('home.f7')}
            </p>
          </div>
        </div>

        {/* Frame 9: Mapmakers/Bricks — crimson tint, staggered lines */}
        <div className={`frame ${fc(9)} frame-bg-crimson`}>
          <div className="max-w-3xl px-6 md:px-12 space-y-4 text-center">
            <p className="font-display text-foreground font-light leading-relaxed reveal-split-left stagger-1" style={{ fontSize: 'clamp(1.3rem, 3vw, 2.2rem)' }}>
              {t('home.f8a')}
            </p>
            <p className="font-display text-foreground font-light leading-relaxed reveal-split-right stagger-2" style={{ fontSize: 'clamp(1.3rem, 3vw, 2.2rem)' }}>
              {t('home.f8b')}
            </p>
            <p className="font-display text-muted-foreground italic mt-8 reveal-up stagger-4" style={{ fontSize: 'clamp(1rem, 2vw, 1.6rem)' }}>
              {t('home.f8c')}
            </p>
          </div>
        </div>

        {/* Frame 10: Burnout — crimson pulse */}
        <div className={`frame ${fc(10)} frame-bg-crimson`}>
          <div className="max-w-4xl px-6 md:px-12 text-center">
            <p className="font-display text-foreground font-light italic leading-[1.2] reveal-text stagger-1" style={{ fontSize: 'clamp(1.8rem, 5vw, 4rem)' }}>
              {t('home.f9a')}
            </p>
            <p className="font-display text-eden-crimson font-black tracking-[0.2em] uppercase mt-8 reveal-scale stagger-3 crimson-glow" style={{ fontSize: 'clamp(1.2rem, 3vw, 2rem)' }}>
              {t('home.f9b')}
            </p>
          </div>
        </div>

        {/* Frame 11: Pause — breathing darkness before the flash */}
        <div className={`frame ${fc(11)} frame-bg-deep`}>
          <div className="flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-foreground/20 reveal-scale" style={{ animation: activeFrame === 11 ? 'pulse-expand 2s ease-in-out infinite' : undefined }} />
          </div>
        </div>

        {/* Frame 12: NO MORE — white flash */}
        <div className={`frame ${fc(12)} ${activeFrame === 12 ? 'white-flash' : ''}`}>
          <div className="max-w-full px-4">
            <p className="font-display font-black tracking-tighter leading-none no-more-text" style={{
              fontSize: 'clamp(5rem, 22vw, 22rem)',
              color: activeFrame === 12 ? '#0A0A0A' : undefined,
              transition: 'color 0.3s ease'
            }}>
              {t('home.f10')}
            </p>
          </div>
        </div>

        {/* Frame 13: CTA — Eden Valley */}
        <div className={`frame ${fc(13)} frame-bg-eden`}>
          <div className="flex flex-col items-center max-w-2xl px-6 md:px-8">
            <p className="font-display text-foreground tracking-[0.3em] md:tracking-[0.5em] leading-tight text-morph-in text-center" style={{ fontSize: 'clamp(2rem, 5vw, 4.5rem)', animation: activeFrame === 13 ? 'glow-pulse 3s ease-in-out infinite' : undefined }}>
              {t('home.edenValley')}
            </p>
            <div className="w-[80px] md:w-[120px] h-[1px] bg-primary/40 my-8 md:my-10 line-expand stagger-2" />
            <Link to="/role" className="eden-btn reveal-up stagger-3 px-10 md:px-16 py-4 md:py-5 text-base md:text-lg tracking-[0.2em]">
              {t('home.cta')}
            </Link>
            <p className="font-body text-muted-foreground mt-8 md:mt-10 text-sm max-w-md reveal-up stagger-4 text-center leading-relaxed">
              {t('home.sub')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
