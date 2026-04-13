import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import MinimalNav from '@/components/MinimalNav';
import CustomCursor from '@/components/CustomCursor';
import ParticleField from '@/components/ParticleField';
import { useScrollSound } from '@/hooks/useScrollSound';
import { Volume2, VolumeX } from 'lucide-react';

const FounderTest = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { playSound, isMuted, toggleMute } = useScrollSound();
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({ a: 0, b: 0 });
  const [analyzing, setAnalyzing] = useState(false);
  const [isTiebreaker, setIsTiebreaker] = useState(false);

  const shuffleMap = useMemo(() => Array.from({ length: 9 }, () => Math.random() > 0.5), []);

  const getQuestion = (index: number) => {
    if (index >= 8) return { q: t('tie.q'), a: t('tie.a'), b: t('tie.b') };
    const n = index + 1;
    return { q: t(`q${n}.q`), a: t(`q${n}.a`), b: t(`q${n}.b`) };
  };

  const showResult = (s: { a: number; b: number }) => {
    setAnalyzing(true);
    const resultType = s.a >= s.b ? 'thinker' : 'doer';
    // Store test result for ResultPage access control
    sessionStorage.setItem('eden-test-result', JSON.stringify({ type: resultType, scores: s }));
    sessionStorage.setItem('eden-test-completed', 'true');
    setTimeout(() => navigate(`/result/${resultType}`), 2500);
  };

  const answer = (choice: 'a' | 'b') => {
    playSound('click');
    const newScores = { ...scores, [choice]: scores[choice] + 1 };
    setScores(newScores);
    if (isTiebreaker) { showResult(newScores); return; }
    const next = current + 1;
    if (next < 8) setCurrent(next);
    else if (newScores.a === newScores.b) setIsTiebreaker(true);
    else showResult(newScores);
  };

  if (analyzing) {
    return (
      <div className="grain-overlay min-h-[100dvh] bg-background flex flex-col items-center justify-center gap-8 relative overflow-hidden">
        <CustomCursor />
        <ParticleField scrollVelocity={0.8} isScrolling={true} activeFrame={8} />
        <div className="w-[50px] md:w-[60px] h-[50px] md:h-[60px] rounded-full border border-primary" style={{ animation: 'pulse-expand 1.5s ease-in-out infinite' }} />
        <p className="font-body text-eden-dim text-xs md:text-sm tracking-[0.15em]">{t('test.analyzing')}</p>
      </div>
    );
  }

  const q = getQuestion(isTiebreaker ? 8 : current);
  const swapped = shuffleMap[isTiebreaker ? 8 : current];
  const progress = Math.min((current / 8) * 100, 100);
  const optionFirst = swapped ? { label: q.b, choice: 'b' as const } : { label: q.a, choice: 'a' as const };
  const optionSecond = swapped ? { label: q.a, choice: 'a' as const } : { label: q.b, choice: 'b' as const };

  return (
    <div className="grain-overlay min-h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      <CustomCursor />
      <MinimalNav />
      <button onClick={toggleMute} className="sound-toggle" aria-label={isMuted ? "Unmute" : "Mute"}>
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
      <ParticleField scrollVelocity={0.5} isScrolling={false} activeFrame={current} />

      <div className="h-[2px] bg-muted">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 max-w-[700px] mx-auto w-full" key={isTiebreaker ? 'tie' : current}>
        <span className="font-mono text-xs text-eden-dim tracking-[0.2em] mb-6 md:mb-8" style={{ animation: 'fadeIn 0.4s ease both' }}>
          {isTiebreaker ? t('test.tie') : `${current + 1} / 8`}
        </span>
        <h2 className="font-display text-foreground font-light text-center leading-snug mb-8 md:mb-12" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 2rem)', animation: 'reveal-text 0.8s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
          {q.q}
        </h2>
        <div className="flex flex-col gap-3 md:gap-4 w-full">
          <button className="q-card" onClick={() => answer(optionFirst.choice)} style={{ animation: 'reveal-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both' }}>{optionFirst.label}</button>
          <button className="q-card" onClick={() => answer(optionSecond.choice)} style={{ animation: 'reveal-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both' }}>{optionSecond.label}</button>
        </div>
      </div>
    </div>
  );
};

export default FounderTest;
