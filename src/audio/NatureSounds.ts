/**
 * NatureSounds - Générateur procédural de sons naturels
 * 
 * Crée des ambiances naturelles réalistes:
 * - Chants d'oiseaux avec variations de hauteur et durée
 * - Bruissements de vent subtils
 * - Gouttes d'eau occasionnelles
 * - Ambiance de forêt vivante
 */

import { audioEngine } from './AudioEngine';

// Configurations des sons naturels
const BIRD_CALLS = [
  // Oiseau 1: Sifflement mélodieux court
  { baseFreq: 2500, freqRange: 800, duration: 0.15, type: 'sine' as OscillatorType, gain: 0.08 },
  // Oiseau 2: Notes montantes
  { baseFreq: 1800, freqRange: 600, duration: 0.25, type: 'triangle' as OscillatorType, gain: 0.06 },
  // Oiseau 3: Trille rapide
  { baseFreq: 3200, freqRange: 400, duration: 0.08, type: 'sine' as OscillatorType, gain: 0.07 },
  // Oiseau 4: Appel grave
  { baseFreq: 1200, freqRange: 300, duration: 0.35, type: 'triangle' as OscillatorType, gain: 0.10 },
  // Oiseau 5: Sifflement aigu
  { baseFreq: 4500, freqRange: 500, duration: 0.12, type: 'sine' as OscillatorType, gain: 0.05 },
];

const WIND_CONFIG = {
  baseFreq: 150,
  freqRange: 100,
  gain: 0.12,  // Augmenté pour ambiance dominante
  filterFreq: 400,  // Plus grave pour souffle puissant
  modulationRate: 0.15,  // Plus lent pour mouvements naturels
};

const WATER_DROP_CONFIG = {
  baseFreq: 600,
  freqRange: 300,
  gain: 0.08,  // Augmenté pour rivière audible
  duration: 0.12,
  echoDelay: 0.08,
  echoGain: 0.4,
};

// Intervalles pour le storytelling sonore rivière
const WATER_SCHEDULE = {
  minDelay: 800,    // 0.8s minimum (ruisseau actif)
  maxDelay: 2500,   // 2.5s maximum
};

// Configuration pour le flux de rivière continu
const RIVER_CONFIG = {
  gain: 0.10,
  filterFreq: 1200,  // Plus aigu que le vent
  filterQ: 0.8,
  modulationRate: 2.5,  // Plus rapide pour effet "splash"
  modulationDepth: 0.04,
};

export class NatureSounds {
  private isEnabled: boolean = false;
  private birdInterval: number | null = null;
  private waterDropInterval: number | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  private windGain: GainNode | null = null;
  private windLFO: OscillatorNode | null = null;
  private riverSource: AudioBufferSourceNode | null = null;
  private riverGain: GainNode | null = null;
  private riverLFO: OscillatorNode | null = null;

  /**
   * Active les sons naturels
   */
  enable(): void {
    if (this.isEnabled) return;
    if (!audioEngine.isReady()) {
      return;
    }

    this.isEnabled = true;

    this.startWindAmbiance();
    // Rivière désactivée - on garde juste le vent
    // this.startRiverStream();
  }

  /**
   * Désactive les sons naturels
   */
  disable(): void {
    if (!this.isEnabled) return;

    this.isEnabled = false;

    // Arrêter l'interval des oiseaux
    if (this.birdInterval) {
      window.clearTimeout(this.birdInterval);
      this.birdInterval = null;
    }

    // Arrêter l'interval des gouttes d'eau
    if (this.waterDropInterval) {
      window.clearTimeout(this.waterDropInterval);
      this.waterDropInterval = null;
    }

    // Fade out du vent
    if (this.windGain && this.windSource) {
      const ctx = audioEngine.getAudioContext();
      if (ctx) {
        this.windGain.gain.setTargetAtTime(0, ctx.currentTime, 1.0);
        setTimeout(() => {
          this.windSource?.stop();
          this.windSource = null;
          this.windGain = null;
          this.windLFO = null;
        }, 1500);
      }
    }

    // Fade out de la rivière
    if (this.riverGain && this.riverSource) {
      const ctx = audioEngine.getAudioContext();
      if (ctx) {
        this.riverGain.gain.setTargetAtTime(0, ctx.currentTime, 1.0);
        setTimeout(() => {
          this.riverSource?.stop();
          this.riverSource = null;
          this.riverGain = null;
          this.riverLFO = null;
        }, 1500);
      }
    }
  }

  /**
   * Bascule on/off
   */
  toggle(): boolean {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
    return this.isEnabled;
  }

  /**
   * Vérifie si actif
   */
  isActive(): boolean {
    return this.isEnabled;
  }

  // ==================== PRIVATE METHODS ====================

  private startWindAmbiance(): void {
    const ctx = audioEngine.getAudioContext();
    if (!ctx) return;

    // Créer le vent: bruit rose filtré + modulation lente
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Générer bruit rose (plus naturel que blanc)
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Boost
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filtre passe-bande pour le vent
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(WIND_CONFIG.filterFreq, ctx.currentTime);
    filter.Q.setValueAtTime(0.5, ctx.currentTime);

    // Gain avec modulation
    this.windGain = ctx.createGain();
    this.windGain.gain.setValueAtTime(0, ctx.currentTime);
    this.windGain.gain.linearRampToValueAtTime(WIND_CONFIG.gain, ctx.currentTime + 2);

    // LFO pour moduler le volume du vent (souffles)
    this.windLFO = ctx.createOscillator();
    this.windLFO.type = 'sine';
    this.windLFO.frequency.setValueAtTime(WIND_CONFIG.modulationRate, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(WIND_CONFIG.gain * 0.5, ctx.currentTime);

    this.windLFO.connect(lfoGain);
    lfoGain.connect(this.windGain.gain);

    // Connexions
    noise.connect(filter);
    filter.connect(this.windGain);
    audioEngine.connectToMaster(this.windGain, 'sfx');

    noise.start();
    this.windLFO.start();

    this.windSource = noise;
  }

  private startRiverStream(): void {
    const ctx = audioEngine.getAudioContext();
    if (!ctx) return;

    // Créer le son de rivière: bruit rose + filtre passe-bande + modulation rapide
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Générer bruit rose
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 4.0; // Boost plus fort pour l'eau
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filtre passe-bande pour la rivière - plus aigu et résonant
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(RIVER_CONFIG.filterFreq, ctx.currentTime);
    filter.Q.setValueAtTime(RIVER_CONFIG.filterQ, ctx.currentTime);

    // Gain principal
    this.riverGain = ctx.createGain();
    this.riverGain.gain.setValueAtTime(0, ctx.currentTime);
    this.riverGain.gain.linearRampToValueAtTime(RIVER_CONFIG.gain, ctx.currentTime + 3);

    // LFO rapide pour moduler le volume (effet "splash" de l'eau qui coule)
    this.riverLFO = ctx.createOscillator();
    this.riverLFO.type = 'sine';
    this.riverLFO.frequency.setValueAtTime(RIVER_CONFIG.modulationRate, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(RIVER_CONFIG.modulationDepth, ctx.currentTime);

    this.riverLFO.connect(lfoGain);
    lfoGain.connect(this.riverGain.gain);

    // Connexions
    noise.connect(filter);
    filter.connect(this.riverGain);
    audioEngine.connectToMaster(this.riverGain, 'sfx');

    noise.start();
    this.riverLFO.start();

    this.riverSource = noise;
  }

  private scheduleBirdCalls(): void {
    // Planifier des chants d'oiseaux aléatoires
    const scheduleNext = () => {
      if (!this.isEnabled) return;

      // Intervalle aléatoire entre 3 et 12 secondes
      const delay = 3000 + Math.random() * 9000;

      this.birdInterval = window.setTimeout(() => {
        if (this.isEnabled) {
          this.playBirdCall();
          scheduleNext();
        }
      }, delay);
    };

    scheduleNext();
  }

  private playBirdCall(): void {
    const ctx = audioEngine.getAudioContext();
    if (!ctx) return;

    // Choisir un type d'oiseau aléatoire
    const bird = BIRD_CALLS[Math.floor(Math.random() * BIRD_CALLS.length)];
    
    // Parfois jouer une séquence de 2-3 notes
    const noteCount = Math.random() > 0.6 ? 2 + Math.floor(Math.random() * 2) : 1;

    for (let i = 0; i < noteCount; i++) {
      setTimeout(() => {
        if (!this.isEnabled) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = bird.type;
        
        // Fréquence aléatoire dans la plage de l'oiseau
        const freq = bird.baseFreq + (Math.random() - 0.5) * bird.freqRange;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Variation de hauteur pendant le son (glissando naturel)
        if (Math.random() > 0.5) {
          osc.frequency.exponentialRampToValueAtTime(
            freq * (1 + (Math.random() - 0.5) * 0.3),
            ctx.currentTime + bird.duration
          );
        }

        // Enveloppe naturelle: attaque rapide, sustain court, release doux
        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(bird.gain, now + 0.01);
        gain.gain.setValueAtTime(bird.gain, now + bird.duration * 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + bird.duration);

        osc.connect(gain);
        audioEngine.connectToMaster(gain, 'sfx');

        osc.start(now);
        osc.stop(now + bird.duration + 0.05);

        // Auto-cleanup
        setTimeout(() => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch (e) {
            // Déjà nettoyé
          }
        }, (bird.duration + 0.1) * 1000);
      }, i * 180); // Délai entre notes d'une séquence
    }
  }

  private scheduleWaterDrops(): void {
    // Planifier des gouttes d'eau fréquentes pour créer une rivière
    const scheduleNext = () => {
      if (!this.isEnabled) return;

      // Intervalle rapide pour ruisseau continu (0.8 - 2.5s)
      const delay = WATER_SCHEDULE.minDelay + Math.random() * (WATER_SCHEDULE.maxDelay - WATER_SCHEDULE.minDelay);

      this.waterDropInterval = window.setTimeout(() => {
        if (this.isEnabled) {
          // Parfois jouer 2 gouttes rapprochées pour varier le rythme
          const doubleDrop = Math.random() > 0.7;
          this.playWaterDrop();
          if (doubleDrop) {
            setTimeout(() => this.playWaterDrop(), 80 + Math.random() * 120);
          }
          scheduleNext();
        }
      }, delay);
    };

    scheduleNext();
  }

  private playWaterDrop(): void {
    const ctx = audioEngine.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Son principal de la goutte
    const mainOsc = ctx.createOscillator();
    const mainGain = ctx.createGain();
    
    mainOsc.type = 'sine';
    const baseFreq = WATER_DROP_CONFIG.baseFreq + (Math.random() - 0.5) * WATER_DROP_CONFIG.freqRange;
    mainOsc.frequency.setValueAtTime(baseFreq, now);
    
    // Enveloppe: attaque très rapide, decay court avec résonance
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(WATER_DROP_CONFIG.gain, now + 0.005);
    mainGain.gain.exponentialRampToValueAtTime(0.001, now + WATER_DROP_CONFIG.duration);
    
    mainOsc.connect(mainGain);
    audioEngine.connectToMaster(mainGain, 'sfx');
    
    mainOsc.start(now);
    mainOsc.stop(now + WATER_DROP_CONFIG.duration + 0.02);
    
    // Echo/résonance (simule la réverbération dans une grotte/rivière)
    setTimeout(() => {
      if (!this.isEnabled) return;
      
      const echoOsc = ctx.createOscillator();
      const echoGain = ctx.createGain();
      
      echoOsc.type = 'sine';
      echoOsc.frequency.setValueAtTime(baseFreq * 0.95, now + WATER_DROP_CONFIG.echoDelay);
      
      echoGain.gain.setValueAtTime(0, now + WATER_DROP_CONFIG.echoDelay);
      echoGain.gain.linearRampToValueAtTime(
        WATER_DROP_CONFIG.gain * WATER_DROP_CONFIG.echoGain,
        now + WATER_DROP_CONFIG.echoDelay + 0.005
      );
      echoGain.gain.exponentialRampToValueAtTime(
        0.001,
        now + WATER_DROP_CONFIG.echoDelay + WATER_DROP_CONFIG.duration * 0.8
      );
      
      echoOsc.connect(echoGain);
      audioEngine.connectToMaster(echoGain, 'sfx');
      
      echoOsc.start(now + WATER_DROP_CONFIG.echoDelay);
      echoOsc.stop(now + WATER_DROP_CONFIG.echoDelay + WATER_DROP_CONFIG.duration);
      
      // Cleanup
      setTimeout(() => {
        try {
          echoOsc.disconnect();
          echoGain.disconnect();
        } catch (e) {}
      }, (WATER_DROP_CONFIG.echoDelay + WATER_DROP_CONFIG.duration + 0.05) * 1000);
    }, 0);
    
    // Cleanup du son principal
    setTimeout(() => {
      try {
        mainOsc.disconnect();
        mainGain.disconnect();
      } catch (e) {}
    }, (WATER_DROP_CONFIG.duration + 0.05) * 1000);
  }
}

// Singleton
export const natureSounds = new NatureSounds();
