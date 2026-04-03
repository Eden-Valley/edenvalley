/**
 * AudioEngine - Cœur du système audio avec routage strict
 * 
 * PRINCIPE FONDAMENTAL: Toutes les sources audio DOIVENT passer par le masterGain
 * Aucune connexion directe à destination n'est autorisée.
 * 
 * Architecture:
 *   Source → CategoryGain → MasterGain → Destination
 * 
 * Gestion mémoire: Tous les nœuds sont trackés et nettoyés automatiquement
 */

import type { AudioCategory, AudioNodeGroup, VolumeSettings, AudioEngineState } from './types';
import { 
  CATEGORY_GAINS, 
  MASTER_GAIN_DEFAULT, 
  MASTER_GAIN_MIN, 
  MASTER_GAIN_MAX 
} from './constants';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private categoryGains: Map<AudioCategory, GainNode> = new Map();
  private activeNodes: Set<AudioNode> = new Set();
  private cleanupTimers: Set<number> = new Set();
  
  private volumeSettings: VolumeSettings = {
    master: MASTER_GAIN_DEFAULT,
    music: CATEGORY_GAINS.music,
    sfx: CATEGORY_GAINS.sfx,
    voice: CATEGORY_GAINS.voice,
    muted: false,
  };
  
  private state: AudioEngineState = {
    isInitialized: false,
    isRunning: false,
    currentPhase: 0,
    error: null,
  };

  // Callbacks pour React
  private onStateChange: ((state: AudioEngineState) => void) | null = null;
  private onVolumeChange: ((settings: VolumeSettings) => void) | null = null;

  /**
   * Initialise l'AudioContext et crée le graphe de routage
   */
  async initialize(): Promise<boolean> {
    if (this.state.isInitialized) {
      return true;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API not supported');
      }

      this.audioContext = new AudioContextClass();
      
      // Créer le masterGain - SEUL point de connexion à destination
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.masterGain.connect(this.audioContext.destination);

      // Créer les gains par catégorie, tous connectés au master
      (['music', 'sfx', 'voice'] as AudioCategory[]).forEach(category => {
        const gainNode = this.audioContext!.createGain();
        const defaultGain = CATEGORY_GAINS[category];
        gainNode.gain.setValueAtTime(defaultGain, this.audioContext!.currentTime);
        gainNode.connect(this.masterGain!);
        this.categoryGains.set(category, gainNode);
      });

      // Charger les paramètres sauvegardés
      this.loadVolumeSettings();

      this.state.isInitialized = true;
      this.emitStateChange();
      return true;
    } catch {
      this.state.error = 'Initialization failed';
      this.emitStateChange();
      return false;
    }
  }

  /**
   * Démarre l'audio (nécessite une interaction utilisateur)
   */
  async start(): Promise<boolean> {
    if (!this.audioContext || !this.state.isInitialized) {
      return false;
    }

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (this.audioContext.state === 'running') {
        // Fade in du master
        const now = this.audioContext.currentTime;
        const targetGain = this.volumeSettings.muted ? 0 : this.volumeSettings.master;
        this.masterGain!.gain.setTargetAtTime(targetGain, now, 0.5);

        this.state.isRunning = true;
        this.emitStateChange();
        
        sessionStorage.setItem('eden-audio-started', 'true');
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  /**
   * Méthode OBLIGATOIRE pour connecter toute source audio
   * Garantit le routage strict via masterGain
   */
  connectToMaster(
    source: AudioNode,
    category: AudioCategory,
    intermediateNodes?: AudioNode[]
  ): void {
    if (!this.audioContext || !this.masterGain) {
      throw new Error('AudioEngine not initialized');
    }

    const categoryGain = this.categoryGains.get(category);
    if (!categoryGain) {
      throw new Error(`Unknown category: ${category}`);
    }

    // Chaîne de connexion: source → [intermediate] → categoryGain → masterGain → destination
    let currentNode: AudioNode = source;

    if (intermediateNodes && intermediateNodes.length > 0) {
      intermediateNodes.forEach(node => {
        currentNode.connect(node);
        this.trackNode(node);
        currentNode = node;
      });
    }

    // Connexion finale OBLIGATOIRE via categoryGain
    currentNode.connect(categoryGain);
    this.trackNode(source);
  }

  /**
   * Déconnecte proprement un nœud et libère les ressources
   */
  disconnectNode(node: AudioNode): void {
    try {
      node.disconnect();
    } catch {
      // Ignorer les erreurs de déconnexion
    }
    this.activeNodes.delete(node);
  }

  /**
   * Programme le nettoyage d'un groupe de nœuds après un délai
   */
  scheduleCleanup(nodeGroup: AudioNodeGroup, delayMs: number): void {
    const timerId = window.setTimeout(() => {
      // Arrêter les oscillateurs
      nodeGroup.oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch {}
        this.disconnectNode(osc);
      });

      // Déconnecter les gains
      nodeGroup.gains.forEach(gain => {
        this.disconnectNode(gain);
      });

      // Déconnecter le filtre et LFO s'ils existent
      if (nodeGroup.filter) {
        this.disconnectNode(nodeGroup.filter);
      }
      if (nodeGroup.lfo) {
        try {
          nodeGroup.lfo.stop();
        } catch {}
        this.disconnectNode(nodeGroup.lfo);
      }
      if (nodeGroup.lfoGain) {
        this.disconnectNode(nodeGroup.lfoGain);
      }

      this.cleanupTimers.delete(timerId);
    }, delayMs);

    this.cleanupTimers.add(timerId);
  }

  /**
   * Annule tous les nettoyages programmés
   */
  cancelAllCleanups(): void {
    this.cleanupTimers.forEach(timerId => {
      window.clearTimeout(timerId);
    });
    this.cleanupTimers.clear();
  }

  /**
   * Définit le volume master avec clamping aux valeurs saines
   */
  setMasterVolume(value: number): void {
    const clampedValue = Math.max(MASTER_GAIN_MIN, Math.min(MASTER_GAIN_MAX, value));
    this.volumeSettings.master = clampedValue;
    
    if (this.audioContext && this.masterGain && !this.volumeSettings.muted) {
      const now = this.audioContext.currentTime;
      this.masterGain.gain.setTargetAtTime(clampedValue, now, 0.1);
    }
    
    this.saveVolumeSettings();
    this.emitVolumeChange();
  }

  /**
   * Définit le volume d'une catégorie
   */
  setCategoryVolume(category: AudioCategory, value: number): void {
    const clampedValue = Math.max(0, Math.min(1, value));
    this.volumeSettings[category] = clampedValue;
    
    const categoryGain = this.categoryGains.get(category);
    if (this.audioContext && categoryGain) {
      const now = this.audioContext.currentTime;
      categoryGain.gain.setTargetAtTime(clampedValue, now, 0.1);
    }
    
    this.saveVolumeSettings();
    this.emitVolumeChange();
  }

  /**
   * Mute/unmute global
   */
  setMuted(muted: boolean): void {
    this.volumeSettings.muted = muted;
    
    if (this.audioContext && this.masterGain) {
      const now = this.audioContext.currentTime;
      const targetGain = muted ? 0 : this.volumeSettings.master;
      this.masterGain.gain.setTargetAtTime(targetGain, now, muted ? 0.1 : 0.3);
    }
    
    this.saveVolumeSettings();
    this.emitVolumeChange();
  }

  toggleMuted(): void {
    this.setMuted(!this.volumeSettings.muted);
  }

  /**
   * Récupère les paramètres de volume actuels
   */
  getVolumeSettings(): VolumeSettings {
    return { ...this.volumeSettings };
  }

  /**
   * Récupère l'état du moteur audio
   */
  getState(): AudioEngineState {
    return { ...this.state };
  }

  /**
   * Récupère le AudioContext
   */
  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }

  /**
   * Vérifie si l'audio est prêt à jouer
   */
  isReady(): boolean {
    return this.state.isInitialized && 
           this.state.isRunning && 
           this.audioContext?.state === 'running';
  }

  /**
   * Met à jour la phase musicale actuelle
   */
  setCurrentPhase(phase: number): void {
    this.state.currentPhase = phase;
    this.emitStateChange();
  }

  /**
   * Nettoyage complet - arrête tout et libère les ressources
   */
  dispose(): void {
    this.cancelAllCleanups();
    
    // Déconnecter tous les nœuds trackés
    this.activeNodes.forEach(node => {
      try {
        node.disconnect();
      } catch {}
    });
    this.activeNodes.clear();

    // Fermer l'AudioContext
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.masterGain = null;
    this.categoryGains.clear();
    
    this.state = {
      isInitialized: false,
      isRunning: false,
      currentPhase: 0,
      error: null,
    };
    
    this.emitStateChange();
  }

  // ==================== PRIVATE METHODS ====================

  private trackNode(node: AudioNode): void {
    this.activeNodes.add(node);
  }

  private loadVolumeSettings(): void {
    try {
      const saved = localStorage.getItem('eden-volume-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.volumeSettings = {
          master: Math.max(MASTER_GAIN_MIN, Math.min(MASTER_GAIN_MAX, parsed.master ?? MASTER_GAIN_DEFAULT)),
          music: Math.max(0, Math.min(1, parsed.music ?? CATEGORY_GAINS.music)),
          sfx: Math.max(0, Math.min(1, parsed.sfx ?? CATEGORY_GAINS.sfx)),
          voice: Math.max(0, Math.min(1, parsed.voice ?? CATEGORY_GAINS.voice)),
          muted: !!parsed.muted,
        };
      }
    } catch {
      // Ignorer les erreurs de parsing
    }
  }

  private saveVolumeSettings(): void {
    try {
      localStorage.setItem('eden-volume-settings', JSON.stringify(this.volumeSettings));
    } catch {
      // Ignorer les erreurs de stockage
    }
  }

  private emitStateChange(): void {
    this.onStateChange?.({ ...this.state });
  }

  private emitVolumeChange(): void {
    this.onVolumeChange?.({ ...this.volumeSettings });
  }

  // ==================== CALLBACKS ====================

  setOnStateChange(callback: ((state: AudioEngineState) => void) | null): void {
    this.onStateChange = callback;
  }

  setOnVolumeChange(callback: ((settings: VolumeSettings) => void) | null): void {
    this.onVolumeChange = callback;
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();
