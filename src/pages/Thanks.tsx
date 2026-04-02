import { useState } from 'react';
import MinimalNav from '@/components/MinimalNav';

const Thanks = () => {
  const [copied, setCopied] = useState(false);

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
      <div className="max-w-[600px] text-center">
        <div className="text-3xl mb-6">🔒</div>
        <h1 className="font-display text-foreground font-light mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          Profile registered.
        </h1>
        <p className="font-display text-muted-foreground text-lg italic mb-8">Validation in progress.</p>
        <p className="font-body text-muted-foreground text-sm leading-relaxed mb-16">
          Access to Eden Valley is exclusive. We validate every profile to guarantee a quality ecosystem.
          You will receive your private access link by email once your application is validated.
        </p>

        <div className="border-t border-border pt-16">
          <p className="font-body text-muted-foreground text-sm leading-relaxed mb-8">
            The world is full of misunderstood Thinkers and frustrated Doers trapped in the wrong system.
            If you know a brilliant mind stuck in execution, or a force of nature looking for its mission...
          </p>
          <button onClick={copyLink} className="eden-btn">
            COPY MY PERSONAL INVITATION LINK
          </button>
          <p className={`font-mono text-xs text-primary mt-4 tracking-wide transition-opacity duration-300 ${copied ? 'opacity-100' : 'opacity-0'}`}>
            ✓ Link copied
          </p>
        </div>
      </div>
    </div>
  );
};

export default Thanks;
