import { useLanguage } from '@/i18n/LanguageContext';
import MinimalNav from '@/components/MinimalNav';
import CustomCursor from '@/components/CustomCursor';
import ParticleField from '@/components/ParticleField';
import { useScrollSound } from '@/hooks/useScrollSound';
import { Volume2, VolumeX } from 'lucide-react';

const FunderThanks = () => {
  const { t } = useLanguage();
  const { isMuted, toggleMute } = useScrollSound();

  return (
    <div className="grain-overlay min-h-screen bg-background flex flex-col items-center justify-center px-4 md:px-8 relative overflow-hidden">
      <CustomCursor />
      <MinimalNav />
      <button onClick={toggleMute} className="sound-toggle" aria-label={isMuted ? "Unmute" : "Mute"}>
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      <ParticleField scrollVelocity={0.3} isScrolling={false} activeFrame={10} />

      <div className="absolute w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)', animation: 'loading-breathe 5s ease-in-out infinite' }} />

      <div className="max-w-[550px] text-center relative">
        <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-6 rounded-full border border-primary/30 flex items-center justify-center" style={{ animation: 'fadeIn 1s ease both' }}>
          <div className="w-2 h-2 rotate-45 bg-primary" />
        </div>
        <h1 className="font-display text-foreground font-extralight mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', animation: 'fadeIn 1s ease 0.1s both' }}>
          {t('funderThanks.title')}
        </h1>
        <p className="font-display text-muted-foreground text-base md:text-lg italic mb-6 md:mb-8" style={{ animation: 'fadeIn 1s ease 0.2s both' }}>{t('funderThanks.subtitle')}</p>
        <p className="font-body text-muted-foreground text-xs md:text-sm leading-relaxed" style={{ animation: 'fadeIn 1s ease 0.3s both' }}>
          {t('funderThanks.body')}
        </p>
      </div>
    </div>
  );
};

export default FunderThanks;
