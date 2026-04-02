import MinimalNav from '@/components/MinimalNav';

const FunderThanks = () => (
  <div className="grain-overlay min-h-screen bg-background flex flex-col items-center justify-center px-8">
    <MinimalNav />
    <div className="max-w-[600px] text-center">
      <div className="text-3xl mb-6">🔒</div>
      <h1 className="font-display text-foreground font-light mb-4" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
        Application received.
      </h1>
      <p className="font-display text-muted-foreground text-lg italic mb-8">Under review.</p>
      <p className="font-body text-muted-foreground text-sm leading-relaxed">
        Eden Valley curates its investor network with the same rigor it applies to founders.
        You will receive a private briefing by email once your profile is validated.
      </p>
    </div>
  </div>
);

export default FunderThanks;
