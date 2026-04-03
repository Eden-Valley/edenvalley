import { useLanguage } from '@/i18n/LanguageContext';
import MinimalNav from '@/components/MinimalNav';

const FunderThanks = () => {
  const { t } = useLanguage();

  return (
    <div className="grain-overlay min-h-screen bg-background flex flex-col items-center justify-center px-8">
      <MinimalNav />

      <div className="absolute w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)', animation: 'loading-breathe 4s ease-in-out infinite' }} />

      <div className="max-w-[600px] text-center relative">
        <div className="w-12 h-12 mx-auto mb-6 rounded-full border border-primary/30 flex items-center justify-center animate-fade-in">
          <div className="w-2 h-2 rotate-45 bg-primary" />
        </div>
        <h1 className="font-display text-foreground font-light mb-4 animate-fade-in" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', animationDelay: '0.1s' }}>
          {t('funderThanks.title')}
        </h1>
        <p className="font-display text-muted-foreground text-lg italic mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>{t('funderThanks.subtitle')}</p>
        <p className="font-body text-muted-foreground text-sm leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {t('funderThanks.body')}
        </p>
      </div>
    </div>
  );
};

export default FunderThanks;
