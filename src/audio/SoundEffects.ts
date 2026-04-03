/**
 * SoundEffects - Gestionnaire d'effets sonores one-shot
 * 
 * Tous les effets passent obligatoirement par le masterGain via l'AudioEngine
 */

import { audioEngine } from './AudioEngine';
import type { SoundEvent } from './types';
import { SOUND_EFFECTS } from './constants';

export class SoundEffects {
  /**
   * Joue un effet sonore par son type
   */
  play(type: SoundEvent, value?: number): void {
    if (!audioEngine.isReady()) {
      return;
    }

    const ctx = audioEngine.getAudioContext();
    if (!ctx || ctx.state !== 'running') {
      return;
    }

    // Vérifier le mute
    if (audioEngine.getVolumeSettings().muted) {
      return;
    }

    switch (type) {
      case 'scroll':
        this.playScroll(ctx, value ?? 0);
        break;
      case 'success':
        this.playSuccess(ctx);
        break;
      case 'transition':
        this.playTransition(ctx);
        break;
      case 'click':
        this.playClick(ctx);
        break;
      case 'power':
        this.playPower(ctx);
        break;
      case 'choice':
        this.playChoice(ctx);
        break;
      case 'focus':
        this.playFocus(ctx);
        break;
      case 'type':
        this.playType(ctx);
        break;
      case 'submit':
        this.playSubmit(ctx);
        break;
    }
  }

  // ==================== PRIVATE EFFECT METHODS ====================

  private playScroll(ctx: AudioContext, value: number): void {
    const config = SOUND_EFFECTS.scroll;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);

    osc.frequency.setValueAtTime(config.baseFreq + (value * config.freqMultiplier), ctx.currentTime);
    osc.type = config.type;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(config.gain, ctx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + config.duration);

    osc.connect(filter);
    filter.connect(gain);
    
    // Connexion OBLIGATOIRE via AudioEngine
    audioEngine.connectToMaster(gain, 'sfx');

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + config.duration + 0.1);

    // Cleanup automatique
    this.scheduleNodeCleanup([osc, gain, filter], (config.duration + 0.2) * 1000);
  }

  private playSuccess(ctx: AudioContext): void {
    const config = SOUND_EFFECTS.success;
    const t = ctx.currentTime;

    // Voix principale
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    
    osc1.frequency.setValueAtTime(config.baseFreq, t);
    osc1.frequency.exponentialRampToValueAtTime(config.freqTarget, t + 0.15);
    osc1.type = config.type;
    
    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(config.gain, t + 0.05);
    gain1.gain.linearRampToValueAtTime(0, t + config.duration);

    osc1.connect(gain1);
    audioEngine.connectToMaster(gain1, 'sfx');

    // Harmonic secondaire
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    
    osc2.frequency.setValueAtTime(523, t);
    osc2.frequency.exponentialRampToValueAtTime(1047, t + 0.2);
    osc2.type = 'sine';
    
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(config.gain * 0.5, t + 0.08);
    gain2.gain.linearRampToValueAtTime(0, t + 0.5);

    osc2.connect(gain2);
    audioEngine.connectToMaster(gain2, 'sfx');

    osc1.start(t);
    osc2.start(t + 0.1);
    osc1.stop(t + 1);
    osc2.stop(t + 1);

    this.scheduleNodeCleanup([osc1, gain1, osc2, gain2], 1100);
  }

  private playTransition(ctx: AudioContext): void {
    const config = SOUND_EFFECTS.transition;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(300, t + config.duration);

    osc.frequency.setValueAtTime(config.baseFreq, t);
    osc.frequency.linearRampToValueAtTime(config.freqTarget, t + 0.6);
    osc.type = config.type;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(config.gain, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + config.duration);

    osc.connect(filter);
    filter.connect(gain);
    audioEngine.connectToMaster(gain, 'sfx');

    osc.start(t);
    osc.stop(t + config.duration + 0.1);

    this.scheduleNodeCleanup([osc, gain, filter], (config.duration + 0.2) * 1000);
  }

  private playClick(ctx: AudioContext): void {
    const config = SOUND_EFFECTS.click;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(config.baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(config.freqTarget, t + 0.05);
    osc.type = config.type;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(config.gain, t + 0.005);
    gain.gain.linearRampToValueAtTime(0, t + config.duration);

    osc.connect(gain);
    audioEngine.connectToMaster(gain, 'sfx');

    osc.start(t);
    osc.stop(t + config.duration + 0.05);

    this.scheduleNodeCleanup([osc, gain], (config.duration + 0.1) * 1000);
  }

  private playPower(ctx: AudioContext): void {
    const config = SOUND_EFFECTS.power;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.linearRampToValueAtTime(1200, t + 0.8);

    osc.frequency.setValueAtTime(config.baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(config.freqTarget, t + 0.8);
    osc.type = config.type;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(config.gain, t + 0.15);
    gain.gain.linearRampToValueAtTime(0, t + config.duration);

    osc.connect(filter);
    filter.connect(gain);
    audioEngine.connectToMaster(gain, 'sfx');

    osc.start(t);
    osc.stop(t + config.duration + 0.1);

    this.scheduleNodeCleanup([osc, gain, filter], (config.duration + 0.2) * 1000);
  }

  private playChoice(ctx: AudioContext): void {
    const config = SOUND_EFFECTS.choice;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(config.baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(config.freqTarget, t + 0.25);
    osc.type = config.type;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(config.gain, t + 0.05);
    gain.gain.linearRampToValueAtTime(0, t + config.duration);

    osc.connect(gain);
    audioEngine.connectToMaster(gain, 'sfx');

    osc.start(t);
    osc.stop(t + config.duration + 0.1);

    this.scheduleNodeCleanup([osc, gain], (config.duration + 0.2) * 1000);
  }

  private playFocus(ctx: AudioContext): void {
    const config = SOUND_EFFECTS.focus;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(config.baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(config.freqTarget, t + 0.12);
    osc.type = config.type;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(config.gain, t + 0.02);
    gain.gain.linearRampToValueAtTime(0, t + config.duration);

    osc.connect(gain);
    audioEngine.connectToMaster(gain, 'sfx');

    osc.start(t);
    osc.stop(t + config.duration + 0.05);

    this.scheduleNodeCleanup([osc, gain], (config.duration + 0.1) * 1000);
  }

  private playType(ctx: AudioContext): void {
    const config = SOUND_EFFECTS.type;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(config.baseFreq + Math.random() * (config.freqVariance ?? 0), t);
    osc.type = config.type;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(config.gain, t + 0.003);
    gain.gain.linearRampToValueAtTime(0, t + config.duration);

    osc.connect(gain);
    audioEngine.connectToMaster(gain, 'sfx');

    osc.start(t);
    osc.stop(t + config.duration + 0.02);

    this.scheduleNodeCleanup([osc, gain], (config.duration + 0.05) * 1000);
  }

  private playSubmit(ctx: AudioContext): void {
    const config = SOUND_EFFECTS.submit;
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(config.baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(config.freqTarget1 as number, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(config.freqTarget2 as number, t + 0.3);
    osc.type = config.type;

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(config.gain, t + 0.05);
    gain.gain.linearRampToValueAtTime(0, t + config.duration);

    osc.connect(gain);
    audioEngine.connectToMaster(gain, 'sfx');

    osc.start(t);
    osc.stop(t + config.duration + 0.1);

    this.scheduleNodeCleanup([osc, gain], (config.duration + 0.2) * 1000);
  }

  private scheduleNodeCleanup(nodes: AudioNode[], delayMs: number): void {
    setTimeout(() => {
      nodes.forEach(node => {
        try {
          node.disconnect();
        } catch {}
      });
    }, delayMs);
  }
}

// Singleton instance
export const soundEffects = new SoundEffects();
