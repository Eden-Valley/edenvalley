/**
 * Hook useAudio - Hook principal pour l'accès au système audio
 * 
 * Fournit une interface React-friendly pour l'AudioEngine
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { audioEngine } from '@/audio/AudioEngine';
import { musicGenerator } from '@/audio/MusicGenerator';
import { soundEffects } from '@/audio/SoundEffects';
import type { 
  AudioEngineState, 
  VolumeSettings, 
  SoundEvent 
} from '@/audio/types';

interface UseAudioReturn {
  // État
  isInitialized: boolean;
  isRunning: boolean;
  isMuted: boolean;
  hasStarted: boolean;
  currentPhase: number;
  audioError: string | null;
  volumeSettings: VolumeSettings;
  
  // Contrôles
  toggleMute: () => void;
  setMasterVolume: (value: number) => void;
  setCategoryVolume: (category: 'music' | 'sfx' | 'voice', value: number) => void;
  
  // Audio
  playSound: (type: SoundEvent, value?: number) => void;
  setMusicIntensity: (intensity: number) => void;
  playTransitionSound: (frameIndex: number) => void;
}

export const useAudio = (): UseAudioReturn => {
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

  const lastFrameRef = useRef<number>(-1);

  // S'abonner aux changements d'état
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

  // Vérifier si l'audio a déjà été démarré dans cette session
  const hasStarted = sessionStorage.getItem('eden-audio-started') === 'true' || state.isRunning;

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
    if (frameIndex === lastFrameRef.current) return;
    
    soundEffects.play('scroll', frameIndex);
    lastFrameRef.current = frameIndex;
  }, []);

  return {
    isInitialized: state.isInitialized,
    isRunning: state.isRunning,
    isMuted: volumeSettings.muted,
    hasStarted,
    currentPhase: state.currentPhase,
    audioError: state.error,
    volumeSettings,
    toggleMute,
    setMasterVolume,
    setCategoryVolume,
    playSound,
    setMusicIntensity,
    playTransitionSound,
  };
};
