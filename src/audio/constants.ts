/**
 * Constantes audio avec gains corrigés
 * 
 * PRINCIPE: Éviter la multiplication cumulative des gains
 * Formule: gain_effectif = voice_gain × category_gain × master_gain
 * 
 * Exemple problématique (ancien système):
 *   0.008 (voice) × 0.15 (phase) × 0.25 (master) = 0.0003 (-70dB, inaudible)
 * 
 * Nouveau système corrigé:
 *   0.5 (voice) × 0.8 (music category) × 0.6 (master) = 0.24 (-12dB, audible)
 */

import type { MusicPhase } from './types';

// Gains de catégorie - valeurs dans [0.3, 0.9] pour éviter l'inaudible
export const CATEGORY_GAINS = {
  music: 0.8,   // Musique de fond - audible mais pas dominante
  sfx: 0.6,     // Effets sonores - perceptibles
  voice: 1.0,   // Voix/narration - priorité maximale
} as const;

// Gain master par défaut
export const MASTER_GAIN_DEFAULT = 0.6;
export const MASTER_GAIN_MIN = 0.3;  // Au-dessous: inaudible
export const MASTER_GAIN_MAX = 0.8;  // Au-dessus: désagréable

// Phases musicales avec gains normaux pour musique de fond audible
export const MUSIC_PHASES: MusicPhase[] = [
  // Phase 0: Awakening - Pure, contemplative
  {
    voices: [
      { freq: 110, type: 'sine', gain: 0.12 },
      { freq: 164.81, type: 'sine', gain: 0.10 },
    ],
    filterFreq: 400,
    lfoRate: 0.05,
    categoryGain: 0.65,
  },
  // Phase 1: Emergence - Harmonic structure
  {
    voices: [
      { freq: 110, type: 'sine', gain: 0.14 },
      { freq: 164.81, type: 'triangle', gain: 0.12 },
      { freq: 196, type: 'sine', gain: 0.10 },
      { freq: 220, type: 'triangle', gain: 0.09 },
    ],
    filterFreq: 600,
    lfoRate: 0.08,
    categoryGain: 0.70,
  },
  // Phase 2: Revelation - Power harmony
  {
    voices: [
      { freq: 55, type: 'sine', gain: 0.16 },
      { freq: 110, type: 'triangle', gain: 0.14 },
      { freq: 164.81, type: 'sine', gain: 0.12 },
      { freq: 196, type: 'triangle', gain: 0.10 },
      { freq: 220, type: 'sine', gain: 0.09 },
    ],
    filterFreq: 800,
    lfoRate: 0.12,
    categoryGain: 0.75,
  },
  // Phase 3: Confrontation - Dramatic tension
  {
    voices: [
      { freq: 55, type: 'triangle', gain: 0.18 },
      { freq: 82.41, type: 'sine', gain: 0.15 },
      { freq: 110, type: 'sawtooth', gain: 0.12 },
      { freq: 164.81, type: 'triangle', gain: 0.10 },
      { freq: 196, type: 'sine', gain: 0.09 },
      { freq: 220, type: 'triangle', gain: 0.08 },
    ],
    filterFreq: 1100,
    lfoRate: 0.15,
    categoryGain: 0.70,
  },
  // Phase 4: Transcendence - Epic, transcendent
  {
    voices: [
      { freq: 55, type: 'sawtooth', gain: 0.20 },
      { freq: 82.41, type: 'triangle', gain: 0.16 },
      { freq: 110, type: 'sawtooth', gain: 0.14 },
      { freq: 164.81, type: 'triangle', gain: 0.12 },
      { freq: 196, type: 'sine', gain: 0.10 },
      { freq: 246.94, type: 'triangle', gain: 0.09 },
    ],
    filterFreq: 1400,
    lfoRate: 0.18,
    categoryGain: 0.65,
  },
];

// Configuration crossfade entre phases (secondes)
export const CROSSFADE_DURATION = 4.0;
export const FADE_IN_DURATION = 3.0;

// Configuration LFO
export const LFO_GAIN_AMOUNT = 15;  // Hz de modulation

// Stockage localStorage
export const STORAGE_KEY_VOLUME = 'eden-volume-settings';
export const STORAGE_KEY_AUDIO_STARTED = 'eden-audio-started';

// Fréquences pour effets sonores avec gains corrigés
// Les sons de click/type sont réduits pour éviter les bips intrusifs
export const SOUND_EFFECTS = {
  scroll: { baseFreq: 130, freqMultiplier: 15, type: 'sine' as OscillatorType, gain: 0.08, duration: 0.35 },
  success: { baseFreq: 392, freqTarget: 784, type: 'triangle' as OscillatorType, gain: 0.25, duration: 0.6 },
  transition: { baseFreq: 196, freqTarget: 98, type: 'sine' as OscillatorType, gain: 0.20, duration: 0.9 },
  click: { baseFreq: 200, freqTarget: 150, type: 'triangle' as OscillatorType, gain: 0.005, duration: 0.15 },
  power: { baseFreq: 55, freqTarget: 220, type: 'sawtooth' as OscillatorType, gain: 0.25, duration: 1.5 },
  choice: { baseFreq: 293.66, freqTarget: 587.33, type: 'sine' as OscillatorType, gain: 0.20, duration: 0.5 },
  focus: { baseFreq: 150, freqTarget: 200, type: 'sine' as OscillatorType, gain: 0.008, duration: 0.40 },
  type: { baseFreq: 180, freqVariance: 80, type: 'triangle' as OscillatorType, gain: 0.003, duration: 0.08 },
  submit: { baseFreq: 523, freqTarget1: 1047, freqTarget2: 1568, type: 'triangle' as OscillatorType, gain: 0.30, duration: 0.8 },
} as const;

// Préréglages de volume
export const VOLUME_PRESETS = {
  soft: { master: 0.3, label: 'Doux' },
  normal: { master: 0.6, label: 'Normal' },
  loud: { master: 0.8, label: 'Fort' },
} as const;
