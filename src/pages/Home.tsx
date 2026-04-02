import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';

const TOTAL_FRAMES = 11;
const SCROLL_PER_FRAME = 160;

const Home = () => {
  const [activeFrame, setActiveFrame] = useState(0);
  const { t } = useLanguage();

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
          <p className="font-display text-foreground font-light tracking-tight reveal-text" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
            {t('home.f1')}
          </p>
          <span className="absolute bottom-8 text-eden-dim text-lg" style={{ animation: 'bounce-fade 2s ease-in-out infinite' }}>▼</span>
        </div>

        {/* Frame 2 */}
        <div className={`frame ${isActive(1) ? 'active' : ''}`}>
          <p className="font-display text-foreground font-light tracking-tight reveal-text" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
            {t('home.f2')}
          </p>
        </div>

        {/* Frame 3 */}
        <div className={`frame ${isActive(2) ? 'active' : ''}`}>
          <p className="font-display text-foreground font-light tracking-tight reveal-text" style={{ fontSize: 'clamp(2.5rem, 7vw, 7rem)' }}>
            {t('home.f3')}
          </p>
        </div>

        {/* Frame 4 */}
        <div className={`frame ${isActive(3) ? 'active' : ''}`}>
          <div className="max-w-2xl">
            <p className="font-display text-foreground font-light tracking-tight reveal-text" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
              {t('home.f4a')}<br />
              <span className="text-muted-foreground">{t('home.f4b')}</span>
            </p>
          </div>
        </div>

        {/* Frame 5 */}
        <div className={`frame ${isActive(4) ? 'active' : ''}`}>
          <div className="max-w-2xl space-y-4">
            <p className="font-display tracking-tight reveal-up" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
              <span className="text-foreground font-semibold">{t('home.f5.woz')}</span>{' '}
              <span className="text-eden-dim">{t('home.f5.wozSub')}</span>
            </p>
            <p className="font-display tracking-tight reveal-up" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)', animationDelay: '0.15s' }}>
              <span className="text-foreground font-semibold">{t('home.f5.jobs')}</span>{' '}
              <span className="text-eden-dim">{t('home.f5.jobsSub')}</span>
            </p>
          </div>
        </div>

        {/* Frame 6 */}
        <div className={`frame ${isActive(5) ? 'active' : ''}`}>
          <div className="max-w-2xl space-y-4">
            <p className="font-display tracking-tight reveal-up" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)' }}>
              <span className="text-foreground font-semibold">{t('home.f6.walt')}</span>{' '}
              <span className="text-eden-dim">{t('home.f6.waltSub')}</span>
            </p>
            <p className="font-display tracking-tight reveal-up" style={{ fontSize: 'clamp(2rem, 5vw, 5rem)', animationDelay: '0.15s' }}>
              <span className="text-foreground font-semibold">{t('home.f6.roy')}</span>{' '}
              <span className="text-eden-dim">{t('home.f6.roySub')}</span>
            </p>
            <p className="font-body text-muted-foreground mt-8 reveal-up whitespace-pre-line" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', lineHeight: 1.8, animationDelay: '0.3s' }}>
              {t('home.f6.body1')}<br />
              <em>{t('home.f6.body2')}</em>
            </p>
          </div>
        </div>

        {/* Frame 7 - red tint */}
        <div className={`frame ${isActive(6) ? 'active' : ''}`} style={isActive(6) ? { background: 'radial-gradient(ellipse at center, #1a0505 0%, hsl(0,0%,4%) 70%)' } : {}}>
          <p className="font-display text-foreground font-light tracking-tight reveal-text" style={{ fontSize: 'clamp(2.5rem, 7vw, 7rem)' }}>
            {t('home.f7')}
          </p>
        </div>

        {/* Frame 8 */}
        <div className={`frame ${isActive(7) ? 'active' : ''}`} style={isActive(7) ? { background: 'radial-gradient(ellipse at center, #1a0505 0%, hsl(0,0%,4%) 70%)' } : {}}>
          <div className="max-w-2xl">
            <p className="font-display text-foreground font-light tracking-tight leading-relaxed whitespace-pre-line reveal-text" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
              {t('home.f8a')}<br />
              {t('home.f8b')}<br />
              <span className="text-muted-foreground">{t('home.f8c')}</span>
            </p>
          </div>
        </div>

        {/* Frame 9 */}
        <div className={`frame ${isActive(8) ? 'active' : ''}`}>
          <div className="max-w-2xl">
            <p className="font-display text-foreground font-light italic tracking-tight reveal-text" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              {t('home.f9a')}<br />
              <span className="text-eden-crimson">{t('home.f9b')}</span>
            </p>
          </div>
        </div>

        {/* Frame 10 - white flash */}
        <div className={`frame ${isActive(9) ? 'active white-flash' : ''}`}>
          <p className="font-display font-bold tracking-tight" style={{ fontSize: 'clamp(4rem, 12vw, 12rem)', color: isActive(9) ? '#0A0A0A' : undefined }}>
            {t('home.f10')}
          </p>
        </div>

        {/* Frame 11 - CTA */}
        <div className={`frame ${isActive(10) ? 'active' : ''}`}>
          <div className="flex flex-col items-center">
            <p className="font-display text-foreground tracking-[0.3em] reveal-text" style={{ fontSize: 'clamp(2rem, 4vw, 4rem)', animation: 'glow-pulse 3s ease-in-out infinite' }}>
              {t('home.edenValley')}
            </p>
            <div className="w-[60px] h-[1px] bg-primary/40 my-6 reveal-up" style={{ animationDelay: '0.2s' }} />
            <Link to="/role" className="eden-btn mt-2 reveal-up" style={{ animationDelay: '0.3s' }}>
              {t('home.cta')}
            </Link>
            <p className="font-body text-muted-foreground mt-6 text-sm max-w-md reveal-up" style={{ animationDelay: '0.4s' }}>
              {t('home.sub')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
