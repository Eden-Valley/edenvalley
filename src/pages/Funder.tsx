import { useState, FormEvent, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import MinimalNav from '@/components/MinimalNav';

const Funder = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    investorType: '', stage: '', sectors: '', ticketSize: '', annualCapital: '', dealsPerYear: '', email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    sectionsRef.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

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
          <span className={`w-3 h-3 rounded-full border transition-colors ${value === opt ? 'border-primary bg-primary' : 'border-muted-foreground'}`} />
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
        <div ref={el => sectionsRef.current[0] = el} className="scroll-reveal text-center pb-16 border-b border-border mb-16">
          <div className="w-16 h-16 mx-auto mb-8 rounded-full border border-primary/30 flex items-center justify-center">
            <div className="w-2 h-2 rotate-45 bg-primary" />
          </div>
          <h1 className="font-display text-foreground font-light mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)' }}>
            {t('funder.title')}
          </h1>
          <p className="font-body text-muted-foreground text-lg italic">{t('funder.subtitle')}</p>
        </div>

        {/* Pain */}
        <section ref={el => sectionsRef.current[1] = el} className="scroll-reveal mb-16 pb-16 border-b border-muted">
          <span className="font-mono text-xs tracking-[0.3em] text-eden-crimson mb-6 block">{t('funder.problem')}</span>
          <p className="font-body text-muted-foreground leading-relaxed mb-4">{t('funder.pain1')}</p>
          <p className="font-body text-muted-foreground leading-relaxed">{t('funder.pain2')}</p>
        </section>

        {/* Revelation */}
        <div ref={el => sectionsRef.current[2] = el} className="scroll-reveal revelation-box mb-16">
          <p className="font-display text-foreground text-center leading-relaxed" style={{ fontSize: '1.4rem' }}>
            {t('funder.revelation')}
          </p>
        </div>

        {/* Form */}
        <section ref={el => sectionsRef.current[3] = el} className="scroll-reveal">
          <h3 className="font-display text-foreground text-2xl mb-8">{t('funder.formTitle')}</h3>
          <form onSubmit={handleSubmit}>
            <label className="font-mono text-xs text-muted-foreground tracking-[0.15em] block mb-3">{t('funder.investorType')}</label>
            <RadioGroup name="investorType" options={['VC', 'Business Angel', 'Family Office', 'Corporate VC', 'Other']} value={form.investorType} />

            <label className="font-mono text-xs text-muted-foreground tracking-[0.15em] block mb-3">{t('funder.stage')}</label>
            <RadioGroup name="stage" options={['Pre-seed', 'Seed', 'Series A', 'Flexible']} value={form.stage} />

            <input className="eden-input mb-4" placeholder={t('funder.sectors')} value={form.sectors} onChange={e => setForm({ ...form, sectors: e.target.value })} />

            <label className="font-mono text-xs text-muted-foreground tracking-[0.15em] block mb-3">{t('funder.ticketSize')}</label>
            <RadioGroup name="ticketSize" options={['10k-50k', '50k-250k', '250k-1M', '1M+']} value={form.ticketSize} />

            <input className="eden-input mb-4" placeholder={t('funder.annualCapital')} value={form.annualCapital} onChange={e => setForm({ ...form, annualCapital: e.target.value })} />
            <input className="eden-input mb-4" placeholder={t('funder.deals')} value={form.dealsPerYear} onChange={e => setForm({ ...form, dealsPerYear: e.target.value })} />
            <input className="eden-input mb-4" type="email" placeholder={t('funder.proEmail')} required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

            <button type="submit" className="eden-btn w-full" disabled={submitting}>
              {submitting ? t('result.submitting') : t('funder.submit')}
            </button>
            <p className="font-mono text-xs text-eden-faint text-center mt-3 tracking-wide">{t('funder.note')}</p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Funder;
