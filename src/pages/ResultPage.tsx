import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import MinimalNav from '@/components/MinimalNav';

interface ResultPageProps {
  type: 'thinker' | 'doer';
}

const content = {
  thinker: {
    badge: '🧠',
    title: "You're an Architect.",
    subtitle: "You were never lazy. You were solving the wrong problem: yourself.",
    pain: [
      "Be honest.",
      "How many ideas are sitting in your notes app right now? How many problems have you solved in your head — perfectly — but never shipped? How many times have you watched someone less talented than you execute a mediocre version of your idea… and succeed?",
      "You thought the problem was discipline. Motivation. Focus. It wasn't.",
      "The problem is that you're a Pioneer trying to be a Builder. And the world never told you that was a design flaw in its system — not in you.",
    ],
    relief: [
      "They were all wrong.",
      "The productivity gurus. The hustle culture. The 'just ship it' mantras. They were written for Builders. Not for you.",
      "You don't need to ship faster. You need someone whose entire genius is turning your map into reality.",
    ],
    revelation: "You are the Pioneer. You find the valley. You draw the map. But you were never supposed to build the city.",
    formTitle: "Deposit your map.",
  },
  doer: {
    badge: '⚡',
    title: "You're a Force of Nature.",
    subtitle: "You were never scattered. You were aiming at the wrong target.",
    pain: [
      "Be honest.",
      "How many projects have you thrown yourself into with everything you had — only to hit a wall because the vision wasn't solid enough? How many times have you outworked everyone in the room, only to realize you were building in the wrong direction?",
      "You thought the problem was finding the right idea. The right market. The right timing. It wasn't.",
      "The problem is that you're a Builder trying to be a Pioneer. And the world convinced you that you needed to be both.",
    ],
    relief: [
      "They were all wrong.",
      "The startup advice. The 'founder-market fit' obsession. The idea that you need a revolutionary insight before you can start building.",
      "You don't need a better idea. You need someone whose entire genius is seeing what you can't — so you can build what they can't.",
    ],
    revelation: "You are the Builder. You take the map and build the empire. But you were never supposed to draw the map.",
    formTitle: "Bring your energy.",
  },
};

const ResultPage = ({ type }: ResultPageProps) => {
  const navigate = useNavigate();
  const c = content[type];
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', vision: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type, ref: new URLSearchParams(window.location.search).get('ref') }),
      });
    } catch { /* will handle with backend later */ }
    navigate('/thanks');
  };

  return (
    <div className="grain-overlay min-h-screen bg-background">
      <MinimalNav />
      <div className="max-w-[680px] mx-auto px-8 py-24">
        {/* Hero */}
        <div className="text-center pb-16 border-b border-border mb-16">
          <div className="text-5xl mb-6">{c.badge}</div>
          <h1 className="font-display text-foreground font-light mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            {c.title}
          </h1>
          <p className="font-body text-muted-foreground text-lg italic">{c.subtitle}</p>
        </div>

        {/* Pain */}
        <section className="mb-16 pb-16 border-b border-muted">
          <span className="font-mono text-xs tracking-[0.3em] text-eden-crimson mb-6 block">THE PAIN</span>
          {c.pain.map((p, i) => (
            <p key={i} className="font-body text-muted-foreground leading-relaxed mb-4">{p}</p>
          ))}
        </section>

        {/* Relief */}
        <section className="mb-16 pb-16 border-b border-muted">
          <span className="font-mono text-xs tracking-[0.3em] text-primary mb-6 block">THE RELIEF</span>
          {c.relief.map((p, i) => (
            <p key={i} className="font-body text-muted-foreground leading-relaxed mb-4">{p}</p>
          ))}
        </section>

        {/* Revelation */}
        <div className="revelation-box mb-16">
          <p className="font-display text-foreground text-center leading-relaxed" style={{ fontSize: '1.4rem' }}>
            {c.revelation}
          </p>
        </div>

        {/* Form */}
        <section>
          <h3 className="font-display text-foreground text-2xl mb-8">{c.formTitle}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input className="eden-input" placeholder="First name" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              <input className="eden-input" placeholder="Last name" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <input className="eden-input mb-4" type="email" placeholder="Email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <textarea className="eden-input mb-4" rows={4} placeholder={type === 'thinker' ? "Describe your vision in a few lines..." : "What drives you? What have you built?"} value={form.vision} onChange={e => setForm({ ...form, vision: e.target.value })} />
            <button type="submit" className="eden-btn w-full" disabled={submitting}>
              {submitting ? 'SUBMITTING...' : '🌳 ENTER THE VALLEY'}
            </button>
            <p className="font-mono text-xs text-eden-faint text-center mt-3 tracking-wide">Access upon profile validation.</p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ResultPage;
