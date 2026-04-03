import { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import MinimalNav from '@/components/MinimalNav';
import { useScrollSound } from '@/hooks/useScrollSound';

const Thanks = () => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [url, setUrl] = useState<string>('');
  const { t } = useLanguage();
  const { playSound } = useScrollSound();

  // Legacy fallback using execCommand
  const fallbackCopyTextToClipboard = (text: string): boolean => {
    console.log('[Clipboard] Trying legacy execCommand fallback...');
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    
    try {
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999); // Mobile support
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      console.log('[Clipboard] Legacy fallback result:', successful);
      return successful;
    } catch (err) {
      console.error('[Clipboard] Legacy fallback failed:', err);
      document.body.removeChild(textArea);
      return false;
    }
  };

  // Manual selection fallback
  const showManualCopy = (text: string) => {
    console.log('[Clipboard] Showing manual copy fallback');
    setUrl(text);
    setShowManual(true);
    setError('Auto-copy not supported. Please select and copy manually.');
  };

  const copyLink = async () => {
    console.log('[Clipboard] Copy link initiated');
    setError(null);
    setShowManual(false);
    
    const userId = localStorage.getItem('eden-user-id');
    console.log('[Clipboard] User ID from localStorage:', userId);
    
    if (!userId) {
      console.error('[Clipboard] No user ID found in localStorage');
      setError('User ID not found. Please try signing up again.');
      return;
    }
    
    const generatedUrl = `https://edenvalley.io/?ref=${userId}`;
    console.log('[Clipboard] Generated URL:', generatedUrl);
    
    // Check if modern Clipboard API is available
    if (!navigator.clipboard) {
      console.warn('[Clipboard] navigator.clipboard not available, trying legacy fallback');
      const success = fallbackCopyTextToClipboard(generatedUrl);
      if (success) {
        playSound('click');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        showManualCopy(generatedUrl);
      }
      return;
    }
    
    try {
      console.log('[Clipboard] Attempting modern Clipboard API...');
      await navigator.clipboard.writeText(generatedUrl);
      console.log('[Clipboard] Modern API success!');
      
      playSound('click');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('[Clipboard] Modern API failed:', err);
      
      // Try legacy fallback
      console.log('[Clipboard] Attempting legacy fallback...');
      const success = fallbackCopyTextToClipboard(generatedUrl);
      if (success) {
        playSound('click');
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        showManualCopy(generatedUrl);
      }
    }
  };

  return (
    <div className="grain-overlay min-h-screen bg-background flex flex-col items-center justify-center px-8">
      <MinimalNav />

      <div className="absolute w-[400px] h-[400px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)', animation: 'loading-breathe 4s ease-in-out infinite' }} />

      <div className="max-w-[600px] text-center relative">
        <div className="w-12 h-12 mx-auto mb-6 rounded-full border border-primary/30 flex items-center justify-center animate-fade-in">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
        </div>
        <h1 className="font-display text-foreground font-light mb-4 animate-fade-in" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', animationDelay: '0.1s' }}>
          {t('thanks.title')}
        </h1>
        <p className="font-display text-muted-foreground text-lg italic mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>{t('thanks.subtitle')}</p>
        <p className="font-body text-muted-foreground text-sm leading-relaxed mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {t('thanks.body')}
        </p>

        <div className="border-t border-border pt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="font-body text-muted-foreground text-sm leading-relaxed mb-8">
            {t('thanks.share')}
          </p>
          
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          
          {/* Manual copy fallback */}
          {showManual && (
            <div className="mb-6 p-4 bg-card/50 border border-border rounded">
              <p className="text-muted-foreground text-sm mb-2">Select and copy this URL:</p>
              <input 
                type="text" 
                value={url} 
                readOnly
                className="w-full px-3 py-2 bg-background border border-border text-foreground text-sm text-center"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
          )}
          
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
