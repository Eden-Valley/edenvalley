/**
 * AudioContext.tsx - Provider React pour le système audio
 * 
 * Gère l'initialisation automatique et la détection des interactions utilisateur
 * pour démarrer l'audio selon les politiques des navigateurs.
 */

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useCallback,
  ReactNode 
} from 'react';
import { audioEngine } from '@/audio/AudioEngine';
import { musicGenerator } from '@/audio/MusicGenerator';
import { soundEffects } from '@/audio/SoundEffects';
import { natureSounds } from '@/audio/NatureSounds';
import type { AudioEngineState, VolumeSettings, SoundEvent } from '@/audio/types';

interface AudioContextType {
  isMuted: boolean;
  hasStarted: boolean;
  isRunning: boolean;
  audioError: string | null;
  currentPhase: number;
  volumeSettings: VolumeSettings;
  toggleMute: () => void;
  setMasterVolume: (value: number) => void;
  setCategoryVolume: (category: 'music' | 'sfx' | 'voice', value: number) => void;
  playSound: (type: SoundEvent, value?: number) => void;
  setMusicIntensity: (intensity: number) => void;
  playTransitionSound: (frameIndex: number) => void;
}

const AudioContextReact = createContext<AudioContextType | null>(null);

// Événements valides pour resume AudioContext (selon spéc navigateurs)
// NOTE: wheel/scroll/touchmove peuvent détecter l'intention mais ne peuvent pas resume AudioContext directement
// Ils servent de fallback si l'utilisateur scrolle avant de cliquer
const VALID_INTERACTION_EVENTS = ['click', 'touchstart', 'keydown', 'mousedown', 'wheel', 'scroll'] as const;

export const AudioProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AudioEngineState>({
    isInitialized: false,
    isRunning: false,
    currentPhase: 0,
    error: null,
  });
  
  const [volumeSettings, setVolumeSettings] = useState<VolumeSettings>({
    master: 0.6,
    music: 0.8,
    sfx: 0.6,
    voice: 1.0,
    muted: false,
  });

  const [lastFrame, setLastFrame] = useState<number>(-1);

  // S'abonner aux changements de l'AudioEngine
  useEffect(() => {
    audioEngine.setOnStateChange((newState) => {
      setState(newState);
    });

    audioEngine.setOnVolumeChange((newSettings) => {
      setVolumeSettings(newSettings);
    });

    // Charger l'état initial
    setState(audioEngine.getState());
    setVolumeSettings(audioEngine.getVolumeSettings());

    return () => {
      audioEngine.setOnStateChange(null);
      audioEngine.setOnVolumeChange(null);
    };
  }, []);

  // Initialisation de l'AudioEngine
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const success = await audioEngine.initialize();
      
      if (!isMounted) return;

      if (!success) {
        return;
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Détection des interactions utilisateur pour démarrer l'audio
  useEffect(() => {
    // Ne pas attacher les listeners si déjà démarré ou pas encore initialisé
    if (!state.isInitialized || state.isRunning) {
      return;
    }

    let interactionTriggered = false;

    const startAudioOnInteraction = async (e: Event) => {
      if (interactionTriggered) return;
      
      const success = await audioEngine.start();
      
      if (success) {
        interactionTriggered = true;
        
        // Démarrer la musique après un court délai pour le fade in
        setTimeout(() => {
          musicGenerator.start();
          // Activer les sons naturels subtils en arrière-plan
          natureSounds.enable();
        }, 500);

        // Retirer tous les listeners
        VALID_INTERACTION_EVENTS.forEach(event => {
          document.removeEventListener(event, startAudioOnInteraction, { capture: true });
        });
      }
    };

    // Attacher les listeners
    VALID_INTERACTION_EVENTS.forEach(event => {
      document.addEventListener(event, startAudioOnInteraction, { capture: true });
    });

    // Nettoyage
    return () => {
      VALID_INTERACTION_EVENTS.forEach(event => {
        document.removeEventListener(event, startAudioOnInteraction, { capture: true });
      });
    };
  }, [state.isInitialized, state.isRunning]);

  // Cleanup global
  useEffect(() => {
    return () => {
      audioEngine.dispose();
    };
  }, []);

  // Actions
  const toggleMute = useCallback(() => {
    audioEngine.toggleMuted();
  }, []);

  const setMasterVolume = useCallback((value: number) => {
    audioEngine.setMasterVolume(value);
  }, []);

  const setCategoryVolume = useCallback((category: 'music' | 'sfx' | 'voice', value: number) => {
    audioEngine.setCategoryVolume(category, value);
  }, []);

  const playSound = useCallback((type: SoundEvent, value?: number) => {
    soundEffects.play(type, value);
  }, []);

  const setMusicIntensity = useCallback((intensity: number) => {
    musicGenerator.setIntensity(intensity);
  }, []);

  const playTransitionSound = useCallback((frameIndex: number) => {
    if (frameIndex === lastFrame) return;
    soundEffects.play('scroll', frameIndex);
    setLastFrame(frameIndex);
  }, [lastFrame]);

  // Déterminer si l'audio a déjà été démarré (sessionStorage persiste pendant la session)
  const hasStarted = sessionStorage.getItem('eden-audio-started') === 'true' || state.isRunning;

  const value: AudioContextType = {
    isMuted: volumeSettings.muted,
    hasStarted,
    isRunning: state.isRunning,
    audioError: state.error,
    currentPhase: state.currentPhase,
    volumeSettings,
    toggleMute,
    setMasterVolume,
    setCategoryVolume,
    playSound,
    setMusicIntensity,
    playTransitionSound,
  };

  return (
    <AudioContextReact.Provider value={value}>
      {children}
    </AudioContextReact.Provider>
  );
};

export const useGlobalAudio = () => {
  const context = useContext(AudioContextReact);
  if (!context) {
    throw new Error('useGlobalAudio must be used within an AudioProvider');
  }
  return context;
};
