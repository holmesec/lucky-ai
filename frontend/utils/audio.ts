
import { ThemeId } from '../themes/themes';

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(val: boolean) {
    this.enabled = val;
  }

  playTick() {
    if (!this.enabled) return;
    this.initCtx();
    const now = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    // Short, high-pitch click
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.01);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.01);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start(now);
    osc.stop(now + 0.01);
  }

  playWhoosh() {
    if (!this.enabled) return;
    this.initCtx();
    const now = this.ctx!.currentTime;
    // White noise buffer
    const bufferSize = this.ctx!.sampleRate * 0.5;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx!.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.linearRampToValueAtTime(800, now + 0.2);
    filter.frequency.linearRampToValueAtTime(200, now + 0.5);

    const gain = this.ctx!.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
    gain.gain.linearRampToValueAtTime(0, now + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx!.destination);
    noise.start(now);
    noise.stop(now + 0.5);
  }

  playChime() {
    if (!this.enabled) return;
    this.initCtx();
    const now = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now); // A5
    
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  playThemedResult(isYes: boolean, theme: ThemeId) {
    if (!this.enabled) return;
    this.initCtx();
    
    switch (theme) {
      case 'cyber':
        this.playCyberSound(isYes);
        break;
      case 'carnival':
        this.playCarnivalSound(isYes);
        break;
      case 'pastel':
        this.playPastelSound(isYes);
        break;
      case 'noir':
        this.playNoirSound(isYes);
        break;
      case 'dtu':
        this.playDTUSound(isYes);
        break;
      default:
        this.playCyberSound(isYes);
    }
  }

  // --- Theme Implementations ---

  private playDTUSound(isYes: boolean) {
    const now = this.ctx!.currentTime;
    
    if (isYes) {
      // "Computation Complete" - Digital Triad
      // Precise, clean square waves, slightly detached/robotic
      const frequencies = [880, 1108.73, 1318.51]; // A5, C#6, E6
      frequencies.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'square'; 
        osc.frequency.value = freq;
        
        const startTime = now + (i * 0.08);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.05, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    } else {
      // "System Error" - Double Buzzer
      // Sawtooth for roughness, lower pitch
      [0, 0.15].forEach(offset => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now + offset); // Low buzz
        osc.frequency.linearRampToValueAtTime(120, now + offset + 0.1); // Pitch drop
        
        gain.gain.setValueAtTime(0.06, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      });
    }
  }

  private playCyberSound(isYes: boolean) {
    const now = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = isYes ? 'sawtooth' : 'square';
    
    if (isYes) {
      // Ascending computerized arp
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.1);
      osc.frequency.setValueAtTime(1760, now + 0.2);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    } else {
      // Descending glitch
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(55, now + 0.4);
      
      // Add modulation for glitch effect
      const lfo = this.ctx!.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 50;
      const lfoGain = this.ctx!.createGain();
      lfoGain.gain.value = 500;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + 0.5);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    }

    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  }

  private playCarnivalSound(isYes: boolean) {
    const now = this.ctx!.currentTime;
    
    if (isYes) {
      // Major triad bells
      [523.25, 659.25, 783.99].forEach((freq, i) => { // C Major
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.05 + (i * 0.05));
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 1.5);
      });
    } else {
      // Sad slide whistle
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.6); // Slide down

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  }

  private playPastelSound(isYes: boolean) {
    const now = this.ctx!.currentTime;
    
    if (isYes) {
      // Bubbles / Soft chime
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.3);
      
      // Second bubble
      setTimeout(() => {
        const osc2 = this.ctx!.createOscillator();
        const gain2 = this.ctx!.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1200, now + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.25);
        gain2.gain.setValueAtTime(0.1, now + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc2.connect(gain2);
        gain2.connect(this.ctx!.destination);
        osc2.start(now + 0.15);
        osc2.stop(now + 0.45);
      }, 150);

    } else {
      // Soft thud
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }

  private playNoirSound(isYes: boolean) {
    const now = this.ctx!.currentTime;
    
    if (isYes) {
      // Mystery resolve (Piano-ish with reverb simulation via release)
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle'; // Softer than square
      osc.frequency.setValueAtTime(523.25, now); // C5
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0); // Long decay
      
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 2.0);
    } else {
      // Low foghorn / Cello
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65.41, now); // C2
      
      // Filter for warmth
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
      gain.gain.linearRampToValueAtTime(0, now + 1.5);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now);
      osc.stop(now + 1.5);
    }
  }
}

export const soundEngine = new SoundEngine();
