import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollSound } from '@/hooks/useScrollSound';
import { useScrollVelocity } from '@/hooks/useScrollVelocity';
import ParticleField from '@/components/ParticleField';
import { Volume2, VolumeX } from 'lucide-react';

const TOTAL_FRAMES = 6;
const COOLDOWN_BASE = 1200;

const Home = () => {
  const [activeFrame, setActiveFrame] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showAdhdInfo, setShowAdhdInfo] = useState(false);
  const { t, lang } = useLanguage();
  const { playTransitionSound, playSound, setMusicIntensity, isMuted, toggleMute, hasStarted, audioError } = useScrollSound();
  const { velocity, isScrolling } = useScrollVelocity();
  
  const cooldownRef = useRef(false);
  const touchStartY = useRef(0);

  // Frame-specific cooldowns for pacing
  const getCooldown = (index: number) => {
    if (index === 5) return 3000; // Final CTA — linger
    return COOLDOWN_BASE;
  };

  const goToFrame = useCallback((index: number) => {
    if (cooldownRef.current) return;
    if (index < 0 || index >= TOTAL_FRAMES) return;

    cooldownRef.current = true;
    setActiveFrame(index);
    
    const intensity = index <= 4 ? 0.2 + (index * 0.1) : 0.9;
    setMusicIntensity(intensity);
    
    if (index === 5) {
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

      {/* Auth link */}
      <Link to="/auth" className="fixed top-6 left-6 z-50 text-primary text-[10px] tracking-[0.2em] uppercase font-mono hover:text-primary/70 transition-colors duration-300">
        {t('auth.alreadyAccess')}
      </Link>

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

      {/* Scroll hint - hidden when ADHD info is expanded */}
      {activeFrame === 0 && !hasScrolled && !showAdhdInfo && (
        <div className="fixed bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
          <div className="w-[1px] h-6 md:h-8 bg-gradient-to-b from-transparent to-eden-dim" />
          <span className="text-eden-dim text-[10px] md:text-xs tracking-[0.3em] uppercase" style={{ animation: 'bounce-fade 2s ease-in-out infinite' }}>{t('home.scroll')}</span>
        </div>
      )}

      <div className="sticky-stage">
        
        {/* Frame 0: Hero — ADHD Incubator identity */}
        <div className={`frame ${fc(0)}`}>
          <div className="max-w-4xl md:max-w-5xl px-4 md:px-12 text-center">
            {/* Main headline - with highlighted keywords */}
            <p className="font-display text-foreground font-extralight tracking-tight leading-[1.15] text-morph-in mb-4 md:mb-5" style={{ fontSize: 'clamp(1.25rem, 4vw, 2.75rem)' }}>
              {lang === 'fr' ? (
                <>
                  Eden Valley est le premier <span className="text-primary font-normal">incubateur de startups</span> au monde pour les <span className="text-primary font-normal">fondateurs TDAH</span> — et ceux qui <span className="text-primary font-normal">construisent</span> avec eux, les <span className="text-primary font-normal">soutiennent</span> et les <span className="text-primary font-normal">financent</span>.
                </>
              ) : (
                <>
                  Eden Valley is the world's first <span className="text-primary font-normal">startup incubator</span> built for <span className="text-primary font-normal">ADHD founders</span> — and those who <span className="text-primary font-normal">build</span> with them, <span className="text-primary font-normal">back</span> them, and <span className="text-primary font-normal">fund</span> them.
                </>
              )}
            </p>

            {/* Subtitle */}
            <p className="font-body text-muted-foreground text-xs md:text-base leading-relaxed max-w-lg md:max-w-2xl mx-auto mb-5 md:mb-6 reveal-up stagger-2 px-2 md:px-0">
              {t('home.hero.subtitle')}
            </p>

            {/* CTA Button */}
            <Link to="/role" className="eden-btn reveal-up stagger-3 px-5 md:px-10 py-2 md:py-3.5 text-xs md:text-base tracking-[0.12em] md:tracking-[0.15em]">
              {t('home.hero.cta')}
            </Link>

            {/* ADHD Explainer Toggle */}
            <div className="mt-1 md:mt-2 reveal-up stagger-4">
              <button
                onClick={() => setShowAdhdInfo(!showAdhdInfo)}
                className="text-primary/60 text-[10px] md:text-xs tracking-widest hover:text-primary transition-colors border-b border-primary/30 pb-0.5"
              >
                {showAdhdInfo ? '− Hide' : t('home.hero.whatIsAdhd')}
              </button>
              {showAdhdInfo && (
                <div className="mt-3 md:mt-4 max-w-lg md:max-w-2xl mx-auto text-left px-2 md:px-0">
                  <p className="font-body text-muted-foreground text-[11px] md:text-sm leading-relaxed">
                    {t('home.hero.adhdExplainer')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Frame 1: Four People */}
        <div className={`frame ${fc(1)}`}>
          <div className="max-w-6xl px-4 md:px-12">
            <p className="font-display text-foreground font-light tracking-tight leading-[1.2] text-center mb-6 md:mb-12 reveal-text px-2 md:px-0" style={{ fontSize: 'clamp(1.25rem, 3.5vw, 2rem)' }}>
              {t('home.fourPeople.title')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {/* Thinker */}
              <div className="p-4 md:p-6 border border-primary/20 rounded-sm reveal-up stagger-1">
                <p className="font-display text-foreground text-lg mb-2">{t('home.fourPeople.thinker.title')}</p>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">{t('home.fourPeople.thinker.desc')}</p>
              </div>
              {/* Doer */}
              <div className="p-4 md:p-6 border border-primary/20 rounded-sm reveal-up stagger-2">
                <p className="font-display text-foreground text-base md:text-lg mb-1 md:mb-2">{t('home.fourPeople.doer.title')}</p>
                <p className="font-body text-muted-foreground text-xs md:text-sm leading-relaxed">{t('home.fourPeople.doer.desc')}</p>
              </div>
              {/* Backer */}
              <div className="p-4 md:p-6 border border-primary/20 rounded-sm reveal-up stagger-3">
                <p className="font-display text-foreground text-base md:text-lg mb-1 md:mb-2">{t('home.fourPeople.backer.title')}</p>
                <p className="font-body text-muted-foreground text-xs md:text-sm leading-relaxed">{t('home.fourPeople.backer.desc')}</p>
              </div>
              {/* Investor */}
              <div className="p-4 md:p-6 border border-primary/20 rounded-sm reveal-up stagger-4">
                <p className="font-display text-foreground text-base md:text-lg mb-1 md:mb-2">{t('home.fourPeople.investor.title')}</p>
                <p className="font-body text-muted-foreground text-xs md:text-sm leading-relaxed">{t('home.fourPeople.investor.desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Frame 2: The Problem */}
        <div className={`frame ${fc(2)}`}>
          <div className="max-w-4xl px-4 md:px-12 text-center">
            <p className="font-display text-foreground font-light tracking-tight leading-[1.3] reveal-text stagger-1 mb-4 md:mb-8 px-2 md:px-0" style={{ fontSize: 'clamp(1.25rem, 3.5vw, 2.5rem)' }}>
              {t('home.problem.headline')}
            </p>
            <p className="font-body text-muted-foreground text-xs md:text-base leading-relaxed reveal-up stagger-2 max-w-xl md:max-w-2xl mx-auto mb-4 md:mb-6 px-2 md:px-0">
              {t('home.problem.body')}
            </p>
            <p className="font-display text-foreground text-sm md:text-lg reveal-up stagger-3 px-2 md:px-0">
              {t('home.problem.solution')}
            </p>
          </div>
        </div>

        {/* Frame 3: The System (Euphrates, Pischon, Havila) */}
        <div className={`frame ${fc(3)}`}>
          <div className="max-w-4xl px-4 md:px-12">
            <p className="font-display text-foreground font-light tracking-tight leading-[1.3] text-center mb-6 md:mb-10 reveal-text px-2 md:px-0" style={{ fontSize: 'clamp(1.25rem, 3.5vw, 2rem)' }}>
              {t('home.system.headline')}
            </p>
            <div className="space-y-4 md:space-y-6">
              <div className="p-3 md:p-4 border-l-2 border-primary/40 reveal-up stagger-1">
                <p className="font-body text-foreground text-xs md:text-base leading-relaxed">{t('home.system.euphrates')}</p>
              </div>
              <div className="p-3 md:p-4 border-l-2 border-primary/40 reveal-up stagger-2">
                <p className="font-body text-foreground text-xs md:text-base leading-relaxed">{t('home.system.pischon')}</p>
              </div>
              <div className="p-3 md:p-4 border-l-2 border-primary/40 reveal-up stagger-3">
                <p className="font-body text-foreground text-xs md:text-base leading-relaxed">{t('home.system.havila')}</p>
              </div>
            </div>
            <p className="font-body text-muted-foreground text-[10px] md:text-sm text-center mt-6 md:mt-8 reveal-up stagger-4 max-w-xl md:max-w-2xl mx-auto px-2 md:px-0">
              {t('home.system.equityNote')}
            </p>
          </div>
        </div>

        {/* Frame 4: Transition/Build */}
        <div className={`frame ${fc(4)} frame-bg-deep`}>
          <div className="max-w-4xl px-4 md:px-12 text-center">
            <p className="font-display text-foreground font-extralight tracking-[0.1em] reveal-text stagger-1" style={{ fontSize: 'clamp(2rem, 8vw, 5rem)', lineHeight: 0.9 }}>
              EDEN VALLEY
            </p>
            <p className="font-body text-muted-foreground mt-4 md:mt-6 reveal-up stagger-2 tracking-widest text-xs md:text-sm px-2 md:px-0">
              Built for the builders. Backed by the believers.
            </p>
          </div>
        </div>

        {/* Frame 5: Final CTA */}
        <div className={`frame ${fc(5)} frame-bg-eden`}>
          <div className="flex flex-col items-center max-w-2xl px-4 md:px-8">
            <p className="font-display text-foreground font-light tracking-tight leading-[1.3] text-center reveal-text stagger-1 mb-4 md:mb-6 px-2 md:px-0" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.75rem)' }}>
              {t('home.cta.headline')}
            </p>
            <p className="font-body text-muted-foreground text-xs md:text-base leading-relaxed text-center reveal-up stagger-2 mb-6 md:mb-8 max-w-lg md:max-w-xl px-2 md:px-0">
              {t('home.cta.body')}
            </p>
            <Link to="/role" className="eden-btn reveal-up stagger-3 px-6 md:px-16 py-3 md:py-5 text-sm md:text-lg tracking-[0.15em] md:tracking-[0.2em]">
              {t('home.cta.button')}
            </Link>
            <p className="font-body text-muted-foreground/60 text-[10px] md:text-xs mt-3 md:mt-4 reveal-up stagger-4 px-2 md:px-0">
              {t('home.cta.note')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
