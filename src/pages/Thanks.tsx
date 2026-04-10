import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import MinimalNav from '@/components/MinimalNav';
import CustomCursor from '@/components/CustomCursor';
import ParticleField from '@/components/ParticleField';
import { useScrollSound } from '@/hooks/useScrollSound';
import { Volume2, VolumeX } from 'lucide-react';

const STRIPE_PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK || 'https://buy.stripe.com/00wfZbfZF3jncTvaEV0kE00';

const Thanks = () => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [url, setUrl] = useState('');
  const { t } = useLanguage();
  const { playSound, isMuted, toggleMute } = useScrollSound();

  const [tier, setTier] = useState<'standard' | 'priority'>('standard');
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tierParam = params.get('tier');
    if (tierParam === 'priority') {
      setTier('priority');
      localStorage.removeItem('eden-pending-payment');
    }
    const storedCode = localStorage.getItem('eden-referral-code');
    if (storedCode) {
      setReferralCode(storedCode);
    }
  }, []);

  const fallbackCopy = (text: string): boolean => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    try {
      ta.focus(); ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch { document.body.removeChild(ta); return false; }
  };

  const copyLink = async () => {
    setError(null); setShowManual(false);
    const code = referralCode || localStorage.getItem('eden-referral-code');
    if (!code) { setError('Referral code not found.'); return; }
    const baseUrl = import.meta.env.VITE_REFERRAL_BASE_URL || window.location.origin;
    const generatedUrl = `${baseUrl}/?ref=${code}`;
    
    const onSuccess = () => { playSound('click'); setCopied(true); setTimeout(() => setCopied(false), 2500); };
    
    if (!navigator.clipboard) {
      if (fallbackCopy(generatedUrl)) onSuccess();
      else { setUrl(generatedUrl); setShowManual(true); }
      return;
    }
    try { await navigator.clipboard.writeText(generatedUrl); onSuccess(); }
    catch { if (fallbackCopy(generatedUrl)) onSuccess(); else { setUrl(generatedUrl); setShowManual(true); } }
  };

  const isPriority = tier === 'priority';

  return (
    <div className="grain-overlay min-h-[100dvh] bg-background flex flex-col items-center justify-center px-4 md:px-8 relative overflow-hidden">
      <CustomCursor />
      <MinimalNav />
      <button onClick={toggleMute} className="sound-toggle" aria-label={isMuted ? "Unmute" : "Mute"}>
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      <ParticleField scrollVelocity={0.3} isScrolling={false} activeFrame={11} />

      <div className="absolute w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)', animation: 'loading-breathe 5s ease-in-out infinite' }} />

      <div className="max-w-[550px] w-full text-center relative px-4 sm:px-6">
        <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-6 rounded-full border border-primary/30 flex items-center justify-center" style={{ animation: 'fadeIn 1s ease both' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
        
        {isPriority ? (
          <>
            <h1 className="font-display text-foreground font-extralight mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', animation: 'fadeIn 1s ease 0.1s both' }}>
              {t('thanks.priorityTitle')}
            </h1>
            <p className="font-display text-muted-foreground text-base md:text-lg italic mb-6 md:mb-8" style={{ animation: 'fadeIn 1s ease 0.2s both' }}>{t('thanks.prioritySubtitle')}</p>
          </>
        ) : (
          <>
            <h1 className="font-display text-foreground font-extralight mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', animation: 'fadeIn 1s ease 0.1s both' }}>
              {t('thanks.title')}
            </h1>
            <p className="font-display text-muted-foreground text-base md:text-lg italic mb-6 md:mb-8" style={{ animation: 'fadeIn 1s ease 0.2s both' }}>{t('thanks.subtitle')}</p>
            <p className="font-body text-muted-foreground text-xs md:text-sm leading-relaxed mb-6 md:mb-8" style={{ animation: 'fadeIn 1s ease 0.3s both' }}>
              {t('thanks.body')}
            </p>

            <div className="border-t border-border pt-8 mb-8" style={{ animation: 'fadeIn 1s ease 0.35s both' }}>
              <p className="font-body text-muted-foreground text-xs mb-4">{t('thanks.inAHurry')}</p>
              <a 
                href={STRIPE_PAYMENT_LINK}
                className="inline-block w-full sm:w-auto px-6 py-3 text-sm sm:text-base bg-primary text-background hover:bg-primary/90 transition-colors duration-300"
              >
                {t('thanks.upgradeToPriority')}
              </a>
            </div>
          </>
        )}

        <div className="border-t border-border pt-8 md:pt-10" style={{ animation: 'fadeIn 1s ease 0.4s both' }}>
          <p className="font-body text-muted-foreground text-xs md:text-sm leading-relaxed mb-6 md:mb-8">{t('thanks.share')}</p>
          
          {error && <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded"><p className="text-destructive text-sm break-words">{error}</p></div>}
          {showManual && (
            <div className="mb-6 p-4 bg-card/50 border border-border rounded mx-4 sm:mx-0">
              <p className="text-muted-foreground text-sm mb-2">Select and copy:</p>
              <input type="text" value={url} readOnly className="w-full px-3 py-2 bg-background border border-border text-foreground text-sm text-center rounded break-all" onClick={(e) => (e.target as HTMLInputElement).select()} />
            </div>
          )}
          
          <button onClick={copyLink} className="eden-btn w-full sm:w-auto px-6 py-3 text-sm sm:text-base">{t('thanks.copy')}</button>
          <p className={`font-mono text-xs text-primary mt-4 tracking-wide transition-opacity duration-300 ${copied ? 'opacity-100' : 'opacity-0'}`}>✓ {t('thanks.copied')}</p>
        </div>
      </div>
    </div>
  );
};

export default Thanks;
