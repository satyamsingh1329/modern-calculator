/**
 * NEXUS CALC // PRO - Web Audio Synthesizer
 * Procedural sound effects for tactile clicks, chimes, and sweeps without external audio files.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.enabled = localStorage.getItem('nexus_sound_enabled') !== 'false';
    this.volume = parseFloat(localStorage.getItem('nexus_sound_volume') || '0.35');
    this.initContext = this.initContext.bind(this);
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    localStorage.setItem('nexus_sound_enabled', this.enabled);
    if (this.enabled) {
      this.initContext();
      this.playChirp(880, 0.08);
    }
    return this.enabled;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    localStorage.setItem('nexus_sound_volume', this.volume);
  }

  playClick(type = 'default') {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, now);

      let startFreq = 1200;
      let endFreq = 400;
      let duration = 0.025;

      if (type === 'operator') {
        startFreq = 1600;
        endFreq = 700;
        duration = 0.035;
      } else if (type === 'function') {
        startFreq = 2200;
        endFreq = 900;
        duration = 0.04;
      }

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      const maxGain = this.volume * 0.4;
      gain.gain.setValueAtTime(maxGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio click error:', e);
    }
  }

  playEquals() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    try {
      // Futuristic 2-tone chord: C5 (523Hz) and G5 (784Hz)
      [523.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        const duration = 0.22;
        const maxGain = this.volume * 0.35;
        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(maxGain, now + idx * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + duration);
      });
    } catch (e) {
      console.warn('Audio equals error:', e);
    }
  }

  playClear() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    try {
      // Downward frequency laser sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

      const maxGain = this.volume * 0.25;
      gain.gain.setValueAtTime(maxGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn('Audio clear error:', e);
    }
  }

  playError() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    try {
      [140, 148].forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        const duration = 0.18;
        const maxGain = this.volume * 0.3;
        gain.gain.setValueAtTime(maxGain, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });
    } catch (e) {
      console.warn('Audio error error:', e);
    }
  }

  playChirp(freq = 600, duration = 0.06) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration);

      gain.gain.setValueAtTime(this.volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Audio chirp error:', e);
    }
  }
}

window.soundEngine = new SoundEngine();
