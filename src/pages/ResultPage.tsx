import { useState, FormEvent, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import MinimalNav from '@/components/MinimalNav';

interface ResultPageProps {
  type: 'thinker' | 'doer';
}

const ResultPage = ({ type }: ResultPageProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', vision: '' });
  const [submitting, setSubmitting] = useState(false);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

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

  const pain = [t(`${type}.pain1`), t(`${type}.pain2`), t(`${type}.pain3`), t(`${type}.pain4`)];
  const relief = [t(`${type}.relief1`), t(`${type}.relief2`), t(`${type}.relief3`)];

  return (
    <div className="grain-overlay min-h-screen bg-background">
      <MinimalNav />
      <div className="max-w-[680px] mx-auto px-8 py-24">
        {/* Hero */}
        <div ref={el => sectionsRef.current[0] = el} className="scroll-reveal text-center pb-16 border-b border-border mb-16">
          <div className="w-16 h-16 mx-auto mb-8 rounded-full border border-primary/30 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-primary" style={{ animation: 'pulse-expand 2s ease-in-out infinite' }} />
          </div>
          <h1 className="font-display text-foreground font-light mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            {t(`${type}.title`)}
          </h1>
          <p className="font-body text-muted-foreground text-lg italic">{t(`${type}.subtitle`)}</p>
        </div>

        {/* Pain */}
        <section ref={el => sectionsRef.current[1] = el} className="scroll-reveal mb-16 pb-16 border-b border-muted">
          <span className="font-mono text-xs tracking-[0.3em] text-eden-crimson mb-6 block">{t('result.thePain')}</span>
          {pain.map((p, i) => (
            <p key={i} className="font-body text-muted-foreground leading-relaxed mb-4">{p}</p>
          ))}
        </section>

        {/* Relief */}
        <section ref={el => sectionsRef.current[2] = el} className="scroll-reveal mb-16 pb-16 border-b border-muted">
          <span className="font-mono text-xs tracking-[0.3em] text-primary mb-6 block">{t('result.theRelief')}</span>
          {relief.map((p, i) => (
            <p key={i} className="font-body text-muted-foreground leading-relaxed mb-4">{p}</p>
          ))}
        </section>

        {/* Revelation */}
        <div ref={el => sectionsRef.current[3] = el} className="scroll-reveal revelation-box mb-16">
          <p className="font-display text-foreground text-center leading-relaxed" style={{ fontSize: '1.4rem' }}>
            {t(`${type}.revelation`)}
          </p>
        </div>

        {/* Form */}
        <section ref={el => sectionsRef.current[4] = el} className="scroll-reveal">
          <h3 className="font-display text-foreground text-2xl mb-8">{t(`${type}.formTitle`)}</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input className="eden-input" placeholder={t('result.firstName')} required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
              <input className="eden-input" placeholder={t('result.lastName')} required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <input className="eden-input mb-4" type="email" placeholder={t('result.email')} required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <textarea className="eden-input mb-4" rows={4} placeholder={t(`${type}.placeholder`)} value={form.vision} onChange={e => setForm({ ...form, vision: e.target.value })} />
            <button type="submit" className="eden-btn w-full" disabled={submitting}>
              {submitting ? t('result.submitting') : t('result.enterValley')}
            </button>
            <p className="font-mono text-xs text-eden-faint text-center mt-3 tracking-wide">{t('result.validation')}</p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ResultPage;
