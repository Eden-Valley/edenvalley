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
import { sql } from '@/lib/db';
import { z } from 'zod';

const funderSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  investorType: z.string().min(1),
  stage: z.string().min(1),
  sectors: z.string().min(2),
  ticketSize: z.string().min(1),
});

const TOTAL_FRAMES = 12;
const COOLDOWN_DURATION = 1200;

const Funder = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { playSound, setMusicIntensity, isMuted, toggleMute } = useScrollSound();
  const { velocity, isScrolling } = useScrollVelocity();
  const [activeFrame, setActiveFrame] = useState(0);
  const [form, setForm] = useState({ investorType: '', stage: '', sectors: '', ticketSize: '', email: '', firstName: '', lastName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const cooldownRef = useRef(false);
  const touchStartY = useRef(0);

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
    playSound('submit');
    const validation = funderSchema.safeParse(form);
    if (!validation.success) return;
    setSubmitting(true);
    try {
      await sql`INSERT INTO users (email, first_name, last_name, role) VALUES (${form.email}, ${form.firstName}, ${form.lastName}, 'funder') ON CONFLICT (email) DO UPDATE SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role = EXCLUDED.role`;
      const user = await sql`SELECT id FROM users WHERE email = ${form.email}`;
      if (user?.length > 0) {
        const userId = user[0].id;
        localStorage.setItem('eden-user-id', userId);
        await sql`INSERT INTO profiles (user_id, type, investor_type, preferred_stage, sectors, ticket_size) VALUES (${userId}, 'funder', ${form.investorType}, ${form.stage}, ${form.sectors}, ${form.ticketSize})`;
      }
      playSound('success');
      navigate('/funder-thanks');
    } catch (error) {
      console.error("Funder submission failed:", error);
    } finally {
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

      <div className="perspective-premium fixed inset-0">
        
        {/* 0: SMART MONEY */}
        <div className={`frame-3d ${fc(0)}`}>
          <div className="max-w-6xl px-6 md:px-12 text-center">
            <h1 className="font-display text-massive text-foreground font-extralight tracking-tighter letter-cascade-premium">SMART</h1>
            <h1 className="font-display text-massive text-primary font-extralight tracking-tighter letter-cascade-premium stagger-2 eden-glow-pulse">MONEY</h1>
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
            <h2 className="font-display text-impact text-eden-crimson font-bold reveal-text-premium">NOISE</h2>
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
            <span className="text-micro text-muted-foreground block mb-6 md:mb-8 reveal-up-premium">THE SOLUTION</span>
            <h2 className="font-display text-massive text-primary font-extralight eden-glow-pulse reveal-scale-premium">ACCESS</h2>
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

        {/* 7: 50+ */}
        <div className={`frame-3d ${fc(7)}`}>
          <div className="max-w-5xl px-6 md:px-12 text-center">
            <h2 className="font-display text-massive text-primary font-bold reveal-scale-premium eden-glow-pulse">50+</h2>
            <span className="text-micro text-muted-foreground block mt-4 reveal-up-premium stagger-2">FOUNDERS</span>
          </div>
        </div>

        {/* 8: CURATED */}
        <div className={`frame-3d ${fc(8)}`}>
          <div className="max-w-4xl px-6 md:px-12 text-center">
            <span className="text-micro text-muted-foreground block mb-3 md:mb-4 reveal-up-premium">CAREFULLY</span>
            <h2 className="font-display text-impact text-foreground font-medium reveal-text-premium">CURATED</h2>
            <h2 className="font-display text-large text-muted-foreground font-light mt-2 reveal-up-premium stagger-2">ARCHITECTS & FORCES</h2>
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
            <span className="text-micro text-muted-foreground block mb-4 md:mb-6 reveal-up-premium">INVESTOR ACCESS</span>
            <h2 className="font-display text-large text-foreground font-medium reveal-text-premium">{t('funder.formTitle')}</h2>
          </div>
        </div>

        {/* 11: Form */}
        <div className={`frame-3d ${fc(11)}`}>
          <div className="max-w-lg w-full px-4 md:px-8 mx-auto h-full flex flex-col justify-center form-frame-scrollable py-12 md:py-24">
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 reveal-up-premium">
              <div className="grid grid-cols-2 gap-3">
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
                <label className="text-micro text-muted-foreground block ml-1">{t('funder.proEmail')}</label>
                <input className="w-full px-3 py-2 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onFocus={() => playSound('focus')} />
              </div>
              <button type="submit" className="w-full py-3 md:py-3.5 mt-4 md:mt-6 font-body text-sm uppercase tracking-widest border border-primary text-foreground hover:bg-primary hover:text-background transition-all duration-300 disabled:opacity-50" disabled={submitting}>
                {submitting ? t('result.submitting') : t('funder.submit')}
              </button>
              <p className="text-micro text-muted-foreground text-center">{t('funder.note')}</p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Funder;
