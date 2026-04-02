import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import MinimalNav from '@/components/MinimalNav';

const FounderTest = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({ a: 0, b: 0 });
  const [analyzing, setAnalyzing] = useState(false);
  const [isTiebreaker, setIsTiebreaker] = useState(false);

  // Randomize which option appears first for each question (stable per session)
  const shuffleMap = useMemo(() => {
    return Array.from({ length: 9 }, () => Math.random() > 0.5);
  }, []);

  const getQuestion = (index: number) => {
    if (index >= 8) {
      return { q: t('tie.q'), a: t('tie.a'), b: t('tie.b') };
    }
    const n = index + 1;
    return {
      q: t(`q${n}.q`),
      a: t(`q${n}.a`),
      b: t(`q${n}.b`),
    };
  };

  const showResult = (s: { a: number; b: number }) => {
    setAnalyzing(true);
    setTimeout(() => {
      navigate(s.a >= s.b ? '/result/thinker' : '/result/doer');
    }, 2500);
  };

  const answer = (choice: 'a' | 'b') => {
    const newScores = { ...scores, [choice]: scores[choice] + 1 };
    setScores(newScores);

    if (isTiebreaker) {
      showResult(newScores);
      return;
    }

    const next = current + 1;
    if (next < 8) {
      setCurrent(next);
    } else if (newScores.a === newScores.b) {
      setIsTiebreaker(true);
    } else {
      showResult(newScores);
    }
  };

  if (analyzing) {
    return (
      <div className="grain-overlay min-h-screen bg-background flex flex-col items-center justify-center gap-8">
        <div className="w-[60px] h-[60px] rounded-full border border-primary" style={{ animation: 'pulse-expand 1.5s ease-in-out infinite' }} />
        <p className="font-body text-eden-dim text-sm tracking-[0.15em]">{t('test.analyzing')}</p>
      </div>
    );
  }

  const q = getQuestion(isTiebreaker ? 8 : current);
  const swapped = shuffleMap[isTiebreaker ? 8 : current];
  const progress = Math.min((current / 8) * 100, 100);

  const optionFirst = swapped ? { label: q.b, choice: 'b' as const } : { label: q.a, choice: 'a' as const };
  const optionSecond = swapped ? { label: q.a, choice: 'a' as const } : { label: q.b, choice: 'b' as const };

  return (
    <div className="grain-overlay min-h-screen bg-background flex flex-col">
      <MinimalNav />
      <div className="h-[2px] bg-muted">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 max-w-[700px] mx-auto w-full" key={isTiebreaker ? 'tie' : current}>
        <span className="font-mono text-xs text-eden-dim tracking-[0.2em] mb-8 animate-fade-in">
          {isTiebreaker ? t('test.tie') : `${current + 1} / 8`}
        </span>
        <h2 className="font-display text-foreground font-light text-center leading-snug mb-12 reveal-text" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 2rem)' }}>
          {q.q}
        </h2>
        <div className="flex flex-col gap-4 w-full">
          <button className="q-card reveal-up" style={{ animationDelay: '0.2s' }} onClick={() => answer(optionFirst.choice)}>{optionFirst.label}</button>
          <button className="q-card reveal-up" style={{ animationDelay: '0.35s' }} onClick={() => answer(optionSecond.choice)}>{optionSecond.label}</button>
        </div>
      </div>
    </div>
  );
};

export default FounderTest;
