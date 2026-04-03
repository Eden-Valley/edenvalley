import { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import MinimalNav from '@/components/MinimalNav';
import CustomCursor from '@/components/CustomCursor';
import LoadingScreen from '@/components/LoadingScreen';
import ParticleField from '@/components/ParticleField';
import { useScrollSound } from '@/hooks/useScrollSound';
import { useScrollVelocity } from '@/hooks/useScrollVelocity';
import { Volume2, VolumeX, TrendingUp } from 'lucide-react';
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
  const [form, setForm] = useState({
    investorType: '', stage: '', sectors: '', ticketSize: '', email: '',
    firstName: '', lastName: '' 
  });
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
    
    // Set music intensity based on frame type: low for problem frames (0-4), high for solution/CTA (5+)
    const intensity = index <= 4 ? 0.2 : 0.9;
    setMusicIntensity(intensity);

    setTimeout(() => {
      cooldownRef.current = false;
    }, COOLDOWN_DURATION);
  }, [playSound]);

  const handleWheel = useCallback((e: WheelEvent) => {
    const isFormFrame = activeFrame === TOTAL_FRAMES - 1;
    if (isFormFrame) {
      const formContainer = document.querySelector('.frame-3d.active .form-frame-scrollable');
      if (formContainer) {
        const { scrollTop, scrollHeight, clientHeight } = formContainer;
        const isScrollingDown = e.deltaY > 0;
        const isScrollingUp = e.deltaY < 0;
        
        if (isScrollingDown && scrollTop + clientHeight < scrollHeight) return;
        if (isScrollingUp && scrollTop > 0) return;
      }
    }

    e.preventDefault();
    if (Math.abs(e.deltaY) < 30) return;
    if (e.deltaY > 0) goToFrame(activeFrame + 1);
    else goToFrame(activeFrame - 1);
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
      if (deltaY > 0) goToFrame(activeFrame + 1);
      else goToFrame(activeFrame - 1);
      touchStartY.current = touchEndY;
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
    if (!validation.success) {
      playSound('error' as any);
      return;
    }

    setSubmitting(true);
    try {
      await sql`
        INSERT INTO users (email, first_name, last_name, role)
        VALUES (${form.email}, ${form.firstName}, ${form.lastName}, 'funder')
        ON CONFLICT (email) DO UPDATE 
        SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role = EXCLUDED.role
      `;
      const user = await sql`SELECT id FROM users WHERE email = ${form.email}`;
      if (user && user.length > 0) {
        const userId = user[0].id;
        // Store userId for invitation system
        localStorage.setItem('eden-user-id', userId);
        await sql`
          INSERT INTO profiles (user_id, type, investor_type, preferred_stage, sectors, ticket_size)
          VALUES (${userId}, 'funder', ${form.investorType}, ${form.stage}, ${form.sectors}, ${form.ticketSize})
        `;
      }
      playSound('success');
      navigate('/funder-thanks');
    } catch (error) {
      console.error("Funder submission failed:", error);
      playSound('error' as any);
    } finally {
      setSubmitting(false);
    }
  };

  const getFrameClass = (i: number) => {
    if (i === activeFrame) return 'active';
    if (i < activeFrame) return 'prev';
    return 'next';
  };

  const RadioGroup = ({ name, options, value }: { name: string; options: string[]; value: string }) => (
    <div className="flex flex-wrap gap-2 mb-4">
      {options.map(opt => (
        <label 
          key={opt} 
          className="inline-flex items-center gap-2 px-3 py-2 border cursor-pointer transition-all duration-200 hover:border-primary"
          style={{
            borderColor: value === opt ? 'hsl(var(--primary))' : 'hsl(var(--border))',
            background: value === opt ? 'hsl(var(--primary) / 0.1)' : 'transparent',
          }}
        >
          <input 
            type="radio" 
            name={name} 
            value={opt} 
            checked={value === opt} 
            onChange={e => setForm({ ...form, [name]: e.target.value })} 
            className="sr-only" 
          />
          <span className="text-xs text-foreground">{opt}</span>
        </label>
      ))}
    </div>
  );

  if (!loaded) return <LoadingScreen onComplete={() => setLoaded(true)} duration={2000} />;

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <CustomCursor />
      <MinimalNav />

      <button 
        onClick={toggleMute}
        className="sound-toggle"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <ParticleField 
        scrollVelocity={isScrolling ? velocity : 0.5}
        isScrolling={cooldownRef.current}
        activeFrame={activeFrame}
      />

      <div className="fixed top-0 left-0 w-full h-[2px] z-50 bg-primary/20">
        <div 
          className="h-full bg-primary transition-all duration-1000 ease-out"
          style={{ width: `${((activeFrame + 1) / TOTAL_FRAMES) * 100}%` }}
        />
      </div>

      <div className="perspective-premium fixed inset-0">
        
        {/* Frame 0: Premise - Smart Money */}
        <div className={`frame-3d ${getFrameClass(0)}`}>
          <div className="max-w-6xl px-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <TrendingUp className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-massive text-foreground font-thin tracking-tighter letter-spread">
              SMART
            </h1>
            <h1 className="font-display text-massive text-primary font-thin tracking-tighter letter-spread stagger-2">
              MONEY
            </h1>
          </div>
        </div>

        {/* Frame 1: Subtitle - Full Description */}
        <div className={`frame-3d ${getFrameClass(1)}`}>
          <div className="max-w-2xl px-8 text-center">
            <p className="font-body text-whisper text-muted-foreground leading-relaxed reveal-up-premium">
              {t('funder.subtitle')}
            </p>
          </div>
        </div>

        {/* Frame 2: Problem Word - Noise */}
        <div className={`frame-3d ${getFrameClass(2)}`}>
          <div className="max-w-5xl px-8 text-center">
            <span className="text-micro text-muted-foreground block mb-8 reveal-up-premium">
              {t('funder.problem')}
            </span>
            <h2 className="font-display text-impact text-eden-crimson font-bold reveal-text-premium">
              NOISE
            </h2>
          </div>
        </div>

        {/* Frame 3: Pain Point 1 - What You've Seen */}
        <div className={`frame-3d ${getFrameClass(3)}`}>
          <div className="max-w-3xl px-8 text-center">
            <p className="font-display text-large text-foreground font-light leading-relaxed reveal-text-premium">
              {t('funder.pain1')}
            </p>
          </div>
        </div>

        {/* Frame 4: Pain Point 2 - Architecture */}
        <div className={`frame-3d ${getFrameClass(4)}`}>
          <div className="max-w-3xl px-8 text-center">
            <p className="font-body text-whisper text-foreground leading-relaxed reveal-up-premium">
              {t('funder.pain2')}
            </p>
          </div>
        </div>

        {/* Frame 5: Opportunity - Access */}
        <div className={`frame-3d ${getFrameClass(5)}`}>
          <div className="max-w-5xl px-8 text-center">
            <span className="text-micro text-muted-foreground block mb-8 reveal-up-premium">
              THE SOLUTION
            </span>
            <h2 className="font-display text-massive text-primary font-light eden-glow-pulse reveal-text-premium">
              ACCESS
            </h2>
          </div>
        </div>

        {/* Frame 6: The Offer - Full Revelation */}
        <div className={`frame-3d ${getFrameClass(6)}`}>
          <div className="max-w-3xl px-8 text-center">
            <p className="font-display text-large text-foreground italic leading-relaxed reveal-text-premium">
              &ldquo;{t('funder.revelation')}&rdquo;
            </p>
          </div>
        </div>

        {/* Frame 7: Network Number - 50+ */}
        <div className={`frame-3d ${getFrameClass(7)}`}>
          <div className="max-w-5xl px-8 text-center">
            <h2 className="font-display text-massive text-primary font-bold reveal-text-premium">
              50+
            </h2>
            <span className="text-micro text-muted-foreground block mt-4 reveal-up-premium stagger-2">
              FOUNDERS
            </span>
          </div>
        </div>

        {/* Frame 8: Network Label - Curated */}
        <div className={`frame-3d ${getFrameClass(8)}`}>
          <div className="max-w-4xl px-8 text-center">
            <span className="text-micro text-muted-foreground block mb-4 reveal-up-premium">
              CAREFULLY
            </span>
            <h2 className="font-display text-impact text-foreground font-medium reveal-text-premium">
              CURATED
            </h2>
            <h2 className="font-display text-large text-muted-foreground font-light mt-2 reveal-up-premium stagger-2">
              ARCHITECTS & FORCES
            </h2>
          </div>
        </div>

        {/* Frame 9: Validation - The Quote */}
        <div className={`frame-3d ${getFrameClass(9)}`}>
          <div className="max-w-2xl px-8 text-center">
            <p className="font-body text-whisper text-muted-foreground italic leading-relaxed reveal-up-premium">
              &ldquo;{t('funder.pain2')}&rdquo;
            </p>
          </div>
        </div>

        {/* Frame 10: Entry Call */}
        <div className={`frame-3d ${getFrameClass(10)}`}>
          <div className="max-w-4xl px-8 text-center">
            <span className="text-micro text-muted-foreground block mb-6 reveal-up-premium">
              INVESTOR ACCESS
            </span>
            <h2 className="font-display text-large text-foreground font-medium reveal-text-premium">
              {t('funder.formTitle')}
            </h2>
          </div>
        </div>

        {/* Frame 11: Form */}
        <div className={`frame-3d ${getFrameClass(11)}`}>
          <div className="max-w-lg w-full px-8 mx-auto h-full flex flex-col justify-center form-frame-scrollable py-24">
            <form onSubmit={handleSubmit} className="space-y-4 reveal-up-premium">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-micro text-muted-foreground block ml-1">{t('result.firstName')}</label>
                  <input 
                    className="w-full px-3 py-2 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                    required 
                    value={form.firstName} 
                    onChange={e => setForm({ ...form, firstName: e.target.value })} 
                    onFocus={() => playSound('focus')}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-micro text-muted-foreground block ml-1">{t('result.lastName')}</label>
                  <input 
                    className="w-full px-3 py-2 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                    required 
                    value={form.lastName} 
                    onChange={e => setForm({ ...form, lastName: e.target.value })} 
                    onFocus={() => playSound('focus')}
                  />
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
                <input 
                  className="w-full px-3 py-2 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                  placeholder="e.g. AI, Fintech" 
                  value={form.sectors} 
                  onChange={e => setForm({ ...form, sectors: e.target.value })} 
                  onFocus={() => playSound('focus')}
                />
              </div>

              <div className="space-y-1">
                <label className="text-micro text-muted-foreground block ml-1">{t('funder.ticketSize')}</label>
                <RadioGroup name="ticketSize" options={['10k-50k', '50k-250k', '250k-1M', '1M+']} value={form.ticketSize} />
              </div>

              <div className="space-y-1">
                <label className="text-micro text-muted-foreground block ml-1">{t('funder.proEmail')}</label>
                <input 
                  className="w-full px-3 py-2 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                  type="email" 
                  required 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  onFocus={() => playSound('focus')}
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 mt-6 font-body text-sm uppercase tracking-widest border border-primary text-foreground hover:bg-primary hover:text-background transition-all duration-300 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? t('result.submitting') : t('funder.submit')}
              </button>
              
              <p className="text-micro text-muted-foreground text-center">
                {t('funder.note')}
              </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Funder;
