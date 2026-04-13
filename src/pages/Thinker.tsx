import { useState, FormEvent, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useScrollSound } from '@/hooks/useScrollSound';
import { useScrollVelocity } from '@/hooks/useScrollVelocity';
import ParticleField from '@/components/ParticleField';
import MinimalNav from '@/components/MinimalNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { submitThinkerApplication } from '@/services/api';
import { Volume2, VolumeX } from 'lucide-react';

const TOTAL_FRAMES = 3;
const COOLDOWN_BASE = 1200;

const Thinker = () => {
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
    email: '',
    idea: '',
    progress: '',
    diagnosis: ''
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
    document.documentElement.classList.add('thinker-page');
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      document.documentElement.classList.remove('thinker-page');
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
      await submitThinkerApplication({
        name: form.name,
        email: form.email,
        idea: form.idea,
        progress: form.progress,
        diagnosis: form.diagnosis,
      });
      navigate('/thanks');
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

        {/* Frame 0: Hero — The Thinker Identity */}
        <div className={`frame ${fc(0)}`}>
          <div className="max-w-5xl px-4 md:px-12 text-center">
            <p className="font-display text-foreground font-extralight tracking-tight leading-[1.1] text-morph-in mb-4 md:mb-6 px-2 md:px-0" style={{ fontSize: 'clamp(1.5rem, 5vw, 3.5rem)' }}>
              {t('thinker.frame1.line1')}
            </p>
            <p className="font-display text-foreground font-extralight tracking-tight leading-[1.2] mb-4 md:mb-8 reveal-up stagger-2 px-2 md:px-0" style={{ fontSize: 'clamp(1.25rem, 3.5vw, 2rem)' }}>
              {t('thinker.frame1.line2')}
            </p>
            <p className="font-body text-muted-foreground text-xs md:text-base leading-relaxed max-w-xl md:max-w-2xl mx-auto reveal-up stagger-3 px-2 md:px-0">
              {t('thinker.frame1.body')}
            </p>
          </div>
        </div>

        {/* Frame 1: The System — Euphrates, Pischon, Havila */}
        <div className={`frame ${fc(1)}`}>
          <div className="max-w-4xl px-4 md:px-12">
            <p className="font-display text-foreground font-light tracking-tight leading-[1.2] text-center mb-6 md:mb-12 reveal-text px-2 md:px-0" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.75rem)' }}>
              {t('thinker.frame2.headline')}
            </p>

            <div className="space-y-4 md:space-y-8">
              <div className="p-3 md:p-6 border-l-2 border-primary/40 reveal-up stagger-1">
                <h3 className="font-display text-foreground text-base md:text-xl mb-1 md:mb-2">Euphrates</h3>
                <p className="font-body text-muted-foreground text-xs md:text-base leading-relaxed">
                  {t('thinker.frame2.euphrates')}
                </p>
              </div>
              <div className="p-3 md:p-6 border-l-2 border-primary/40 reveal-up stagger-2">
                <h3 className="font-display text-foreground text-base md:text-xl mb-1 md:mb-2">Pischon AI</h3>
                <p className="font-body text-muted-foreground text-xs md:text-base leading-relaxed">
                  {t('thinker.frame2.pischon')}
                </p>
              </div>
              <div className="p-3 md:p-6 border-l-2 border-primary/40 reveal-up stagger-3">
                <h3 className="font-display text-foreground text-base md:text-xl mb-1 md:mb-2">Havila</h3>
                <p className="font-body text-muted-foreground text-xs md:text-base leading-relaxed">
                  {t('thinker.frame2.havila')}
                </p>
              </div>
            </div>

            <blockquote className="font-display text-foreground text-sm md:text-lg lg:text-xl text-center italic border-t border-b border-primary/20 py-3 md:py-6 mt-6 md:mt-12 reveal-up stagger-4 px-2 md:px-0">
              "{t('thinker.frame2.quote')}"
            </blockquote>
          </div>
        </div>

        {/* Frame 2: Application Form */}
        <div className={`frame ${fc(2)}`}>
          <div className="max-w-xl w-full px-4 md:px-8 mx-auto h-full flex flex-col justify-center pt-16 md:pt-20 pb-6">
            <div className="text-center mb-4 md:mb-6">
              <p className="font-display text-foreground font-light tracking-tight leading-[1.2] mb-2 md:mb-3" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
                {t('thinker.frame3.headline')}
              </p>
              <p className="font-body text-muted-foreground text-xs md:text-sm reveal-up max-w-md mx-auto">
                {t('thinker.frame3.body')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3 reveal-up">
              <div className="space-y-0.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{t('thinker.form.name')}</label>
                <input
                  className="w-full px-3 py-1.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{t('thinker.form.email')}</label>
                <input
                  className="w-full px-3 py-1.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{t('thinker.form.idea')}</label>
                <textarea
                  className="w-full px-3 py-1.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors resize-none"
                  rows={2}
                  value={form.idea}
                  onChange={(e) => setForm({ ...form, idea: e.target.value })}
                  placeholder={t('thinker.form.ideaPlaceholder')}
                  required
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{t('thinker.form.progress')}</label>
                <textarea
                  className="w-full px-3 py-1.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors resize-none"
                  rows={1}
                  value={form.progress}
                  onChange={(e) => setForm({ ...form, progress: e.target.value })}
                  placeholder={t('thinker.form.progressPlaceholder')}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{t('thinker.form.diagnosis')}</label>
                <RadioGroup
                  value={form.diagnosis}
                  onValueChange={(value) => setForm({ ...form, diagnosis: value })}
                  className="flex flex-wrap gap-x-4 gap-y-1"
                >
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem value="yes" id="yes" className="h-3 w-3" />
                    <Label htmlFor="yes" className="font-normal text-xs">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem value="no" id="no" className="h-3 w-3" />
                    <Label htmlFor="no" className="font-normal text-xs">No</Label>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <RadioGroupItem value="prefer-not" id="prefer-not" className="h-3 w-3" />
                    <Label htmlFor="prefer-not" className="font-normal text-xs">Prefer not</Label>
                  </div>
                </RadioGroup>
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
                {submitting ? '...' : t('thinker.form.submit')}
              </button>

              <p className="text-[10px] text-muted-foreground/60 text-center leading-tight">
                {t('thinker.form.note')}
              </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Thinker;
