import { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import MinimalNav from '@/components/MinimalNav';
import CustomCursor from '@/components/CustomCursor';
import LoadingScreen from '@/components/LoadingScreen';
import ParticleField from '@/components/ParticleField';
import { useScrollSound } from '@/hooks/useScrollSound';
import { useScrollVelocity } from '@/hooks/useScrollVelocity';
import { Volume2, VolumeX } from 'lucide-react';
import { z } from 'zod';

const formSchema = z.object({
  firstName: z.string().min(2, 'First name is required').max(50),
  lastName: z.string().min(2, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email'),
  vision: z.string().min(10, 'Please tell us more about your vision').max(2000),
  proofOfWork: z.string().url('Please enter a valid URL'),
});

interface ResultPageProps {
  type: 'thinker' | 'doer';
}

const TOTAL_FRAMES = 15;
const COOLDOWN_DURATION = 1200;
const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK || 'https://buy.stripe.com/00wfZbfZF3jncTvaEV0kE00';
const API_URL = typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api';

const ResultPage = ({ type }: ResultPageProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { playSound, setMusicIntensity, isMuted, toggleMute } = useScrollSound();
  const { velocity, isScrolling } = useScrollVelocity();
  const [activeFrame, setActiveFrame] = useState(0);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', vision: '', proofOfWork: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPendingOptions, setShowPendingOptions] = useState(false);
  const [showExecutiveExplainer, setShowExecutiveExplainer] = useState(false);
  
  const cooldownRef = useRef(false);
  const touchStartY = useRef(0);

  // Check if user has completed the test and has valid access to this result page
  useEffect(() => {
    const testResult = sessionStorage.getItem('eden-test-result');
    const completedTest = sessionStorage.getItem('eden-test-completed');
    
    // If no test result or test not completed, redirect to test page
    if (!testResult || !completedTest) {
      navigate('/test');
      return;
    }
    
    // If user is trying to access a result page that doesn't match their result
    const userResult = JSON.parse(testResult);
    if (userResult.type !== type) {
      // Redirect to their correct result page
      navigate(`/result/${userResult.type}`);
      return;
    }
  }, [navigate, type]);

  // Check for pending form data from Stripe return
  useEffect(() => {
    const pendingForm = sessionStorage.getItem('eden-pending-form');
    const startedAt = sessionStorage.getItem('eden-pending-payment-started');
    
    if (pendingForm && startedAt) {
      const elapsed = Date.now() - parseInt(startedAt);
      // If user spent at least 3 seconds away, they probably went to Stripe
      if (elapsed > 3000) {
        const formData = JSON.parse(pendingForm);
        setForm({
          firstName: formData.firstName || '',
          lastName: formData.lastName || '',
          email: formData.email || '',
          vision: formData.vision || '',
          proofOfWork: formData.proofOfWork || '',
        });
        setShowPendingOptions(true);
        setSubmitting(false);
        // Clear the session storage
        sessionStorage.removeItem('eden-pending-form');
        sessionStorage.removeItem('eden-pending-payment-started');
      } else {
        // Too fast, probably page refresh - clear
        sessionStorage.removeItem('eden-pending-form');
        sessionStorage.removeItem('eden-pending-payment-started');
      }
    }
  }, [navigate]);

  const goToFrame = useCallback((index: number) => {
    if (cooldownRef.current) return;
    if (index < 0 || index >= TOTAL_FRAMES) return;

    cooldownRef.current = true;
    setActiveFrame(index);
    playSound('transition');
    
    const intensity = index <= 5 ? 0.2 : 0.9;
    setMusicIntensity(intensity);

    const cooldown = index === 12 ? 3000 : COOLDOWN_DURATION;
    setTimeout(() => { cooldownRef.current = false; }, cooldown);
  }, [playSound, setMusicIntensity]);

  const handleWheel = useCallback((e: WheelEvent) => {
    const isFormFrame = activeFrame >= TOTAL_FRAMES - 2;
    if (isFormFrame) {
      const formContainer = document.querySelector('.frame-3d.active .form-frame-scrollable');
      if (formContainer) {
        const { scrollTop, scrollHeight, clientHeight } = formContainer as HTMLElement;
        if (e.deltaY > 0 && scrollTop + clientHeight < scrollHeight) return;
        if (e.deltaY < 0 && scrollTop > 0) return;
      }
    }
    e.preventDefault();
    if (Math.abs(e.deltaY) < 30) return;
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

  const handleTouchStart = useCallback((e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; }, []);
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const deltaY = touchStartY.current - e.touches[0].clientY;
    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) goToFrame(activeFrame + 1);
      else goToFrame(activeFrame - 1);
      touchStartY.current = e.touches[0].clientY;
    }
  }, [activeFrame, goToFrame]);

  useEffect(() => {
    if (!loaded) return;
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
  }, [loaded, handleWheel, handleKeyDown, handleTouchStart, handleTouchMove]);

  const handleSubmit = async (e: FormEvent, tier: 'standard' | 'priority') => {
    e.preventDefault();
    playSound('submit');
    setErrors({});
    setSubmitError(null);

    const validation = formSchema.safeParse(form);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => { if (err.path[0]) newErrors[err.path[0] as string] = err.message; });
      setErrors(newErrors);
      setSubmitError('Please fill all required fields.');
      return;
    }

    setSubmitting(true);

    // If priority, redirect to Stripe immediately without submitting form
    if (tier === 'priority') {
      const referredBy = new URLSearchParams(window.location.search).get('ref') || undefined;
      // Store form data for after Stripe return
      sessionStorage.setItem('eden-pending-form', JSON.stringify({
        ...form,
        type,
        tier,
        referredBy,
        language: localStorage.getItem('eden-language') || 'en',
      }));
      sessionStorage.setItem('eden-pending-payment-started', Date.now().toString());
      window.location.href = STRIPE_PAYMENT_LINK;
      return; // Don't submit form yet
    }

    // Standard submission
    try {
      const referredBy = new URLSearchParams(window.location.search).get('ref') || undefined;

      const response = await fetch(`${API_URL}/founders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          type,
          tier,
          referredBy,
          language: localStorage.getItem('eden-language') || 'en',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.error || 'Failed to submit application');
        setSubmitting(false);
        return;
      }

      localStorage.setItem('eden-user-id', result.userId);
      localStorage.setItem('eden-referral-code', result.referralCode);

      playSound('success');
      navigate('/thanks?tier=standard');
    } catch {
      setSubmitError('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  // Handle returning from Stripe (with or without payment)
  const handleStripeReturn = async () => {
    const pendingForm = sessionStorage.getItem('eden-pending-form');
    const startedAt = sessionStorage.getItem('eden-pending-payment-started');
    
    if (!pendingForm || !startedAt) return false;
    
    // Check if user has been away for a reasonable time (came back from Stripe)
    const elapsed = Date.now() - parseInt(startedAt);
    if (elapsed < 5000) return false; // Too fast, probably didn't actually go to Stripe
    
    return true;
  };

  const fc = (i: number) => {
    if (i === activeFrame) return 'active';
    if (i < activeFrame) return 'prev';
    return 'next';
  };

  if (!loaded) return <LoadingScreen onComplete={() => setLoaded(true)} duration={2000} />;

  const isThinker = type === 'thinker';

  const getBgClass = () => {
    if (activeFrame >= 2 && activeFrame <= 5) return 'frame-bg-crimson';
    if (activeFrame >= 6 && activeFrame <= 9) return 'frame-bg-eden';
    return '';
  };

  return (
    <div className={`fixed inset-0 overflow-hidden bg-background transition-colors duration-[2000ms] ${getBgClass()}`}>
      <CustomCursor />
      <MinimalNav />
      <button onClick={toggleMute} className="sound-toggle" aria-label={isMuted ? "Unmute" : "Mute"}>
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      <ParticleField scrollVelocity={isScrolling ? velocity : 0.5} isScrolling={cooldownRef.current} activeFrame={activeFrame} />
      
      <div className="fixed top-0 left-0 w-full h-[1px] z-50 bg-primary/10">
        <div className="h-full bg-primary/60 transition-all duration-[1000ms] ease-out" style={{ width: `${((activeFrame + 1) / TOTAL_FRAMES) * 100}%` }} />
      </div>

      {/* Skip to form */}
      <button
        onClick={() => goToFrame(12)}
        className="fixed top-16 sm:top-4 left-1/2 -translate-x-1/2 z-50 text-primary text-[10px] tracking-[0.2em] uppercase font-mono hover:text-primary/70 transition-colors duration-300 whitespace-nowrap px-2"
      >
        {t('auth.skipToForm')}
      </button>

      <div className="perspective-premium fixed inset-0">
        
        {/* 0: Identity — Massive word */}
        <div className={`frame-3d ${fc(0)}`}>
          <div className="max-w-6xl px-6 md:px-12 text-center">
            <h1 className="font-display text-massive text-foreground font-extralight tracking-tighter letter-cascade-premium">
              {isThinker ? t('result.architect') : t('result.force')}
            </h1>
          </div>
        </div>

        {/* 1: Subtitle */}
        <div className={`frame-3d ${fc(1)}`}>
          <div className="max-w-2xl px-6 md:px-12 text-center">
            <p className="font-body text-whisper text-muted-foreground leading-relaxed reveal-up-premium">
              {isThinker ? t('thinker.subtitle') : t('doer.subtitle')}
            </p>
          </div>
        </div>

        {/* 2-5: Pain frames */}
        {[2, 3, 4].map((i) => (
          <div key={i} className={`frame-3d ${fc(i)}`}>
            <div className="max-w-3xl px-4 md:px-12 text-center">
              <span className="text-micro text-muted-foreground block mb-3 md:mb-6 reveal-up-premium">{t('result.thePain')}</span>
              <p className="font-display text-foreground font-light leading-relaxed reveal-text-premium" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
                {t(`${type}.pain${i - 1}`)}
              </p>
            </div>
          </div>
        ))}

        {/* Frame 5: Pain 4 - Executive Dysfunction (with explainer for Thinkers) */}
        <div className={`frame-3d ${fc(5)}`}>
          <div className="max-w-3xl px-4 md:px-12 text-center">
            <span className="text-micro text-muted-foreground block mb-3 md:mb-6 reveal-up-premium">{t('result.thePain')}</span>
            <p className="font-display text-foreground font-light leading-relaxed reveal-text-premium mb-4 md:mb-6" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
              {t(`${type}.pain4`)}
            </p>
            {isThinker && (
              <div className="reveal-up-premium">
                <button
                  onClick={() => setShowExecutiveExplainer(!showExecutiveExplainer)}
                  className="text-[10px] uppercase tracking-wider text-primary/70 hover:text-primary transition-colors border-b border-primary/30 pb-0.5"
                >
                  {showExecutiveExplainer ? '− Less info' : '+ What is executive dysfunction?'}
                </button>
                {showExecutiveExplainer && (
                  <div className="mt-4 p-3 md:p-4 bg-card/30 border border-primary/10 rounded max-w-2xl mx-auto">
                    <p className="font-body text-muted-foreground text-xs md:text-sm leading-relaxed text-left">
                      {t('thinker.executiveDysfunctionExplainer')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 6-9: Relief frames */}
        {[6, 7, 8, 9].map((i) => (
          <div key={i} className={`frame-3d ${fc(i)}`}>
            <div className="max-w-3xl px-4 md:px-12 text-center">
              <span className="text-micro text-muted-foreground block mb-3 md:mb-6 reveal-up-premium">{t('result.theRelief')}</span>
              <p className="font-display text-foreground font-light leading-relaxed reveal-text-premium" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
                {t(`${type}.relief${i - 5}`)}
              </p>
            </div>
          </div>
        ))}

        {/* 10: Revelation */}
        <div className={`frame-3d ${fc(10)}`}>
          <div className="max-w-4xl px-4 md:px-12 text-center space-y-4 md:space-y-6">
            {/* Main revelation text - medium size */}
            <p className="font-display text-foreground font-light leading-relaxed reveal-text-premium" style={{ fontSize: 'clamp(1rem, 3vw, 1.4rem)' }}>
              {t(`${type}.revelation`)}
            </p>

            {/* Team emphasis - larger, primary color, more prominent */}
            <div className="py-3 md:py-4 border-y border-primary/20 reveal-up-premium">
              <p className="font-display text-primary font-medium leading-tight" style={{ fontSize: 'clamp(1.25rem, 4vw, 2rem)' }}>
                {t(`${type}.revelationTeam`)}
              </p>
            </div>

            {/* Closing statement - for Thinkers only */}
            {isThinker && (
              <p className="font-body text-muted-foreground italic reveal-up-premium" style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)' }}>
                {t('thinker.revelationClose')}
              </p>
            )}
          </div>
        </div>

        {/* 11: Form title */}
        <div className={`frame-3d ${fc(11)}`}>
          <div className="max-w-3xl px-6 md:px-12 text-center">
            <span className="text-micro text-muted-foreground block mb-4 md:mb-6 reveal-up-premium">{t('result.edenValley')}</span>
            <h2 className="font-display text-large text-foreground font-medium reveal-text-premium">{isThinker ? t('thinker.formTitle') : t('doer.formTitle')}</h2>
          </div>
        </div>

        {/* 12: Form — Names, Email */}
        <div className={`frame-3d ${fc(12)}`}>
          <div className="max-w-md w-full px-4 md:px-8 mx-auto h-full flex flex-col justify-center pt-16 md:pt-20 pb-6">
            <div className="space-y-2 md:space-y-3 reveal-up-premium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{t('result.firstName')}</label>
                  <input className="w-full px-3 py-1.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} onFocus={() => playSound('focus')} />
                </div>
                <div className="space-y-0.5">
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{t('result.lastName')}</label>
                  <input className="w-full px-3 py-1.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} onFocus={() => playSound('focus')} />
                </div>
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{t('result.email')}</label>
                <input className="w-full px-3 py-1.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onFocus={() => playSound('focus')} />
              </div>
              {/* Scroll hint */}
              <div className="flex flex-col items-center gap-1 mt-3 reveal-up">
                <div className="w-[1px] h-4 bg-gradient-to-b from-transparent to-primary/40" />
                <span className="text-muted-foreground/50 text-[10px] tracking-widest uppercase">{t('result.scrollToContinue')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 13: Form — Proof of Work (Type-specific) */}
        <div className={`frame-3d ${fc(13)}`}>
          <div className="max-w-md w-full px-4 md:px-8 mx-auto h-full flex flex-col justify-center pt-16 md:pt-20 pb-6">
            <div className="space-y-2 md:space-y-3 reveal-up-premium">
              <div className="space-y-0.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">
                  {isThinker ? t('thinker.proofOfVision') : t('doer.proofOfWork')} <span className="text-eden-crimson">*</span>
                </label>
                <input 
                  className="w-full px-3 py-1.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors" 
                  type="url" 
                  placeholder={isThinker ? "https://docs.google.com/..., https://figma.com/..., ..." : "https://github.com/, https://crunchbase.com/..., ..."} 
                  required 
                  value={form.proofOfWork} 
                  onChange={e => setForm({ ...form, proofOfWork: e.target.value })} 
                  onFocus={() => playSound('focus')} 
                />
                {errors.proofOfWork && <p className="text-eden-crimson text-xs block ml-1">{errors.proofOfWork}</p>}
                <p className="text-[10px] text-muted-foreground/60 block">
                  {isThinker ? t('thinker.proofOfVisionDesc') : t('doer.proofOfWorkDesc')}
                </p>
              </div>
              {/* Scroll hint */}
              <div className="flex flex-col items-center gap-1 mt-3 reveal-up">
                <div className="w-[1px] h-4 bg-gradient-to-b from-transparent to-primary/40" />
                <span className="text-muted-foreground/50 text-[10px] tracking-widest uppercase">{t('result.scrollToContinue')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 14: Form — Vision/Energy & Submit */}
        <div className={`frame-3d ${fc(14)}`}>
          <div className="max-w-md w-full px-4 md:px-8 mx-auto h-full flex flex-col justify-center pt-16 md:pt-20 pb-6">
            <div className="space-y-2 md:space-y-3 reveal-up-premium">
              <div className="space-y-0.5">
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground block">{isThinker ? 'Vision' : 'Energy'}</label>
                <textarea className="w-full px-3 py-1.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors resize-none" rows={2} placeholder={t(`${type}.placeholder`)} value={form.vision} onChange={e => setForm({ ...form, vision: e.target.value })} onFocus={() => playSound('focus')} />
                {errors.vision && <p className="text-eden-crimson text-xs block ml-1">{errors.vision}</p>}
              </div>

              {submitError && (
                <div className="p-2 bg-destructive/10 border border-destructive/30 rounded">
                  <p className="text-destructive text-xs">{submitError}</p>
                </div>
              )}

              {showPendingOptions ? (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-xs text-foreground font-body">You visited the payment page. Would you like to:</p>
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem('eden-pending-form', JSON.stringify(form));
                      sessionStorage.setItem('eden-pending-payment-started', Date.now().toString());
                      window.location.href = STRIPE_PAYMENT_LINK;
                    }}
                    className="w-full py-2.5 px-4 font-body text-xs uppercase tracking-widest bg-primary border border-primary text-background hover:bg-primary/90 transition-all duration-300"
                  >
                    Complete Payment ($49)
                  </button>
                  <p className="text-[10px] text-muted-foreground/50 text-center">or</p>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'standard')}
                    className="w-full py-2.5 px-4 font-body text-xs uppercase tracking-widest border border-muted-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground transition-all duration-300"
                  >
                    Submit for Free
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'standard')}
                    disabled={submitting}
                    className="w-full py-2.5 px-4 font-body text-xs uppercase tracking-widest border border-muted-foreground/30 text-muted-foreground hover:border-foreground hover:text-foreground transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? t('result.submitting') : t('result.standardAdmission')}
                  </button>
                  <p className="text-[10px] text-muted-foreground/50 text-center">{t('result.standardTime')}</p>

                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'priority')}
                    disabled={submitting}
                    className="w-full py-2.5 px-4 font-body text-xs uppercase tracking-widest bg-primary border border-primary text-background hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? t('result.submitting') : t('result.priorityFastTrack')}
                  </button>
                  <p className="text-micro text-muted-foreground/50 text-center">{t('result.priorityTime')}</p>
                  <p className="text-micro text-green-500/80 text-center">{t('result.refundGuarantee')}</p>
                  <p className="text-micro text-muted-foreground/60 text-center">{t('result.refundSpeedNote')}</p>

                  <p className="text-micro text-muted-foreground/40 text-center pt-1">{t('result.paymentNote')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultPage;
