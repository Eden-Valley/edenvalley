import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import MinimalNav from '@/components/MinimalNav';

const Thanks = () => {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const copyLink = () => {
    const ref = btoa(Date.now().toString()).substring(0, 8).toUpperCase();
    const url = `https://edenvalley.io/?ref=${ref}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="grain-overlay min-h-screen bg-background flex flex-col items-center justify-center px-8">
      <MinimalNav />

      <div className="absolute w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)', animation: 'loading-breathe 4s ease-in-out infinite' }} />

      <div className="max-w-[600px] text-center relative">
        <div className="w-12 h-12 mx-auto mb-6 rounded-full border border-primary/30 flex items-center justify-center reveal-up">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
        <h1 className="font-display text-foreground font-light mb-4 reveal-text" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          {t('thanks.title')}
        </h1>
        <p className="font-display text-muted-foreground text-lg italic mb-8 reveal-up" style={{ animationDelay: '0.15s' }}>{t('thanks.subtitle')}</p>
        <p className="font-body text-muted-foreground text-sm leading-relaxed mb-16 reveal-up" style={{ animationDelay: '0.25s' }}>
          {t('thanks.body')}
        </p>

        <div className="border-t border-border pt-16 reveal-up" style={{ animationDelay: '0.35s' }}>
          <p className="font-body text-muted-foreground text-sm leading-relaxed mb-8">
            {t('thanks.share')}
          </p>
          <button onClick={copyLink} className="eden-btn">
            {t('thanks.copy')}
          </button>
          <p className={`font-mono text-xs text-primary mt-4 tracking-wide transition-opacity duration-300 ${copied ? 'opacity-100' : 'opacity-0'}`}>
            ✓ {t('thanks.copied')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Thanks;
