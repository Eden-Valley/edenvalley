import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';

interface AudioContextType {
  isMuted: boolean;
  hasStarted: boolean;
  audioError: string | null;
  toggleMute: () => void;
  playSound: (type: SoundEvent, value?: number) => void;
  setMusicIntensity: (intensity: number) => void;
  playTransitionSound: (frameIndex: number) => void;
}

type SoundEvent = 'scroll' | 'success' | 'click' | 'transition' | 'error' | 'ambient' | 'power' | 'choice' | 'focus' | 'type' | 'submit';

// Music phases - evolving from contemplative to epic
const MUSIC_PHASES = [
  // Phase 1: Awakening (frames 0-3) - Pure, contemplative
  {
    voices: [
      { freq: 110, type: 'sine' as OscillatorType, gain: 0.008 },
      { freq: 164.81, type: 'sine' as OscillatorType, gain: 0.006 },
    ],
    filterFreq: 400,
    lfoRate: 0.05,
    masterGain: 0.15,
  },
  // Phase 2: Emergence (frames 4-6) - Harmonic structure
  {
    voices: [
      { freq: 110, type: 'sine' as OscillatorType, gain: 0.012 },
      { freq: 164.81, type: 'triangle' as OscillatorType, gain: 0.010 },
      { freq: 196, type: 'sine' as OscillatorType, gain: 0.008 },
      { freq: 220, type: 'triangle' as OscillatorType, gain: 0.007 },
    ],
    filterFreq: 600,
    lfoRate: 0.08,
    masterGain: 0.2,
  },
  // Phase 3: Revelation (frame 7) - Power harmony
  {
    voices: [
      { freq: 55, type: 'sine' as OscillatorType, gain: 0.020 }, // Sub bass
      { freq: 110, type: 'triangle' as OscillatorType, gain: 0.015 },
      { freq: 164.81, type: 'sine' as OscillatorType, gain: 0.012 },
      { freq: 196, type: 'triangle' as OscillatorType, gain: 0.010 },
      { freq: 220, type: 'sine' as OscillatorType, gain: 0.008 },
    ],
    filterFreq: 800,
    lfoRate: 0.12,
    masterGain: 0.25,
  },
  // Phase 4: Confrontation (frames 8-10) - Dramatic tension
  {
    voices: [
      { freq: 55, type: 'triangle' as OscillatorType, gain: 0.025 },
      { freq: 82.41, type: 'sine' as OscillatorType, gain: 0.018 },
      { freq: 110, type: 'sawtooth' as OscillatorType, gain: 0.015 },
      { freq: 164.81, type: 'triangle' as OscillatorType, gain: 0.012 },
      { freq: 196, type: 'sine' as OscillatorType, gain: 0.010 },
      { freq: 220, type: 'triangle' as OscillatorType, gain: 0.008 },
    ],
    filterFreq: 1200,
    lfoRate: 0.18,
    masterGain: 0.30,
  },
  // Phase 5: Transcendence (frames 11-13) - Epic, transcendent
  {
    voices: [
      { freq: 55, type: 'sawtooth' as OscillatorType, gain: 0.030 },
      { freq: 82.41, type: 'triangle' as OscillatorType, gain: 0.022 },
      { freq: 110, type: 'sawtooth' as OscillatorType, gain: 0.018 },
      { freq: 164.81, type: 'triangle' as OscillatorType, gain: 0.015 },
      { freq: 196, type: 'sine' as OscillatorType, gain: 0.012 },
      { freq: 246.94, type: 'triangle' as OscillatorType, gain: 0.010 },
    ],
    filterFreq: 2000,
    lfoRate: 0.25,
    masterGain: 0.35,
  },
];

const AudioContext = createContext<AudioContextType | null>(null);

// Richer ambient chord: Am9 voicing with harmonics
const AMBIENT_VOICES = [
  { freq: 55, type: 'sine' as OscillatorType, gain: 0.025 },
  { freq: 82.41, type: 'sine' as OscillatorType, gain: 0.018 },
  { freq: 110, type: 'triangle' as OscillatorType, gain: 0.015 },
  { freq: 164.81, type: 'sine' as OscillatorType, gain: 0.012 },
  { freq: 196, type: 'triangle' as OscillatorType, gain: 0.01 },
  { freq: 246.94, type: 'sine' as OscillatorType, gain: 0.008 },
];

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('eden-muted') === 'true');
  const [hasStarted, setHasStarted] = useState(() => sessionStorage.getItem('eden-audio-started') === 'true');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState(0);
  const lastFrameRef = useRef<number>(0);
  const interactionTriggeredRef = useRef(false);
  
  const masterGainRef = useRef<GainNode | null>(null);
  const masterFilterRef = useRef<BiquadFilterNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const voiceGainsRef = useRef<GainNode[]>([]);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);

  // Transition to a new music phase
  const transitionToPhase = useCallback((phaseIndex: number, ctx: AudioContext) => {
    if (phaseIndex === currentPhase || phaseIndex < 0 || phaseIndex >= MUSIC_PHASES.length) return;
    
    const phase = MUSIC_PHASES[phaseIndex];
    const now = ctx.currentTime;
    const transitionDuration = 4; // 4 seconds crossfade
    
    console.log(`[Audio] Transitioning to phase ${phaseIndex + 1}: ${phase.voices.length} voices`);
    
    // Fade out current voices
    voiceGainsRef.current.forEach(gain => {
      gain.gain.setTargetAtTime(0, now, transitionDuration / 3);
    });
    
    // Stop old oscillators after fade
    setTimeout(() => {
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch {}
      });
      oscillatorsRef.current = [];
      voiceGainsRef.current = [];
    }, transitionDuration * 1000);
    
    // Create master filter
    if (!masterFilterRef.current) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.connect(ctx.destination);
      masterFilterRef.current = filter;
    }
    
    // Create new voices
    phase.voices.forEach((voice, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = voice.type;
      osc.frequency.setValueAtTime(voice.freq, now);
      
      // Slight detune for richness
      osc.detune.setValueAtTime((Math.random() - 0.5) * 6, now);
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(voice.gain, now + transitionDuration + (i * 0.5));
      
      osc.connect(gain);
      gain.connect(masterFilterRef.current!);
      
      osc.start(now);
      oscillatorsRef.current.push(osc);
      voiceGainsRef.current.push(gain);
    });
    
    // Smooth filter transition
    masterFilterRef.current.frequency.setTargetAtTime(phase.filterFreq, now, transitionDuration);
    masterFilterRef.current.Q.setValueAtTime(0.8, now);
    
    // Update LFO rate
    if (lfoRef.current) {
      lfoRef.current.frequency.setTargetAtTime(phase.lfoRate, now, transitionDuration);
    }
    
    setCurrentPhase(phaseIndex);
  }, [currentPhase]);

  // Start procedural ambient audio with evolving phases
  const startProceduralAudio = useCallback((ctx: AudioContext) => {
    // Guard: prevent duplicate initialization using ref only (avoid stale closure)
    if (oscillatorsRef.current.length > 0) {
      console.log('[Audio] Already started, skipping duplicate initialization');
      return;
    }
    
    try {
      console.log('[Audio] Starting Eden Valley evolving music system');
      
      const now = ctx.currentTime;
      const phase = MUSIC_PHASES[0]; // Start with Phase 1
      
      // Create master filter
      const masterFilter = ctx.createBiquadFilter();
      masterFilter.type = 'lowpass';
      masterFilter.frequency.setValueAtTime(phase.filterFreq, now);
      masterFilter.Q.setValueAtTime(0.8, now);
      masterFilter.connect(ctx.destination);
      masterFilterRef.current = masterFilter;
      
      // Create initial voices
      phase.voices.forEach((voice, i) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = voice.type;
          osc.frequency.setValueAtTime(voice.freq, now);
          osc.detune.setValueAtTime((Math.random() - 0.5) * 6, now);
          
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(voice.gain, now + 3 + (i * 0.3));
          
          osc.connect(gain);
          gain.connect(masterFilter);
          
          osc.start(now);
          oscillatorsRef.current.push(osc);
          voiceGainsRef.current.push(gain);
        } catch (voiceErr) {
          console.error(`[Audio] Failed to create voice ${i}:`, voiceErr);
        }
      });
      
      // Create LFO for movement
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(phase.lfoRate, now);
      lfoGain.gain.setValueAtTime(10, now);
      lfo.connect(lfoGain);
      lfoGain.connect(masterFilter.frequency);
      lfo.start(now);
      lfoRef.current = lfo;
      lfoGainRef.current = lfoGain;
      
      // Create master gain for global volume control
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;
      
      // Connect filter to master gain (in series for volume control)
      masterFilter.disconnect();
      masterFilter.connect(masterGain);
      masterGain.connect(ctx.destination);
      
      // Fade in
      const isMutedState = localStorage.getItem('eden-muted') === 'true';
      masterGain.gain.linearRampToValueAtTime(isMutedState ? 0 : phase.masterGain, now + 4);
      
      console.log('🎵 Eden Valley music started - Phase 1: Awakening');
      setHasStarted(true);
      setAudioError(null);
      setCurrentPhase(0);
    } catch (err) {
      console.error('[Audio] Critical error starting music:', err);
      setAudioError('Failed to initialize music system');
      // Cleanup on error
      oscillatorsRef.current.forEach(osc => { try { osc.stop(); } catch {} });
      oscillatorsRef.current = [];
      voiceGainsRef.current = [];
    }
  }, []);

  useEffect(() => {
    console.log('[Audio] Initializing Eden Valley audio system...');
    
    // Check Web Audio API support
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('[Audio] Web Audio API not supported');
      setAudioError('Audio not supported in this browser');
      return;
    }
    
    // Create AudioContext
    try {
      audioContextRef.current = new AudioContextClass();
      console.log('[Audio] AudioContext created, state:', audioContextRef.current.state);
    } catch (err) {
      console.error('[Audio] Failed to create AudioContext:', err);
      setAudioError('Could not initialize audio');
      return;
    }
    
    // AGGRESSIVE FIRST INTERACTION DETECTION
    // CRITICAL: Only 'click', 'touchstart', 'keydown', 'mousedown' can resume AudioContext
    // 'wheel' and 'scroll' are NOT valid user gestures for AudioContext.resume()
    const primaryEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
    const secondaryEvents = ['wheel', 'scroll'];
    
    // PRIMARY handler: can resume AudioContext (valid user gesture)
    const startAudioOnPrimaryGesture = async (e: Event) => {
      if (interactionTriggeredRef.current) return;
      
      console.log('[Audio] Primary gesture detected:', e.type);
      
      const ctx = audioContextRef.current;
      if (!ctx) return;
      
      try {
        // Resume AudioContext - this only works with valid user gestures
        if (ctx.state === 'suspended') {
          await ctx.resume();
          console.log('[Audio] AudioContext resumed, state:', ctx.state);
        }
        
        // Start audio if context is running
        if (ctx.state === 'running') {
          startProceduralAudio(ctx);
          interactionTriggeredRef.current = true;
          
          // Remove all listeners after successful start
          [...primaryEvents, ...secondaryEvents].forEach(event => {
            document.removeEventListener(event, startAudioOnPrimaryGesture, { capture: true });
            document.removeEventListener(event, startAudioOnSecondary, { capture: true });
          });
        }
      } catch (err) {
        console.error('[Audio] Failed to start on primary gesture:', err);
        // Don't reset flag - let user try again with another gesture
      }
    };
    
    // SECONDARY handler: wheel/scroll - cannot resume, only start if already running
    const startAudioOnSecondary = (e: Event) => {
      if (interactionTriggeredRef.current) return;
      
      const ctx = audioContextRef.current;
      if (!ctx) return;
      
      // Only proceed if AudioContext is already running
      // (resumed by a primary gesture like click)
      if (ctx.state !== 'running') {
        console.log('[Audio] Secondary gesture ignored - AudioContext not running');
        return;
      }
      
      console.log('[Audio] Secondary gesture starting audio:', e.type);
      startProceduralAudio(ctx);
      interactionTriggeredRef.current = true;
      
      // Remove all listeners
      [...primaryEvents, ...secondaryEvents].forEach(event => {
        document.removeEventListener(event, startAudioOnPrimaryGesture, { capture: true });
        document.removeEventListener(event, startAudioOnSecondary, { capture: true });
      });
    };
    
    // Attach primary events (valid for AudioContext resume)
    primaryEvents.forEach(event => {
      document.addEventListener(event, startAudioOnPrimaryGesture, { capture: true });
    });
    
    // Attach secondary events (wheel/scroll) - passive, cannot resume
    secondaryEvents.forEach(event => {
      document.addEventListener(event, startAudioOnSecondary, { passive: true, capture: true });
    });
    
    return () => {
      console.log('[Audio] Cleaning up audio system...');
      [...primaryEvents, ...secondaryEvents].forEach(event => {
        document.removeEventListener(event, startAudioOnPrimaryGesture, { capture: true });
        document.removeEventListener(event, startAudioOnSecondary, { capture: true });
      });
      
      // Stop all oscillators
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch {}
      });
      oscillatorsRef.current = [];
      
      if (lfoRef.current) {
        try { lfoRef.current.stop(); } catch {}
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
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
      
      // Immediate gain change
      if (masterGainRef.current && audioContextRef.current) {
        const now = audioContextRef.current.currentTime;
        if (newMuted) {
          masterGainRef.current.gain.setTargetAtTime(0, now, 0.1);
        } else {
          masterGainRef.current.gain.setTargetAtTime(0.2, now, 0.5);
        }
      }
      
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
        osc.frequency.setValueAtTime(392, t);
        osc.frequency.exponentialRampToValueAtTime(784, t + 0.15);
        osc.type = 'triangle';
        gain.gain.linearRampToValueAtTime(0.04, t + 0.05);
        gain.gain.linearRampToValueAtTime(0, t + 0.6);
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.frequency.setValueAtTime(523, t);
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
        osc.frequency.setValueAtTime(293.66, t);
        osc.frequency.exponentialRampToValueAtTime(587.33, t + 0.25);
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
        osc.frequency.setValueAtTime(523, t);
        osc.frequency.exponentialRampToValueAtTime(1047, t + 0.15);
        osc.frequency.exponentialRampToValueAtTime(1568, t + 0.3);
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
    
    // Map intensity (0-1) to phase (0-4)
    const targetPhase = Math.min(Math.floor(intensity * 5), 4);
    
    // Transition if phase changed
    if (targetPhase !== currentPhase) {
      transitionToPhase(targetPhase, audioContextRef.current);
    }
    
    // Also adjust master gain based on intensity
    const targetGain = 0.1 + (intensity * 0.25);
    masterGainRef.current.gain.setTargetAtTime(targetGain, audioContextRef.current.currentTime, 0.8);
  }, [isMuted, currentPhase, transitionToPhase]);

  return (
    <AudioContext.Provider value={{ 
      isMuted, 
      hasStarted, 
      audioError, 
      toggleMute, 
      playSound, 
      setMusicIntensity,
      playTransitionSound 
    }}>
      {children}
    </AudioContext.Provider>
  );
};

export const useGlobalAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useGlobalAudio must be used within an AudioProvider');
  }
  return context;
};
