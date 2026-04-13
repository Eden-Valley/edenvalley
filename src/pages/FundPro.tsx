import { useState, FormEvent, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollSound } from '@/hooks/useScrollSound';
import { useScrollVelocity } from '@/hooks/useScrollVelocity';
import ParticleField from '@/components/ParticleField';
import MinimalNav from '@/components/MinimalNav';
import { submitInvestorApplication } from '@/services/api';
import { Volume2, VolumeX } from 'lucide-react';

const TOTAL_FRAMES = 3;
const COOLDOWN_BASE = 1200;

const FundPro = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeFrame, setActiveFrame] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const { playTransitionSound, playSound, setMusicIntensity, isMuted, toggleMute, hasStarted, audioError } = useScrollSound();
  const { velocity, isScrolling } = useScrollVelocity();

  const cooldownRef = useRef(false);
  const touchStartY = useRef(0);

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    firm: '',
    email: '',
    ticket: '',
    thesis: ''
  });
  const [error, setError] = useState<string | null>(null);

  const getCooldown = (index: number) => {
    if (index === TOTAL_FRAMES - 1) return 3000;
    return COOLDOWN_BASE;
  };

  const goToFrame = useCallback((index: number) => {
    if (cooldownRef.current) return;
    if (index < 0 || index >= TOTAL_FRAMES) return;

    cooldownRef.current = true;
    setActiveFrame(index);

    const intensity = index <= 1 ? 0.2 + (index * 0.1) : 0.9;
    setMusicIntensity(intensity);

    if (index === TOTAL_FRAMES - 1) {
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
    document.documentElement.classList.add('fund-pro-page');
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.documentElement.classList.remove('fund-pro-page');
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await submitInvestorApplication({
        name: form.name,
        firm: form.firm,
        email: form.email,
        ticket: form.ticket,
        thesis: form.thesis,
      });
      navigate('/funder-thanks');
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <ParticleField scrollVelocity={isScrolling ? velocity : 0.5} isScrolling={cooldownRef.current} activeFrame={activeFrame} />

      <div className="fixed top-0 left-0 w-full h-[1px] bg-primary/10 z-50">
        <div className="h-full bg-primary/60 transition-all duration-1000 ease-out" style={{ width: `${((activeFrame + 1) / TOTAL_FRAMES) * 100}%` }} />
      </div>

      <MinimalNav />

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

      {activeFrame === 0 && !hasScrolled && (
        <div className="fixed bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2">
          <div className="w-[1px] h-6 md:h-8 bg-gradient-to-b from-transparent to-eden-dim" />
          <span className="text-eden-dim text-[10px] md:text-xs tracking-[0.3em] uppercase" style={{ animation: 'bounce-fade 2s ease-in-out infinite' }}>Scroll</span>
        </div>
      )}

      <div className="sticky-stage">

        {/* Frame 0: Hero — Investor Identity */}
        <div className={`frame ${fc(0)}`}>
          <div className="max-w-5xl px-4 md:px-12 text-center">
            <p className="font-display text-foreground font-extralight tracking-tight leading-[1.1] text-morph-in mb-3 md:mb-4 px-2 md:px-0" style={{ fontSize: 'clamp(1.5rem, 5vw, 3.5rem)' }}>
              {t('fundPro.frame1.headline')}
            </p>
            <p className="font-display text-muted-foreground font-extralight tracking-tight leading-[1.2] mb-4 md:mb-8 reveal-up stagger-2 px-2 md:px-0" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.75rem)' }}>
              {t('fundPro.frame1.subheadline')}
            </p>
            <p className="font-body text-muted-foreground text-xs md:text-base leading-relaxed max-w-xl md:max-w-3xl mx-auto reveal-up stagger-3 px-2 md:px-0">
              {t('fundPro.frame1.body')}
            </p>
          </div>
        </div>

        {/* Frame 1: The Value Proposition */}
        <div className={`frame ${fc(1)}`}>
          <div className="max-w-4xl px-4 md:px-12">
            <p className="font-display text-foreground font-light tracking-tight leading-[1.2] text-center mb-4 md:mb-8 reveal-text px-2 md:px-0" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.75rem)' }}>
              {t('fundPro.frame2.headline')}
            </p>

            <p className="font-body text-muted-foreground text-xs md:text-base leading-relaxed mb-4 md:mb-6 reveal-up stagger-1 px-2 md:px-0">
              {t('fundPro.frame2.body')}
            </p>

            <p className="font-body text-foreground text-xs md:text-base leading-relaxed mb-4 md:mb-6 border-l-2 border-primary/40 pl-4 md:pl-6 reveal-up stagger-2 px-2 md:px-0">
              {t('fundPro.frame2.equity')}
            </p>

            <p className="font-body text-muted-foreground text-xs md:text-base leading-relaxed mb-4 md:mb-8 reveal-up stagger-3 px-2 md:px-0">
              {t('fundPro.frame2.pischon')}
            </p>

            <blockquote className="font-display text-foreground text-sm md:text-lg lg:text-xl text-center italic border-t border-b border-primary/20 py-3 md:py-6 reveal-up stagger-4 px-2 md:px-0">
              "{t('fundPro.frame2.quote')}"
            </blockquote>
          </div>
        </div>

        {/* Frame 2: Application Form */}
        <div className={`frame ${fc(2)}`}>
          <div className="max-w-xl w-full px-4 md:px-8 mx-auto flex flex-col justify-center py-4 md:py-6">
            <div className="text-center mb-4 md:mb-6">
              <p className="font-display text-foreground font-light tracking-tight leading-[1.2] mb-2 md:mb-3" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
                {t('fundPro.frame3.headline')}
              </p>
              <p className="font-body text-muted-foreground text-xs md:text-sm reveal-up max-w-md mx-auto">
                {t('fundPro.frame3.body')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3 reveal-up">
              <div className="space-y-0.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{t('fundPro.form.name')}</label>
                <input
                  className="w-full px-3 py-1.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{t('fundPro.form.firm')}</label>
                <input
                  className="w-full px-3 py-1.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                  value={form.firm}
                  onChange={(e) => setForm({ ...form, firm: e.target.value })}
                  placeholder={t('fundPro.form.firmPlaceholder')}
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{t('fundPro.form.email')}</label>
                <input
                  className="w-full px-3 py-1.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{t('fundPro.form.ticket')}</label>
                <input
                  className="w-full px-3 py-1.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                  value={form.ticket}
                  onChange={(e) => setForm({ ...form, ticket: e.target.value })}
                  placeholder={t('fundPro.form.ticketPlaceholder')}
                  required
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{t('fundPro.form.thesis')}</label>
                <textarea
                  className="w-full px-3 py-1.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors resize-none"
                  rows={2}
                  value={form.thesis}
                  onChange={(e) => setForm({ ...form, thesis: e.target.value })}
                  placeholder={t('fundPro.form.thesisPlaceholder')}
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 font-body text-xs uppercase tracking-widest bg-primary border border-primary text-background hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {submitting ? '...' : t('fundPro.form.submit')}
              </button>

              <p className="text-[10px] text-muted-foreground/60 text-center leading-tight">
                {t('fundPro.form.note')}
              </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FundPro;
