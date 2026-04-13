import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import MinimalNav from '@/components/MinimalNav';
import CustomCursor from '@/components/CustomCursor';
import ParticleField from '@/components/ParticleField';
import { useScrollSound } from '@/hooks/useScrollSound';
import { Volume2, VolumeX } from 'lucide-react';

const RoleChoice = () => {
  const { t } = useLanguage();
  const { playSound, isMuted, toggleMute } = useScrollSound();

  return (
    <div className="grain-overlay min-h-[100dvh] bg-background flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <CustomCursor />
      <MinimalNav />

      <button onClick={toggleMute} className="sound-toggle" aria-label={isMuted ? "Unmute" : "Mute"}>
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <ParticleField scrollVelocity={0.5} isScrolling={false} activeFrame={0} />

      {/* Ambient light */}
      <div className="absolute w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)', animation: 'loading-breathe 5s ease-in-out infinite' }} />

      <h1 className="font-display text-foreground font-extralight tracking-[0.1em] md:tracking-[0.15em] mb-8 md:mb-16 text-center px-4" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 2.5rem)', animation: 'reveal-text 1s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
        {t('role.title')}
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2px] max-w-[900px] w-full relative px-4 md:px-0">
        <Link 
          to="/test" 
          className="choice-card" 
          onMouseEnter={() => playSound('click')}
          onClick={() => playSound('choice')}
        >
          <span className="text-2xl mb-4 md:mb-6 text-primary font-display">◎</span>
          <h2 className="font-body text-xs tracking-[0.3em] mb-3 md:mb-4 text-foreground">{t('role.found')}</h2>
          <p className="font-body text-xs md:text-sm text-muted-foreground leading-relaxed flex-1 whitespace-pre-line">
            {t('role.foundDesc')}
          </p>
          <span className="font-mono text-xs text-primary mt-6 md:mt-8 tracking-[0.15em]">{t('role.foundCta')} →</span>
        </Link>
        <Link 
          to="/fund" 
          className="choice-card" 
          onMouseEnter={() => playSound('click')}
          onClick={() => playSound('choice')}
        >
          <span className="text-2xl mb-4 md:mb-6 text-primary font-display">◈</span>
          <h2 className="font-body text-xs tracking-[0.3em] mb-3 md:mb-4 text-foreground">{t('role.fund')}</h2>
          <p className="font-body text-xs md:text-sm text-muted-foreground leading-relaxed flex-1 whitespace-pre-line">
            {t('role.fundDesc')}
          </p>
          <span className="font-mono text-xs text-primary mt-6 md:mt-8 tracking-[0.15em]">{t('role.fundCta')} →</span>
        </Link>
      </div>
    </div>
  );
};

export default RoleChoice;
