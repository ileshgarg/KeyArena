export type SoundType = 'mechanical' | 'soft' | 'click' | 'typewriter' | 'muted';

export interface SoundConfig {
  enabled: boolean;
  type: SoundType;
  masterVolume: number; // 0 to 1
  keyVolume: number; // 0 to 1
  errorVolume: number; // 0 to 1
  playCompletionSound: boolean;
}

export const DEFAULT_SOUND_CONFIG: SoundConfig = {
  enabled: false,
  type: 'mechanical',
  masterVolume: 0.5,
  keyVolume: 0.6,
  errorVolume: 0.7,
  playCompletionSound: true
};

class ProceduralSoundEngine {
  private ctx: AudioContext | null = null;
  private config: SoundConfig = { ...DEFAULT_SOUND_CONFIG };

  public updateConfig(config: Partial<SoundConfig>) {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): SoundConfig {
    return this.config;
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playKey(isSpace: boolean = false) {
    if (!this.config.enabled || this.config.type === 'muted') return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const gainNode = this.ctx.createGain();
    const effectiveVol = this.config.masterVolume * this.config.keyVolume;
    gainNode.gain.setValueAtTime(effectiveVol, t);
    gainNode.connect(this.ctx.destination);

    switch (this.config.type) {
      case 'mechanical': {
        // Deep tactile click: sharp transient + resonant body
        const osc = this.ctx.createOscillator();
        osc.type = isSpace ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(isSpace ? 180 : 320, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.04);

        gainNode.gain.setValueAtTime(effectiveVol * 0.8, t);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gainNode);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      }
      case 'typewriter': {
        // Metallic percussive click
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(isSpace ? 400 : 750, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.06);

        gainNode.gain.setValueAtTime(effectiveVol * 0.9, t);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        osc.connect(gainNode);
        osc.start(t);
        osc.stop(t + 0.06);
        break;
      }
      case 'click': {
        // High crisp micro-click
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.02);

        gainNode.gain.setValueAtTime(effectiveVol * 0.4, t);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

        osc.connect(gainNode);
        osc.start(t);
        osc.stop(t + 0.02);
        break;
      }
      case 'soft': {
        // Muted low tactile tap
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isSpace ? 120 : 200, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.04);

        gainNode.gain.setValueAtTime(effectiveVol * 0.5, t);
        gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        osc.connect(gainNode);
        osc.start(t);
        osc.stop(t + 0.04);
        break;
      }
    }
  }

  public playError() {
    if (!this.config.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const gainNode = this.ctx.createGain();
    const effectiveVol = this.config.masterVolume * this.config.errorVolume * 0.6;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(110, t + 0.08);

    gainNode.gain.setValueAtTime(effectiveVol, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    gainNode.connect(this.ctx.destination);
    osc.connect(gainNode);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playCompletion() {
    if (!this.config.enabled || !this.config.playCompletionSound) return;
    this.initContext();
    if (!this.ctx) return;

    // Harmonic two-tone chord
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);

      gain.gain.setValueAtTime(this.config.masterVolume * 0.4, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.35);

      gain.connect(this.ctx.destination);
      osc.connect(gain);
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.35);
    });
  }
}

export const soundEngine = new ProceduralSoundEngine();
