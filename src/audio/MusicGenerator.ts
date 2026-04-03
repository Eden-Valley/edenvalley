/**
 * MusicGenerator - Générateur procédural de musique ambiante
 * 
 * Génère de la musique évolutive avec 5 phases progressives
 * Utilise l'AudioEngine pour le routage strict et le crossfade fluide
 */

import { audioEngine } from './AudioEngine';
import type { MusicPhase, AudioNodeGroup, VoiceConfig } from './types';
import { MUSIC_PHASES, CROSSFADE_DURATION, FADE_IN_DURATION, LFO_GAIN_AMOUNT } from './constants';

// Progressions harmoniques inspirantes - accords riches et évolutifs
const HARMONIC_PROGRESSIONS = {
  // Phase 0: Éveil - Accord Am9 (contemplatif, ouvert, mystérieux)
  awakening: [
    { freq: 55.00, gain: 0.15, type: 'sine' },      // A1 - basse profonde
    { freq: 110.00, gain: 0.12, type: 'sine' },     // A2 - fondamentale
    { freq: 164.81, gain: 0.09, type: 'triangle' },  // E3 - quinte parfaite
    { freq: 196.00, gain: 0.07, type: 'sine' },    // G3 - septième mineure
    { freq: 220.00, gain: 0.06, type: 'triangle' }, // A3 - octave/neuvième
    { freq: 261.63, gain: 0.05, type: 'sine' },    // C4 - tierce mineure (neuvième)
  ],
  // Phase 1: Émergence - Fmaj7 (lumineux, élevé, ouvert)
  emergence: [
    { freq: 65.41, gain: 0.14, type: 'sine' },      // C2 - basse
    { freq: 87.31, gain: 0.11, type: 'sine' },     // F2 - fondamentale
    { freq: 130.81, gain: 0.09, type: 'triangle' },// C3 - quinte
    { freq: 174.61, gain: 0.08, type: 'sine' },    // F3 - octave
    { freq: 196.00, gain: 0.07, type: 'triangle' }, // G3 - septième majeure
    { freq: 246.94, gain: 0.06, type: 'sine' },    // B3 - tierce majeure
    { freq: 329.63, gain: 0.04, type: 'triangle' },// E4 - sixte ajoutée
  ],
  // Phase 2: Révélation - Cmaj9 (puissant, stable, lumineux)
  revelation: [
    { freq: 65.41, gain: 0.13, type: 'sine' },      // C2 - basse
    { freq: 98.00, gain: 0.11, type: 'sine' },     // G2 - quinte
    { freq: 130.81, gain: 0.09, type: 'triangle' },// C3 - fondamentale
    { freq: 164.81, gain: 0.08, type: 'sine' },    // E3 - tierce majeure
    { freq: 196.00, gain: 0.07, type: 'triangle' },// G3 - quinte
    { freq: 261.63, gain: 0.06, type: 'sine' },   // C4 - octave
    { freq: 329.63, gain: 0.05, type: 'triangle' },// E4 - tierce haute
    { freq: 392.00, gain: 0.04, type: 'sine' },    // G4 - quinte haute
  ],
  // Phase 3: Confrontation - Dm9 (tendu, dramatique, intense)
  confrontation: [
    { freq: 73.42, gain: 0.12, type: 'triangle' },  // D2 - basse
    { freq: 110.00, gain: 0.10, type: 'sine' },     // A2 - quinte
    { freq: 146.83, gain: 0.08, type: 'triangle' },// D3 - fondamentale
    { freq: 174.61, gain: 0.07, type: 'sine' },    // F3 - tierce mineure
    { freq: 220.00, gain: 0.06, type: 'triangle' }, // A3 - quinte
    { freq: 293.66, gain: 0.05, type: 'sine' },    // D4 - octave
    { freq: 349.23, gain: 0.04, type: 'triangle' },// F4 - tierce haute
  ],
  // Phase 4: Transcendence - E7#9 (épique, transcendant, résolu)
  transcendence: [
    { freq: 82.41, gain: 0.11, type: 'triangle' },  // E2 - basse
    { freq: 123.47, gain: 0.09, type: 'sine' },     // B2 - quinte
    { freq: 164.81, gain: 0.08, type: 'triangle' }, // E3 - fondamentale
    { freq: 207.65, gain: 0.07, type: 'sine' },     // G#3 - tierce majeure
    { freq: 246.94, gain: 0.06, type: 'triangle' }, // B3 - quinte
    { freq: 311.13, gain: 0.05, type: 'sine' },    // D#4 - septième altérée
    { freq: 329.63, gain: 0.04, type: 'triangle' }, // E4 - octave
    { freq: 415.30, gain: 0.03, type: 'sine' },     // G#4 - tierce haute
  ],
};

export class MusicGenerator {
  private currentPhase: number = -1;
  private activeNodeGroup: AudioNodeGroup | null = null;
  private isTransitioning: boolean = false;

  /**
   * Démarre la musique à la phase 0 (Awakening) avec harmonies riches
   */
  start(): void {
    if (!audioEngine.isReady()) {
      return;
    }

    if (this.activeNodeGroup) {
      return;
    }

    this.transitionToPhase(0);
  }

  /**
   * Arrête la musique avec fade out
   */
  stop(): void {
    if (!this.activeNodeGroup) return;

    const ctx = audioEngine.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Fade out de toutes les voix
    this.activeNodeGroup.gains.forEach(gain => {
      gain.gain.setTargetAtTime(0, now, 0.5);
    });

    // Nettoyage programmé après le fade out
    audioEngine.scheduleCleanup(this.activeNodeGroup, 1000);
    
    this.activeNodeGroup = null;
    this.currentPhase = -1;
  }

  /**
   * Transition vers une phase avec crossfade fluide
   */
  transitionToPhase(phaseIndex: number): void {
    if (phaseIndex === this.currentPhase || phaseIndex < 0 || phaseIndex >= MUSIC_PHASES.length) {
      return;
    }

    if (this.isTransitioning) {
      // Si déjà en transition, programmer la nouvelle
      setTimeout(() => this.transitionToPhase(phaseIndex), 100);
      return;
    }

    const ctx = audioEngine.getAudioContext();
    if (!ctx) return;

    this.isTransitioning = true;
    const now = ctx.currentTime;
    const phase = MUSIC_PHASES[phaseIndex];
    const oldNodeGroup = this.activeNodeGroup;

    const progressionKeys = ['awakening', 'emergence', 'revelation', 'confrontation', 'transcendence'] as const;
    const progression = HARMONIC_PROGRESSIONS[progressionKeys[phaseIndex]];

    // Créer le nouveau groupe de nœuds pour la nouvelle phase
    const newNodeGroup = this.createPhaseNodeGroup(phaseIndex, ctx);
    
    // Fade in progressif avec stagger pour créer un effet "crescendo"
    newNodeGroup.gains.forEach((gain, i) => {
      const voice = progression[i];
      gain.gain.setValueAtTime(0, now);
      // Staggered fade in pour chaque voix (basse d'abord, aigües après)
      const delay = i * 0.3;
      gain.gain.linearRampToValueAtTime(voice.gain, now + FADE_IN_DURATION + delay);
    });

    // Fade out des anciennes voix
    if (oldNodeGroup) {
      oldNodeGroup.gains.forEach(gain => {
        gain.gain.setTargetAtTime(0, now, CROSSFADE_DURATION / 3);
      });

      // Nettoyage de l'ancien groupe après le crossfade
      audioEngine.scheduleCleanup(oldNodeGroup, CROSSFADE_DURATION * 1000 + 500);
    }

    this.activeNodeGroup = newNodeGroup;
    this.currentPhase = phaseIndex;
    audioEngine.setCurrentPhase(phaseIndex);

    // Libérer le flag de transition après le fade in principal
    setTimeout(() => {
      this.isTransitioning = false;
    }, FADE_IN_DURATION * 1000 + 1000);
  }

  /**
   * Définit l'intensité musicale (0-1) et transitionne vers la phase appropriée
   */
  setIntensity(intensity: number): void {
    // Mapper l'intensité (0-1) vers une phase (0-4)
    const targetPhase = Math.min(Math.floor(intensity * 5), 4);
    
    if (targetPhase !== this.currentPhase) {
      this.transitionToPhase(targetPhase);
    }
  }

  /**
   * Récupère la phase actuelle
   */
  getCurrentPhase(): number {
    return this.currentPhase;
  }

  /**
   * Vérifie si la musique est active
   */
  isPlaying(): boolean {
    return this.activeNodeGroup !== null;
  }

  // ==================== PRIVATE METHODS ====================

  private createPhaseNodeGroup(phaseIndex: number, ctx: AudioContext): AudioNodeGroup {
    const progressionKeys = ['awakening', 'emergence', 'revelation', 'confrontation', 'transcendence'] as const;
    const progression = HARMONIC_PROGRESSIONS[progressionKeys[phaseIndex]];
    const phase = MUSIC_PHASES[phaseIndex];
    
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    // Créer le filtre maître pour cette phase
    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(phase.filterFreq, ctx.currentTime);
    masterFilter.Q.setValueAtTime(0.6, ctx.currentTime); // Q plus doux pour moins de résonance

    // Créer chaque voix harmonique avec des variations subtiles
    progression.forEach((voice, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = voice.type as OscillatorType;
      osc.frequency.setValueAtTime(voice.freq, ctx.currentTime);
      
      // Désaccord subtil pour la richesse harmonique (moins que avant pour plus de clarté)
      osc.detune.setValueAtTime((Math.random() - 0.5) * 3, ctx.currentTime);

      // Connexion: osc → gain → masterFilter
      osc.connect(gain);
      gain.connect(masterFilter);

      osc.start(ctx.currentTime);

      oscillators.push(osc);
      gains.push(gain);
    });

    // Créer le LFO pour le mouvement subtil (plus lent pour ambiance méditative)
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(phase.lfoRate, ctx.currentTime);
    lfoGain.gain.setValueAtTime(LFO_GAIN_AMOUNT * 0.5, ctx.currentTime); // Moins de modulation
    
    lfo.connect(lfoGain);
    lfoGain.connect(masterFilter.frequency);
    lfo.start(ctx.currentTime);

    // Connexion finale via AudioEngine
    audioEngine.connectToMaster(masterFilter, 'music');

    return {
      oscillators,
      gains,
      filter: masterFilter,
      lfo,
      lfoGain,
    };
  }
}

// Singleton instance
export const musicGenerator = new MusicGenerator();
