import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import MinimalNav from '@/components/MinimalNav';
import { useScrollSound } from '@/hooks/useScrollSound';

const RoleChoice = () => {
  const { t } = useLanguage();
  const { playSound } = useScrollSound();

  return (
    <div className="grain-overlay min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <MinimalNav />

      {/* Ambient light */}
      <div className="absolute w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)', animation: 'loading-breathe 4s ease-in-out infinite' }} />

      <h1 className="font-display text-foreground font-light tracking-[0.1em] mb-16 reveal-text relative" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
        {t('role.title')}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[2px] max-w-[900px] w-full relative">
        <Link 
          to="/test" 
          className="choice-card" 
          onMouseEnter={() => playSound('click')}
          onClick={() => playSound('choice')}
        >
          <span className="text-2xl mb-6 text-primary font-display">◎</span>
          <h2 className="font-body text-xs tracking-[0.3em] mb-4 text-foreground">{t('role.found')}</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1 whitespace-pre-line">
            {t('role.foundDesc')}
          </p>
          <span className="font-mono text-xs text-primary mt-8 tracking-[0.15em]">{t('role.foundCta')} →</span>
        </Link>
        <Link 
          to="/funder" 
          className="choice-card" 
          onMouseEnter={() => playSound('click')}
          onClick={() => playSound('choice')}
        >
          <span className="text-2xl mb-6 text-primary font-display">◈</span>
          <h2 className="font-body text-xs tracking-[0.3em] mb-4 text-foreground">{t('role.fund')}</h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1 whitespace-pre-line">
            {t('role.fundDesc')}
          </p>
          <span className="font-mono text-xs text-primary mt-8 tracking-[0.15em]">{t('role.fundCta')} →</span>
        </Link>
      </div>
    </div>
  );
};

export default RoleChoice;
