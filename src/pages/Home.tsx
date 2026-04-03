import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollSound } from '@/hooks/useScrollSound';
import { useScrollVelocity } from '@/hooks/useScrollVelocity';
import ParticleField from '@/components/ParticleField';
import { Volume2, VolumeX } from 'lucide-react';

const TOTAL_FRAMES = 12;
const COOLDOWN_DURATION = 1500; // ms between frame changes
const QUOTE_MIN_DURATION = 3500; // ms for quote frame

const Home = () => {
  const [activeFrame, setActiveFrame] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { t } = useLanguage();
  const { playTransitionSound, playSound, setMusicIntensity, isMuted, toggleMute, hasStarted, audioError } = useScrollSound();
  const { velocity, isScrolling } = useScrollVelocity();
  
  const cooldownRef = useRef(false);
  const touchStartY = useRef(0);

  const goToFrame = useCallback((index: number) => {
    if (cooldownRef.current) return;
    if (index < 0 || index >= TOTAL_FRAMES) return;

    // Special case for quote frame (index 6)
    const cooldown = index === 6 ? QUOTE_MIN_DURATION : COOLDOWN_DURATION;

    cooldownRef.current = true;
    setActiveFrame(index);
    
    // Music intensity based on narrative: low for pain frames (0-7), high for revelation/CTA (8+)
    const intensity = index <= 7 ? 0.2 : 0.9;
    setMusicIntensity(intensity);
    
    // Synchronized audio for "no more" (index 10)
    if (index === 10) {
      playSound('power');
    } else {
      playTransitionSound(index);
    }
    
    setHasScrolled(true);

    setTimeout(() => {
      cooldownRef.current = false;
    }, cooldown);
  }, [playTransitionSound, playSound]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (Math.abs(e.deltaY) < 30) return; // Ignore small scrolls
    
    if (e.deltaY > 0) {
      goToFrame(activeFrame + 1);
    } else {
      goToFrame(activeFrame - 1);
    }
  }, [activeFrame, goToFrame]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if user is typing in an input/textarea
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }
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
    const touchEndY = e.touches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;

    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        goToFrame(activeFrame + 1);
      } else {
        goToFrame(activeFrame - 1);
      }
      touchStartY.current = touchEndY; // Reset to prevent multiple triggers
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

  const getFrameClass = (i: number) => {
    if (i === activeFrame) return 'active';
    if (i < activeFrame) return 'prev';
    return 'next';
  };

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Ambient particles - responsive to scroll speed (simulated via transitions) */}
      <ParticleField 
        scrollVelocity={isScrolling ? velocity : 0.5}
        isScrolling={cooldownRef.current}
        activeFrame={activeFrame}
      />
      
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 w-full h-[1px] bg-primary/20 z-50">
        <div 
          className="h-full bg-primary transition-all duration-1000 ease-in-out"
          style={{ width: `${((activeFrame + 1) / TOTAL_FRAMES) * 100}%` }}
        />
      </div>

      {/* Sound Toggle */}
      <button 
        onClick={toggleMute}
        className="fixed top-6 right-6 z-50 p-2 rounded-full border border-border bg-background/50 backdrop-blur-sm text-foreground hover:bg-accent transition-colors"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* Audio Error Display */}
      {audioError && (
        <div className="fixed top-20 right-6 z-50 max-w-xs p-3 bg-destructive/10 border border-destructive/30 rounded backdrop-blur-sm">
          <p className="text-destructive text-xs">{audioError}</p>
        </div>
      )}

      {/* Audio started indicator */}
      {hasStarted && (
        <div className="fixed bottom-6 right-6 z-50 text-primary/60 animate-pulse">
          <span className="text-xs tracking-widest">♪</span>
        </div>
      )}

      {/* Scroll hint */}
      {activeFrame === 0 && !hasScrolled && (
        <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 text-eden-dim text-sm z-40 animate-pulse">
          <span className="block text-center">Scroll to explore</span>
        </div>
      )}

      <div className="sticky-stage">
        {/* Frame 1 */}
        <div className={`frame ${getFrameClass(0)}`}>
          <div className="max-w-4xl px-8 flex flex-col items-center">
            <p className="font-display text-foreground font-light tracking-tight leading-[1.15] reveal-text font-dynamic" style={{ fontSize: 'clamp(2rem, 8vw, 6rem)' }}>
              {t('home.f1')}
            </p>
            <span className="mt-12 text-eden-dim text-lg circular-rotation" style={{ animation: 'bounce-fade 2s ease-in-out infinite' }}>▼</span>
          </div>
        </div>

        {/* Frame 2 */}
        <div className={`frame ${getFrameClass(1)}`}>
          <div className="max-w-4xl px-8">
            <p className="font-display text-foreground font-light tracking-tight leading-[1.15] reveal-text font-dynamic" style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}>
              {t('home.f2')}
            </p>
          </div>
        </div>

        {/* Frame 3 */}
        <div className={`frame ${getFrameClass(2)}`}>
          <div className="max-w-5xl px-8">
            <p className="font-display text-foreground font-light tracking-tight leading-[1.1] reveal-text font-dynamic" style={{ fontSize: 'clamp(2.5rem, 9vw, 8rem)' }}>
              {t('home.f3')}
            </p>
          </div>
        </div>

        {/* Frame 4 */}
        <div className={`frame ${getFrameClass(3)}`}>
          <div className="max-w-3xl px-8 space-y-6">
            <p className="font-display text-foreground font-light tracking-tight leading-[1.15] reveal-text font-dynamic" style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}>
              {t('home.f4a')}<br />
              <span className="text-muted-foreground block mt-8 text-[0.4em] tracking-normal leading-relaxed reveal-up">{t('home.f4b')}</span>
            </p>
          </div>
        </div>

        {/* Frame 5 - Woz & Jobs */}
        <div className={`frame ${getFrameClass(4)}`}>
          <div className="max-w-3xl px-8 space-y-12">
            <div className="group relative">
              <p className="font-display tracking-tight leading-[1.15] reveal-up cursor-help" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>
                <span className="text-foreground font-semibold block mb-4">{t('home.f5.woz')}</span>
                <span className="text-eden-dim text-[0.5em] tracking-normal block leading-relaxed">{t('home.f5.wozSub')}</span>
              </p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-4 bg-card border border-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-sm text-muted-foreground shadow-2xl">
                Steve Wozniak was the technical pioneer who built the first Apple computers by hand.
              </div>
            </div>
            <div className="group relative">
              <p className="font-display tracking-tight leading-[1.15] reveal-up cursor-help" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', animationDelay: '0.15s' }}>
                <span className="text-foreground font-semibold block mb-4">{t('home.f5.jobs')}</span>
                <span className="text-eden-dim text-[0.5em] tracking-normal block leading-relaxed">{t('home.f5.jobsSub')}</span>
              </p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-4 bg-card border border-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-sm text-muted-foreground shadow-2xl">
                Steve Jobs was the visionary builder who saw the potential to change the world with Woz's inventions.
              </div>
            </div>
          </div>
        </div>

        {/* Frame 6 - Analogies */}
        <div className={`frame ${getFrameClass(5)}`}>
          <div className="max-w-3xl px-8 space-y-12 text-left md:text-center">
            <div className="space-y-8">
              <div className="group relative">
                <p className="font-display tracking-tight leading-[1.15] reveal-up cursor-help" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}>
                  <span className="text-foreground font-semibold block mb-4">{t('home.f6.walt')}</span>
                  <span className="text-eden-dim text-[0.5em] tracking-normal block leading-relaxed">{t('home.f6.waltSub')}</span>
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-4 bg-card border border-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-sm text-muted-foreground shadow-2xl">
                  Walt was the visionary dreamer who imagined Disneyland and the characters.
                </div>
              </div>
              <div className="group relative">
                <p className="font-display tracking-tight leading-[1.15] reveal-up cursor-help" style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)', animationDelay: '0.15s' }}>
                  <span className="text-foreground font-semibold block mb-4">{t('home.f6.roy')}</span>
                  <span className="text-eden-dim text-[0.5em] tracking-normal block leading-relaxed">{t('home.f6.roySub')}</span>
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-4 bg-card border border-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-sm text-muted-foreground shadow-2xl">
                  Roy was the financial genius who turned Walt's dreams into a sustainable business empire.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frame 7 - The Quote (NEW) */}
        <div className={`frame ${getFrameClass(6)}`}>
          <div className="max-w-4xl px-8 text-center">
            <p className="font-display text-foreground font-light italic tracking-tight leading-relaxed reveal-up" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.8rem)' }}>
              {t('home.f6.quote1')}<br />
              <span className="text-eden-green block mt-6 not-italic font-semibold">{t('home.f6.quote2')}</span>
            </p>
          </div>
        </div>

        {/* Frame 8 - red tint */}
        <div className={`frame ${getFrameClass(7)}`} style={activeFrame === 7 ? { background: 'radial-gradient(ellipse at center, #1a0505 0%, hsl(0,0%,4%) 70%)' } : {}}>
          <div className="max-w-5xl px-8">
            <p className="font-display text-foreground font-light tracking-tight leading-[1.1] reveal-text font-dynamic" style={{ fontSize: 'clamp(2.5rem, 9vw, 8rem)' }}>
              {t('home.f7')}
            </p>
          </div>
        </div>

        {/* Frame 9 */}
        <div className={`frame ${getFrameClass(8)}`} style={activeFrame === 8 ? { background: 'radial-gradient(ellipse at center, #1a0505 0%, hsl(0,0%,4%) 70%)' } : {}}>
          <div className="max-w-3xl px-8">
            <p className="font-display text-foreground font-light tracking-tight leading-relaxed whitespace-pre-line reveal-text font-dynamic" style={{ fontSize: 'clamp(1.5rem, 4vw, 2.8rem)' }}>
              {t('home.f8a')}<br />
              <span className="block mt-6">{t('home.f8b')}</span><br />
              <span className="text-muted-foreground block mt-8 italic text-[0.7em]">{t('home.f8c')}</span>
            </p>
          </div>
        </div>

        {/* Frame 10 */}
        <div className={`frame ${getFrameClass(9)}`}>
          <div className="max-w-4xl px-8">
            <p className="font-display text-foreground font-light italic tracking-tight leading-[1.15] reveal-text font-dynamic" style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}>
              {t('home.f9a')}<br />
              <span className="text-eden-crimson block mt-8 not-italic font-bold tracking-widest uppercase">{t('home.f9b')}</span>
            </p>
          </div>
        </div>

        {/* Frame 11 - white flash */}
        <div className={`frame ${getFrameClass(10)} ${activeFrame === 10 ? 'white-flash' : ''}`}>
          <div className="max-w-full px-8">
            <p className="font-display font-bold tracking-tighter leading-none reveal-text no-more-text" style={{ fontSize: 'clamp(4rem, 18vw, 18rem)', color: activeFrame === 10 ? '#0A0A0A' : undefined }}>
              {t('home.f10')}
            </p>
          </div>
        </div>

        {/* Frame 12 - CTA */}
        <div className={`frame ${getFrameClass(11)}`}>
          <div className="flex flex-col items-center max-w-2xl px-8">
            <p className="font-display text-foreground tracking-[0.4em] leading-tight reveal-text text-center font-dynamic" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)', animation: 'glow-pulse 3s ease-in-out infinite' }}>
              {t('home.edenValley')}
            </p>
            <div className="w-[100px] h-[1px] bg-primary/40 my-10 reveal-up" style={{ animationDelay: '0.2s' }} />
            <Link to="/role" className="eden-btn mt-6 reveal-up px-16 py-5 text-xl tracking-widest" style={{ animationDelay: '0.3s' }}>
              {t('home.cta')}
            </Link>
            <p className="font-body text-muted-foreground mt-10 text-base max-w-md reveal-up text-center leading-relaxed" style={{ animationDelay: '0.4s' }}>
              {t('home.sub')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
