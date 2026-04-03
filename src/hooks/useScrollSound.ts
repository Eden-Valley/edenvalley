import { useEffect, useRef, useCallback, useState } from 'react';

type SoundEvent = 'scroll' | 'success' | 'click' | 'transition' | 'error' | 'ambient' | 'power' | 'choice' | 'focus' | 'type' | 'submit';

// Richer ambient chord: Am9 voicing with harmonics
const AMBIENT_VOICES = [
  { freq: 55, type: 'sine' as OscillatorType, gain: 0.025 },      // A1 — deep foundation
  { freq: 82.41, type: 'sine' as OscillatorType, gain: 0.018 },   // E2
  { freq: 110, type: 'triangle' as OscillatorType, gain: 0.015 },  // A2
  { freq: 164.81, type: 'sine' as OscillatorType, gain: 0.012 },   // E3
  { freq: 196, type: 'triangle' as OscillatorType, gain: 0.01 },   // G3
  { freq: 246.94, type: 'sine' as OscillatorType, gain: 0.008 },   // B3 — adds 9th
];

export const useScrollSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('eden-muted') === 'true');
  const [hasStarted, setHasStarted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const lastFrameRef = useRef<number>(0);
  const interactionTriggeredRef = useRef(false);
  
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const subBassRef = useRef<OscillatorNode | null>(null);

  const startProceduralAudio = (ctx: AudioContext) => {
    if (hasStarted || oscillatorsRef.current.length > 0) return;
    
    // Master chain: voices → filter → reverb-sim → master gain → destination
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    
    // Master low-pass for warmth
    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(800, ctx.currentTime);
    masterFilter.Q.setValueAtTime(0.7, ctx.currentTime);
    
    // Convolution-free reverb simulation with delays
    const delayL = ctx.createDelay(1);
    const delayR = ctx.createDelay(1);
    delayL.delayTime.setValueAtTime(0.037, ctx.currentTime);
    delayR.delayTime.setValueAtTime(0.053, ctx.currentTime);
    const feedbackL = ctx.createGain();
    const feedbackR = ctx.createGain();
    feedbackL.gain.setValueAtTime(0.3, ctx.currentTime);
    feedbackR.gain.setValueAtTime(0.25, ctx.currentTime);
    const wetGain = ctx.createGain();
    wetGain.gain.setValueAtTime(0.15, ctx.currentTime);
    
    // Connect reverb
    masterFilter.connect(delayL);
    delayL.connect(feedbackL);
    feedbackL.connect(delayR);
    delayR.connect(feedbackR);
    feedbackR.connect(delayL);
    delayL.connect(wetGain);
    delayR.connect(wetGain);
    wetGain.connect(masterGain);
    masterFilter.connect(masterGain); // dry signal
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;
    
    // Create ambient voices
    AMBIENT_VOICES.forEach((voice, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = voice.type;
      osc.frequency.setValueAtTime(voice.freq, ctx.currentTime);
      
      // Gentle detune for richness
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, ctx.currentTime);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400 + (i * 150), ctx.currentTime);
      filter.Q.setValueAtTime(0.5, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(voice.gain, ctx.currentTime + 3 + (i * 0.5));
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterFilter);
      
      osc.start(ctx.currentTime);
      oscillatorsRef.current.push(osc);
    });
    
    // Sub-bass pulse — very deep, slow oscillation
    const subBass = ctx.createOscillator();
    const subGain = ctx.createGain();
    subBass.type = 'sine';
    subBass.frequency.setValueAtTime(36.71, ctx.currentTime); // D1
    subGain.gain.setValueAtTime(0, ctx.currentTime);
    subGain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 5);
    subBass.connect(subGain);
    subGain.connect(masterFilter);
    subBass.start(ctx.currentTime);
    subBassRef.current = subBass;
    oscillatorsRef.current.push(subBass);
    
    // LFO for organic movement
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.06, ctx.currentTime);
    lfoGain.gain.setValueAtTime(8, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);
    lfo.start(ctx.currentTime);
    lfoRef.current = lfo;
    
    // Secondary LFO on filter for evolving texture
    const lfo2 = ctx.createOscillator();
    const lfo2Gain = ctx.createGain();
    lfo2.type = 'sine';
    lfo2.frequency.setValueAtTime(0.03, ctx.currentTime);
    lfo2Gain.gain.setValueAtTime(200, ctx.currentTime);
    lfo2.connect(lfo2Gain);
    lfo2Gain.connect(masterFilter.frequency);
    lfo2.start(ctx.currentTime);
    oscillatorsRef.current.push(lfo2);
    
    // Fade in
    masterGain.gain.linearRampToValueAtTime(isMuted ? 0 : 0.25, ctx.currentTime + 4);
    
    setHasStarted(true);
    setAudioError(null);
  };

  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) { setAudioError('Audio not supported'); return; }
    
    try { audioContextRef.current = new AudioContextClass(); }
    catch { setAudioError('Could not initialize audio'); return; }
    
    const primaryEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
    const secondaryEvents = ['wheel', 'scroll'];
    
    const startAudioOnInteraction = async (e: Event) => {
      if (interactionTriggeredRef.current) return;
      interactionTriggeredRef.current = true;
      
      const ctx = audioContextRef.current;
      if (!ctx) return;
      
      if (ctx.state === 'suspended') {
        try { await ctx.resume(); }
        catch { setAudioError('Could not start audio.'); interactionTriggeredRef.current = false; return; }
      }
      
      if (ctx.state === 'running') startProceduralAudio(ctx);
      
      [...primaryEvents, ...secondaryEvents].forEach(event => {
        document.removeEventListener(event, startAudioOnInteraction, { capture: true });
      });
    };
    
    primaryEvents.forEach(event => document.addEventListener(event, startAudioOnInteraction, { capture: true }));
    secondaryEvents.forEach(event => document.addEventListener(event, startAudioOnInteraction, { passive: false, capture: true } as any));
    
    return () => {
      [...primaryEvents, ...secondaryEvents].forEach(event => document.removeEventListener(event, startAudioOnInteraction, { capture: true }));
      oscillatorsRef.current.forEach(osc => { try { osc.stop(); } catch {} });
      oscillatorsRef.current = [];
      if (lfoRef.current) { try { lfoRef.current.stop(); } catch {} }
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Handle mute changes
  useEffect(() => {
    if (!masterGainRef.current || !audioContextRef.current) return;
    const now = audioContextRef.current.currentTime;
    masterGainRef.current.gain.setTargetAtTime(isMuted ? 0 : 0.25, now, 0.3);
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      localStorage.setItem('eden-muted', newMuted.toString());
      return newMuted;
    });
  }, []);

  const playSound = useCallback((type: SoundEvent, value: number = 0) => {
    if (isMuted) return;
    const ctx = audioContextRef.current;
    if (!ctx || ctx.state !== 'running') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    const t = ctx.currentTime;

    switch (type) {
      case 'scroll':
        osc.frequency.setValueAtTime(130 + (value * 15), t);
        osc.type = 'sine';
        gain.gain.linearRampToValueAtTime(0.012, t + 0.05);
        gain.gain.linearRampToValueAtTime(0, t + 0.35);
        break;
      case 'success': {
        osc.frequency.setValueAtTime(392, t); // G4
        osc.frequency.exponentialRampToValueAtTime(784, t + 0.15); // G5
        osc.type = 'triangle';
        gain.gain.linearRampToValueAtTime(0.04, t + 0.05);
        gain.gain.linearRampToValueAtTime(0, t + 0.6);
        // Second harmonic
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.frequency.setValueAtTime(523, t); // C5
        osc2.frequency.exponentialRampToValueAtTime(1047, t + 0.2);
        osc2.type = 'sine';
        g2.gain.linearRampToValueAtTime(0.02, t + 0.08);
        g2.gain.linearRampToValueAtTime(0, t + 0.5);
        osc2.connect(g2); g2.connect(ctx.destination);
        osc2.start(t + 0.1); osc2.stop(t + 1);
        break;
      }
      case 'transition':
        osc.frequency.setValueAtTime(196, t);
        osc.frequency.linearRampToValueAtTime(98, t + 0.6);
        osc.type = 'sine';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.linearRampToValueAtTime(300, t + 0.6);
        gain.gain.linearRampToValueAtTime(0.025, t + 0.1);
        gain.gain.linearRampToValueAtTime(0, t + 0.9);
        break;
      case 'click':
        osc.frequency.setValueAtTime(700, t);
        osc.frequency.exponentialRampToValueAtTime(500, t + 0.05);
        osc.type = 'sine';
        gain.gain.linearRampToValueAtTime(0.008, t + 0.005);
        gain.gain.linearRampToValueAtTime(0, t + 0.08);
        break;
      case 'power':
        osc.frequency.setValueAtTime(55, t);
        osc.frequency.exponentialRampToValueAtTime(220, t + 0.8);
        osc.type = 'sawtooth';
        filter.frequency.setValueAtTime(200, t);
        filter.frequency.linearRampToValueAtTime(1200, t + 0.8);
        gain.gain.linearRampToValueAtTime(0.035, t + 0.15);
        gain.gain.linearRampToValueAtTime(0, t + 1.5);
        break;
      case 'choice':
        osc.frequency.setValueAtTime(293.66, t); // D4
        osc.frequency.exponentialRampToValueAtTime(587.33, t + 0.25); // D5
        osc.type = 'sine';
        gain.gain.linearRampToValueAtTime(0.025, t + 0.05);
        gain.gain.linearRampToValueAtTime(0, t + 0.5);
        break;
      case 'focus':
        osc.frequency.setValueAtTime(392, t);
        osc.frequency.exponentialRampToValueAtTime(784, t + 0.12);
        osc.type = 'sine';
        gain.gain.linearRampToValueAtTime(0.015, t + 0.02);
        gain.gain.linearRampToValueAtTime(0, t + 0.25);
        break;
      case 'type':
        osc.frequency.setValueAtTime(500 + Math.random() * 300, t);
        osc.type = 'sine';
        gain.gain.linearRampToValueAtTime(0.006, t + 0.003);
        gain.gain.linearRampToValueAtTime(0, t + 0.04);
        break;
      case 'submit':
        osc.frequency.setValueAtTime(523, t); // C5
        osc.frequency.exponentialRampToValueAtTime(1047, t + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1568, t + 0.3); // G6
        osc.type = 'triangle';
        gain.gain.linearRampToValueAtTime(0.05, t + 0.05);
        gain.gain.linearRampToValueAtTime(0, t + 0.8);
        break;
    }

    osc.start(t);
    osc.stop(t + 2);
  }, [isMuted]);

  const playTransitionSound = useCallback((frameIndex: number) => {
    if (frameIndex === lastFrameRef.current) return;
    playSound('scroll', frameIndex);
    lastFrameRef.current = frameIndex;
  }, [playSound]);

  const setMusicIntensity = useCallback((intensity: number) => {
    if (!masterGainRef.current || !audioContextRef.current || isMuted) return;
    const targetGain = 0.1 + (intensity * 0.2);
    masterGainRef.current.gain.setTargetAtTime(targetGain, audioContextRef.current.currentTime, 0.8);
  }, [isMuted]);

  return { playTransitionSound, playSound, setMusicIntensity, isMuted, toggleMute, hasStarted, audioError };
};
