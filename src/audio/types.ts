/**
 * Types pour l'architecture audio robuste
 * Définit les interfaces et types utilisés dans tout le système audio
 */

export type AudioCategory = 'music' | 'sfx' | 'voice';

export type SoundEvent = 
  | 'scroll' 
  | 'success' 
  | 'click' 
  | 'transition' 
  | 'error' 
  | 'ambient' 
  | 'power' 
  | 'choice' 
  | 'focus' 
  | 'type' 
  | 'submit';

export interface VoiceConfig {
  freq: number;
  type: OscillatorType;
  gain: number;
}

export interface MusicPhase {
  voices: VoiceConfig[];
  filterFreq: number;
  lfoRate: number;
  categoryGain: number;
}

export interface AudioNodeGroup {
  oscillators: OscillatorNode[];
  gains: GainNode[];
  filter?: BiquadFilterNode;
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
}

export interface VolumeSettings {
  master: number;
  music: number;
  sfx: number;
  voice: number;
  muted: boolean;
}

export interface AudioEngineState {
  isInitialized: boolean;
  isRunning: boolean;
  currentPhase: number;
  error: string | null;
}
