import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MinimalNav from '@/components/MinimalNav';

const questions = [
  { q: "When facing a brand new complex project, your immediate instinct is to:", a: "Isolate yourself to decode the problem at its root and design the architecture.", b: "Lay the first brick immediately and adjust as you go." },
  { q: "What drains your energy the fastest?", a: "Executing repetitive tasks once I've already solved the problem in my head.", b: "Endless theoretical discussions with no visible, measurable progress." },
  { q: "If a startup were a race car, you would instinctively be:", a: "The GPS. I map the circuit and the perfect trajectory.", b: "The Engine. I provide raw power and momentum." },
  { q: "In a crisis, facing a wall blocking the project, your default reaction is to:", a: "Step back to understand why the wall is there and rethink the entire system.", b: "Accelerate to go around or break through the obstacle." },
  { q: "At the end of the day, you feel powerful when:", a: "I finally connected the dots of a complex problem. Everything becomes crystal clear in my head.", b: "I produced visible results. The project moved forward concretely and measurably." },
  { q: "Your ideal relationship with the vision:", a: "Draw the map, lay the foundations, and hand it off so others handle daily execution.", b: "Take a brilliant map already drawn, assemble an army, and build the empire at massive scale." },
  { q: "When someone presents you with an incredible idea, your brain first asks:", a: "\"How does this fundamentally work? What are the hidden flaws?\"", b: "\"What's the very first physical action to test this in the real world today?\"" },
  { q: "The worst type of failure for you is realizing that:", a: "My fundamental understanding of the problem was wrong. I misread reality.", b: "I wasted months of relentless energy and action going in the wrong direction." },
];

const tiebreaker = {
  q: "Under extreme pressure, with everything collapsing around you, you instinctively become:",
  a: "More reflective and cautious. I must understand before acting.",
  b: "More active and decisive. I must move before thinking.",
};

const FounderTest = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState({ a: 0, b: 0 });
  const [analyzing, setAnalyzing] = useState(false);
  const [isTiebreaker, setIsTiebreaker] = useState(false);

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
    if (next < questions.length) {
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
        <p className="font-body text-eden-dim text-sm tracking-[0.15em]">Analyzing your deep nature...</p>
      </div>
    );
  }

  const q = isTiebreaker ? tiebreaker : questions[current];
  const progress = Math.min((current / 8) * 100, 100);

  return (
    <div className="grain-overlay min-h-screen bg-background flex flex-col">
      <MinimalNav />
      {/* Progress bar */}
      <div className="h-[2px] bg-muted">
        <div className="h-full bg-primary transition-all duration-400" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 max-w-[700px] mx-auto w-full fade-in" key={isTiebreaker ? 'tie' : current}>
        <span className="font-mono text-xs text-eden-dim tracking-[0.2em] mb-8">
          {isTiebreaker ? 'TIE' : `${current + 1} / 8`}
        </span>
        <h2 className="font-display text-foreground font-light text-center leading-snug mb-12" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 2rem)' }}>
          {q.q}
        </h2>
        <div className="flex flex-col gap-4 w-full">
          <button className="q-card" onClick={() => answer('a')}>{q.a}</button>
          <button className="q-card" onClick={() => answer('b')}>{q.b}</button>
        </div>
      </div>
    </div>
  );
};

export default FounderTest;
