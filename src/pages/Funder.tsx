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

const funderSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  investorType: z.string().min(1),
  stage: z.string().min(1),
  sectors: z.string().min(2),
  ticketSize: z.string().min(1),
  proofOfIdentity: z.string().url('Please enter a valid URL'),
});

const TOTAL_FRAMES = 12;
const COOLDOWN_DURATION = 1200;
const API_URL = typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api';

const Funder = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { playSound, setMusicIntensity, isMuted, toggleMute } = useScrollSound();
  const { velocity, isScrolling } = useScrollVelocity();
  const [activeFrame, setActiveFrame] = useState(0);
  const [form, setForm] = useState({ investorType: '', stage: '', sectors: '', ticketSize: '', email: '', firstName: '', lastName: '', proofOfIdentity: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [userCount, setUserCount] = useState(0);
  
  const cooldownRef = useRef(false);
  const touchStartY = useRef(0);

  // Fetch user count from API
  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then(res => res.json())
      .then(data => setUserCount(data.userCount || 0))
      .catch(() => setUserCount(0));
  }, []);

  const goToFrame = useCallback((index: number) => {
    if (cooldownRef.current) return;
    if (index < 0 || index >= TOTAL_FRAMES) return;
    cooldownRef.current = true;
    setActiveFrame(index);
    playSound('transition');
    setMusicIntensity(index <= 4 ? 0.2 : 0.9);
    setTimeout(() => { cooldownRef.current = false; }, COOLDOWN_DURATION);
  }, [playSound, setMusicIntensity]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (activeFrame === TOTAL_FRAMES - 1) {
      const fc = document.querySelector('.frame-3d.active .form-frame-scrollable');
      if (fc) {
        const { scrollTop, scrollHeight, clientHeight } = fc;
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
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goToFrame(activeFrame + 1); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); goToFrame(activeFrame - 1); }
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    playSound('submit');
    
    const validation = funderSchema.safeParse(form);
    if (!validation.success) {
      setSubmitError('Please fill all required fields correctly.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const referredBy = new URLSearchParams(window.location.search).get('ref') || undefined;
      
      const response = await fetch(`${API_URL}/funders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          referredBy,
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
      navigate('/funder-thanks');
    } catch {
      setSubmitError('Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  const fc = (i: number) => {
    if (i === activeFrame) return 'active';
    if (i < activeFrame) return 'prev';
    return 'next';
  };

  const RadioGroup = ({ name, options, value }: { name: string; options: string[]; value: string }) => (
    <div className="flex flex-wrap gap-2 mb-3">
      {options.map(opt => (
        <label key={opt} className="inline-flex items-center gap-2 px-3 py-2 border cursor-pointer transition-all duration-200 hover:border-primary text-xs" style={{ borderColor: value === opt ? 'hsl(var(--primary))' : 'hsl(var(--border))', background: value === opt ? 'hsl(var(--primary) / 0.1)' : 'transparent' }}>
          <input type="radio" name={name} value={opt} checked={value === opt} onChange={e => setForm({ ...form, [name]: e.target.value })} className="sr-only" />
          <span className="text-foreground">{opt}</span>
        </label>
      ))}
    </div>
  );

  if (!loaded) return <LoadingScreen onComplete={() => setLoaded(true)} duration={2000} />;

  const getBgClass = () => {
    if (activeFrame >= 2 && activeFrame <= 4) return 'frame-bg-crimson';
    if (activeFrame >= 5 && activeFrame <= 8) return 'frame-bg-eden';
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
        <div className="h-full bg-primary/60 transition-all duration-1000 ease-out" style={{ width: `${((activeFrame + 1) / TOTAL_FRAMES) * 100}%` }} />
      </div>

      {/* Skip to form */}
      <button
        onClick={() => goToFrame(11)}
        className="fixed top-16 sm:top-4 left-1/2 -translate-x-1/2 z-50 text-primary text-[10px] tracking-[0.2em] uppercase font-mono hover:text-primary/70 transition-colors duration-300 whitespace-nowrap px-2"
      >
        {t('auth.skipToForm')}
      </button>

      <div className="perspective-premium fixed inset-0">
        
        {/* 0: SMART MONEY */}
        <div className={`frame-3d ${fc(0)}`}>
          <div className="max-w-6xl px-6 md:px-12 text-center">
            <h1 className="font-display text-massive text-foreground font-extralight tracking-tighter letter-cascade-premium">{t('funder.smartMoney').split(' ')[0]}</h1>
            <h1 className="font-display text-massive text-primary font-extralight tracking-tighter letter-cascade-premium stagger-2 eden-glow-pulse">{t('funder.smartMoney').split(' ')[1]}</h1>
          </div>
        </div>

        {/* 1: Subtitle */}
        <div className={`frame-3d ${fc(1)}`}>
          <div className="max-w-2xl px-6 md:px-12 text-center">
            <p className="font-body text-whisper text-muted-foreground leading-relaxed reveal-up-premium">{t('funder.subtitle')}</p>
          </div>
        </div>

        {/* 2: NOISE */}
        <div className={`frame-3d ${fc(2)}`}>
          <div className="max-w-5xl px-6 md:px-12 text-center">
            <span className="text-micro text-muted-foreground block mb-6 md:mb-8 reveal-up-premium">{t('funder.problem')}</span>
            <h2 className="font-display text-impact text-eden-crimson font-bold reveal-text-premium">{t('funder.noise')}</h2>
          </div>
        </div>

        {/* 3: Pain 1 */}
        <div className={`frame-3d ${fc(3)}`}>
          <div className="max-w-3xl px-6 md:px-12 text-center">
            <p className="font-display text-large text-foreground font-light leading-relaxed reveal-text-premium">{t('funder.pain1')}</p>
          </div>
        </div>

        {/* 4: Pain 2 */}
        <div className={`frame-3d ${fc(4)}`}>
          <div className="max-w-3xl px-6 md:px-12 text-center">
            <p className="font-body text-whisper text-foreground leading-relaxed reveal-up-premium">{t('funder.pain2')}</p>
          </div>
        </div>

        {/* 5: ACCESS */}
        <div className={`frame-3d ${fc(5)}`}>
          <div className="max-w-5xl px-6 md:px-12 text-center">
            <span className="text-micro text-muted-foreground block mb-6 md:mb-8 reveal-up-premium">{t('funder.theSolution')}</span>
            <h2 className="font-display text-massive text-primary font-extralight eden-glow-pulse reveal-scale-premium">{t('funder.access')}</h2>
          </div>
        </div>

        {/* 6: Revelation */}
        <div className={`frame-3d ${fc(6)}`}>
          <div className="max-w-3xl px-6 md:px-12 text-center">
            <p className="font-display text-large text-foreground italic leading-relaxed reveal-text-premium" style={{ animation: activeFrame === 6 ? 'breathe-scale 4s ease-in-out infinite' : undefined }}>
              &ldquo;{t('funder.revelation')}&rdquo;
            </p>
          </div>
        </div>

        {/* 7: Dynamic User Count */}
        <div className={`frame-3d ${fc(7)}`}>
          <div className="max-w-5xl px-6 md:px-12 text-center">
            <h2 className="font-display text-massive text-primary font-bold reveal-scale-premium eden-glow-pulse">{userCount}</h2>
            <span className="text-micro text-muted-foreground block mt-4 reveal-up-premium stagger-2">{t('funder.founders')}</span>
          </div>
        </div>

        {/* 8: CURATED */}
        <div className={`frame-3d ${fc(8)}`}>
          <div className="max-w-4xl px-6 md:px-12 text-center">
            <span className="text-micro text-muted-foreground block mb-3 md:mb-4 reveal-up-premium">{t('funder.carefully')}</span>
            <h2 className="font-display text-impact text-foreground font-medium reveal-text-premium">{t('funder.curated')}</h2>
            <h2 className="font-display text-large text-muted-foreground font-light mt-2 reveal-up-premium stagger-2">{t('funder.architectsAndForces')}</h2>
          </div>
        </div>

        {/* 9: Quote */}
        <div className={`frame-3d ${fc(9)}`}>
          <div className="max-w-2xl px-6 md:px-12 text-center">
            <p className="font-body text-whisper text-muted-foreground italic leading-relaxed reveal-up-premium">
              &ldquo;{t('funder.pain2')}&rdquo;
            </p>
          </div>
        </div>

        {/* 10: Entry Call */}
        <div className={`frame-3d ${fc(10)}`}>
          <div className="max-w-4xl px-6 md:px-12 text-center">
            <span className="text-micro text-muted-foreground block mb-4 md:mb-6 reveal-up-premium">{t('funder.investorAccess')}</span>
            <h2 className="font-display text-large text-foreground font-medium reveal-text-premium">{t('funder.formTitle')}</h2>
          </div>
        </div>

        {/* 11: Form */}
        <div className={`frame-3d ${fc(11)}`}>
          <div className="max-w-lg w-full px-4 md:px-8 mx-auto h-full flex flex-col pt-24 pb-8 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 reveal-up-premium min-h-0">
              {submitError && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded">
                  <p className="text-destructive text-sm">{submitError}</p>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-micro text-muted-foreground block ml-1">{t('result.firstName')}</label>
                  <input className="w-full px-3 py-2 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} onFocus={() => playSound('focus')} />
                </div>
                <div className="space-y-1">
                  <label className="text-micro text-muted-foreground block ml-1">{t('result.lastName')}</label>
                  <input className="w-full px-3 py-2 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} onFocus={() => playSound('focus')} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-micro text-muted-foreground block ml-1">{t('funder.investorType')}</label>
                <RadioGroup name="investorType" options={['VC', 'Angel', 'Family Office', 'Corp VC']} value={form.investorType} />
              </div>
              <div className="space-y-1">
                <label className="text-micro text-muted-foreground block ml-1">{t('funder.stage')}</label>
                <RadioGroup name="stage" options={['Pre-seed', 'Seed', 'Series A', 'Flexible']} value={form.stage} />
              </div>
              <div className="space-y-1">
                <label className="text-micro text-muted-foreground block ml-1">{t('funder.sectors')}</label>
                <input className="w-full px-3 py-2 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors" placeholder="e.g. AI, Fintech" value={form.sectors} onChange={e => setForm({ ...form, sectors: e.target.value })} onFocus={() => playSound('focus')} />
              </div>
              <div className="space-y-1">
                <label className="text-micro text-muted-foreground block ml-1">{t('funder.ticketSize')}</label>
                <RadioGroup name="ticketSize" options={['10k-50k', '50k-250k', '250k-1M', '1M+']} value={form.ticketSize} />
              </div>
              <div className="space-y-1">
                <label className="text-micro text-muted-foreground block ml-1">
                  {t('funder.proofOfIdentity')} <span className="text-eden-crimson">*</span>
                </label>
                <input className="w-full px-3 py-2 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors" type="url" placeholder="https://linkedin.com/in/..., https://crunchbase.com/..." required value={form.proofOfIdentity} onChange={e => setForm({ ...form, proofOfIdentity: e.target.value })} onFocus={() => playSound('focus')} />
                <p className="text-micro text-muted-foreground/60 block ml-1">{t('funder.proofOfIdentityDesc')}</p>
              </div>
              <div className="space-y-1">
                <label className="text-micro text-muted-foreground block ml-1">{t('funder.proEmail')}</label>
                <input className="w-full px-3 py-2 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onFocus={() => playSound('focus')} />
              </div>
              <button type="submit" className="w-full py-3 mt-4 font-body text-sm uppercase tracking-widest border border-primary text-foreground hover:bg-primary hover:text-background transition-all duration-300 disabled:opacity-50" disabled={submitting}>
                {submitting ? t('result.submitting') : t('funder.applyForAccess')}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Funder;
