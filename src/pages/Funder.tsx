import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import MinimalNav from '@/components/MinimalNav';

const Funder = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    investorType: '',
    stage: '',
    sectors: '',
    ticketSize: '',
    annualCapital: '',
    dealsPerYear: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/submit-funder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ref: new URLSearchParams(window.location.search).get('ref') }),
      });
    } catch { /* backend later */ }
    navigate('/funder-thanks');
  };

  const RadioGroup = ({ name, options, value }: { name: string; options: string[]; value: string }) => (
    <div className="flex flex-wrap gap-3 mb-6">
      {options.map(opt => (
        <label key={opt} className={`eden-input inline-flex items-center gap-2 w-auto cursor-pointer transition-colors ${value === opt ? 'border-primary text-foreground' : ''}`}>
          <input type="radio" name={name} value={opt} checked={value === opt} onChange={e => setForm({ ...form, [name]: e.target.value })} className="sr-only" />
          <span className={`w-3 h-3 rounded-full border ${value === opt ? 'border-primary bg-primary' : 'border-muted-foreground'}`} />
          {opt}
        </label>
      ))}
    </div>
  );

  return (
    <div className="grain-overlay min-h-screen bg-background">
      <MinimalNav />
      <div className="max-w-[680px] mx-auto px-8 py-24">
        {/* Hero */}
        <div className="text-center pb-16 border-b border-border mb-16">
          <div className="text-5xl mb-6">💎</div>
          <h1 className="font-display text-foreground font-light mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
            The smartest money invests in structure.
          </h1>
          <p className="font-body text-muted-foreground text-lg italic">Not in hope. Not in hype. In architecture.</p>
        </div>

        {/* Pain */}
        <section className="mb-16 pb-16 border-b border-muted">
          <span className="font-mono text-xs tracking-[0.3em] text-eden-crimson mb-6 block">THE PROBLEM</span>
          <p className="font-body text-muted-foreground leading-relaxed mb-4">
            You've seen it. Brilliant founders who can't execute. Relentless operators chasing mediocre ideas.
            Solo founders who burn out. Co-founders who split up.
          </p>
          <p className="font-body text-muted-foreground leading-relaxed">
            The failure rate isn't about ideas or markets. It's about the fundamental architecture of founding teams.
          </p>
        </section>

        {/* Revelation */}
        <div className="revelation-box mb-16">
          <p className="font-display text-foreground text-center leading-relaxed" style={{ fontSize: '1.4rem' }}>
            Eden Valley doesn't match skills. It matches cognitive DNA.<br />
            Thinker + Builder. Map + Road. Every time.
          </p>
        </div>

        {/* Form */}
        <section>
          <h3 className="font-display text-foreground text-2xl mb-8">Your profile.</h3>
          <form onSubmit={handleSubmit}>
            <label className="font-mono text-xs text-muted-foreground tracking-[0.15em] block mb-3">INVESTOR TYPE</label>
            <RadioGroup name="investorType" options={['VC', 'Business Angel', 'Family Office', 'Corporate VC', 'Other']} value={form.investorType} />

            <label className="font-mono text-xs text-muted-foreground tracking-[0.15em] block mb-3">PREFERRED STAGE</label>
            <RadioGroup name="stage" options={['Pre-seed', 'Seed', 'Series A', 'Flexible']} value={form.stage} />

            <input className="eden-input mb-4" placeholder="Preferred sectors" value={form.sectors} onChange={e => setForm({ ...form, sectors: e.target.value })} />

            <label className="font-mono text-xs text-muted-foreground tracking-[0.15em] block mb-3">TYPICAL TICKET SIZE</label>
            <RadioGroup name="ticketSize" options={['10k-50k', '50k-250k', '250k-1M', '1M+']} value={form.ticketSize} />

            <input className="eden-input mb-4" placeholder="Total annual estimated capital" value={form.annualCapital} onChange={e => setForm({ ...form, annualCapital: e.target.value })} />
            <input className="eden-input mb-4" placeholder="Deals per year" value={form.dealsPerYear} onChange={e => setForm({ ...form, dealsPerYear: e.target.value })} />
            <input className="eden-input mb-4" type="email" placeholder="Professional email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

            <button type="submit" className="eden-btn w-full" disabled={submitting}>
              {submitting ? 'SUBMITTING...' : '🌳 REQUEST ACCESS'}
            </button>
            <p className="font-mono text-xs text-eden-faint text-center mt-3 tracking-wide">By invitation. Validation required.</p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Funder;
