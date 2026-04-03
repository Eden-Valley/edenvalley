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

const formSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  vision: z.string().min(10).max(2000),
});

interface ResultPageProps {
  type: 'thinker' | 'doer';
}

const TOTAL_FRAMES = 14;
const COOLDOWN_DURATION = 1200;

const ResultPage = ({ type }: ResultPageProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { playSound, setMusicIntensity, isMuted, toggleMute } = useScrollSound();
  const { velocity, isScrolling } = useScrollVelocity();
  const [activeFrame, setActiveFrame] = useState(0);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', vision: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const cooldownRef = useRef(false);
  const touchStartY = useRef(0);

  const goToFrame = useCallback((index: number) => {
    if (cooldownRef.current) return;
    if (index < 0 || index >= TOTAL_FRAMES) return;

    cooldownRef.current = true;
    setActiveFrame(index);
    playSound('transition');
    
    // Set music intensity based on frame type: low for pain (0-5), high for relief/CTA (6+)
    const intensity = index <= 5 ? 0.2 : 0.9;
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
    setErrors({});
    const validation = formSchema.safeParse(form);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => { if (err.path[0]) newErrors[err.path[0] as string] = err.message; });
      setErrors(newErrors);
      playSound('error' as any);
      return;
    }

    setSubmitting(true);
    try {
      await sql`
        INSERT INTO users (email, first_name, last_name, role)
        VALUES (${form.email}, ${form.firstName}, ${form.lastName}, ${type})
        ON CONFLICT (email) DO UPDATE 
        SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role = EXCLUDED.role
      `;
      const user = await sql`SELECT id FROM users WHERE email = ${form.email}`;
      if (user && user.length > 0) {
        const userId = user[0].id;
        // Store userId for invitation system
        localStorage.setItem('eden-user-id', userId);
        await sql`INSERT INTO profiles (user_id, type, vision) VALUES (${userId}, ${type}, ${form.vision})`;
        const ref = new URLSearchParams(window.location.search).get('ref');
        if (ref) {
          await sql`
            INSERT INTO invitations (inviter_id, invitee_id, code)
            SELECT id, ${userId}, ${ref} FROM users WHERE id::text = ${ref}
            ON CONFLICT DO NOTHING
          `;
        }
      }
      playSound('success');
      navigate('/thanks');
    } catch (error) {
      console.error("Submission failed:", error);
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

  if (!loaded) return <LoadingScreen onComplete={() => setLoaded(true)} duration={2000} />;

  const isThinker = type === 'thinker';

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
        
        {/* Frame 0: Identity Hit - Massive Persona Title */}
        <div className={`frame-3d ${getFrameClass(0)}`}>
          <div className="max-w-6xl px-8 text-center">
            <h1 className="font-display text-massive text-foreground font-thin tracking-tighter letter-spread">
              {isThinker ? 'ARCHITECT' : 'FORCE'}
            </h1>
          </div>
        </div>

        {/* Frame 1: Subtitle Whisper - Full Description */}
        <div className={`frame-3d ${getFrameClass(1)}`}>
          <div className="max-w-2xl px-8 text-center">
            <p className="font-body text-whisper text-muted-foreground leading-relaxed reveal-up-premium">
              {t(`${type}.subtitle`)}
            </p>
          </div>
        </div>

        {/* Frame 2: Pain Signal 1 - Be Honest */}
        <div className={`frame-3d ${getFrameClass(2)}`}>
          <div className="max-w-5xl px-8 text-center">
            <span className="text-micro text-muted-foreground block mb-8 reveal-up-premium">
              {t('result.thePain')}
            </span>
            <h2 className="font-display text-impact text-eden-crimson font-bold reveal-text-premium">
              {t(`${type}.pain1`)}
            </h2>
          </div>
        </div>

        {/* Frame 3: Pain Detail 1 - The Notes App Question */}
        <div className={`frame-3d ${getFrameClass(3)}`}>
          <div className="max-w-3xl px-8 text-center">
            <p className="font-display text-large text-foreground font-light leading-relaxed reveal-text-premium">
              {t(`${type}.pain2`)}
            </p>
          </div>
        </div>

        {/* Frame 4: Pain Signal 2 - The Wrong Problem */}
        <div className={`frame-3d ${getFrameClass(4)}`}>
          <div className="max-w-4xl px-8 text-center">
            <h2 className="font-display text-impact text-eden-crimson font-bold reveal-text-premium">
              {isThinker ? 'WRONG TARGET' : 'WRONG VISION'}
            </h2>
            <p className="font-body text-whisper text-muted-foreground mt-8 leading-relaxed reveal-up-premium stagger-2">
              {t(`${type}.pain3`)}
            </p>
          </div>
        </div>

        {/* Frame 5: Pain Detail 2 - Pioneer vs Builder */}
        <div className={`frame-3d ${getFrameClass(5)}`}>
          <div className="max-w-3xl px-8 text-center">
            <p className="font-display text-large text-foreground font-light leading-relaxed reveal-text-premium">
              {t(`${type}.pain4`)}
            </p>
          </div>
        </div>

        {/* Frame 6: Relief Signal - They Were Wrong */}
        <div className={`frame-3d ${getFrameClass(6)}`}>
          <div className="max-w-5xl px-8 text-center">
            <span className="text-micro text-muted-foreground block mb-8 reveal-up-premium">
              {t('result.theRelief')}
            </span>
            <h2 className="font-display text-massive text-primary font-light eden-glow-pulse reveal-text-premium">
              {t(`${type}.relief1`)}
            </h2>
          </div>
        </div>

        {/* Frame 7: Relief Detail 1 - Gurus & Culture */}
        <div className={`frame-3d ${getFrameClass(7)}`}>
          <div className="max-w-3xl px-8 text-center">
            <p className="font-body text-whisper text-foreground leading-relaxed reveal-up-premium">
              {t(`${type}.relief2`)}
            </p>
          </div>
        </div>

        {/* Frame 8: Relief Signal 2 - What You Need */}
        <div className={`frame-3d ${getFrameClass(8)}`}>
          <div className="max-w-4xl px-8 text-center">
            <h2 className="font-display text-impact text-primary font-bold reveal-text-premium">
              {isThinker ? 'CLARITY' : 'MOMENTUM'}
            </h2>
            <p className="font-body text-whisper text-muted-foreground mt-6 leading-relaxed reveal-up-premium stagger-2">
              {t(`${type}.relief3`)}
            </p>
          </div>
        </div>

        {/* Frame 9: Revelation Core - Key Insight */}
        <div className={`frame-3d ${getFrameClass(9)}`}>
          <div className="max-w-4xl px-8 text-center">
            <p className="font-display text-large text-foreground italic leading-relaxed reveal-text-premium">
              &ldquo;{t(`${type}.revelation`)}&rdquo;
            </p>
          </div>
        </div>

        {/* Frame 10: The Valley Awaits */}
        <div className={`frame-3d ${getFrameClass(10)}`}>
          <div className="max-w-5xl px-8 text-center">
            <span className="text-micro text-muted-foreground block mb-6 reveal-up-premium">
              EDEN VALLEY
            </span>
            <h2 className="font-display text-massive text-primary font-thin tracking-tighter reveal-text-premium">
              AWAITS
            </h2>
          </div>
        </div>

        {/* Frame 11: Invitation */}
        <div className={`frame-3d ${getFrameClass(11)}`}>
          <div className="max-w-3xl px-8 text-center">
            <h2 className="font-display text-large text-foreground font-medium reveal-text-premium">
              {t(`${type}.formTitle`)}
            </h2>
          </div>
        </div>

        {/* Frame 12: Form Entry - Names & Email */}
        <div className={`frame-3d ${getFrameClass(12)}`}>
          <div className="max-w-md w-full px-8 mx-auto h-full flex flex-col justify-center form-frame-scrollable py-24">
            <form className="space-y-5 reveal-up-premium">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-micro text-muted-foreground block ml-1">{t('result.firstName')}</label>
                  <input 
                    className="w-full px-3 py-2.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                    required 
                    value={form.firstName} 
                    onChange={e => setForm({ ...form, firstName: e.target.value })} 
                    onFocus={() => playSound('focus')}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-micro text-muted-foreground block ml-1">{t('result.lastName')}</label>
                  <input 
                    className="w-full px-3 py-2.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                    required 
                    value={form.lastName} 
                    onChange={e => setForm({ ...form, lastName: e.target.value })} 
                    onFocus={() => playSound('focus')}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-micro text-muted-foreground block ml-1">{t('result.email')}</label>
                <input 
                  className="w-full px-3 py-2.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors"
                  type="email" 
                  required 
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                  onFocus={() => playSound('focus')}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Frame 13: Form Entry - Vision & Submit */}
        <div className={`frame-3d ${getFrameClass(13)}`}>
          <div className="max-w-md w-full px-8 mx-auto h-full flex flex-col justify-center form-frame-scrollable py-24">
            <form onSubmit={handleSubmit} className="space-y-5 reveal-up-premium">
              <div className="space-y-1">
                <label className="text-micro text-muted-foreground block ml-1">
                  {isThinker ? 'Vision' : 'Energy'}
                </label>
                <textarea 
                  className="w-full px-3 py-2.5 bg-card/50 border border-border text-foreground text-sm outline-none focus:border-primary transition-colors resize-none"
                  rows={4}
                  placeholder={t(`${type}.placeholder`)} 
                  value={form.vision} 
                  onChange={e => setForm({ ...form, vision: e.target.value })} 
                  onFocus={() => playSound('focus')}
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 mt-4 font-body text-sm uppercase tracking-widest border border-primary text-foreground hover:bg-primary hover:text-background transition-all duration-300 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? t('result.submitting') : t('result.enterValley')}
              </button>
              
              <p className="text-micro text-muted-foreground text-center">
                {t('result.validation')}
              </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResultPage;
