/**
 * Index du système audio - Point d'entrée unique pour tous les modules audio
 * 
 * Exporte tous les composants, hooks, et utilitaires audio
 */

// Core audio engine
export { AudioEngine, audioEngine } from './AudioEngine';
export { MusicGenerator, musicGenerator } from './MusicGenerator';
export { SoundEffects, soundEffects } from './SoundEffects';
export { NatureSounds, natureSounds } from './NatureSounds';

// Types
export type {
  AudioCategory,
  SoundEvent,
  VoiceConfig,
  MusicPhase,
  AudioNodeGroup,
  VolumeSettings,
  AudioEngineState,
} from './types';

// Constants
export {
  CATEGORY_GAINS,
  MASTER_GAIN_DEFAULT,
  MASTER_GAIN_MIN,
  MASTER_GAIN_MAX,
  MUSIC_PHASES,
  CROSSFADE_DURATION,
  FADE_IN_DURATION,
  LFO_GAIN_AMOUNT,
  SOUND_EFFECTS,
  VOLUME_PRESETS,
  STORAGE_KEY_VOLUME,
  STORAGE_KEY_AUDIO_STARTED,
} from './constants';
