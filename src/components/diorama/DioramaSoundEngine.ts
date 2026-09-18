// Procedural Web Audio API Sound Engine for Tokyo Otaku Diorama
// 100% synthesized in real-time. Zero external assets, zero network latency.

class DioramaSoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with autoplay policy
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // 1. Mechanical Light Switch Click (Crisp tactile double-snap)
  public playSwitch(isOn: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // High transient snap (noise burst)
    const bufferSize = Math.floor(ctx.sampleRate * 0.035);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.18));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isOn ? 2400 : 1800, t);
    filter.Q.setValueAtTime(3.5, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.38, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);

    // Resonant body clack
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isOn ? 180 : 130, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.045);

    oscGain.gain.setValueAtTime(0.42, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // 2. Window Venetian Blinds Rustle / Roller blind pull
  public playBlinds(isClosing: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const duration = 0.65;

    // Filtered noise for fabric/slats sliding
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // Modulate noise to mimic individual slats passing
      const ripple = Math.sin((i / ctx.sampleRate) * 75 * Math.PI * 2) * 0.4 + 0.6;
      data[i] = (Math.random() * 2 - 1) * ripple;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    if (isClosing) {
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(450, t + duration);
    } else {
      filter.frequency.setValueAtTime(450, t);
      filter.frequency.exponentialRampToValueAtTime(1600, t + duration);
    }
    filter.Q.setValueAtTime(2.0, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);

    // Mechanical end stop click
    setTimeout(() => {
      if (this.isMuted) return;
      const endCtx = this.getContext();
      if (!endCtx) return;
      const tEnd = endCtx.currentTime;
      const click = endCtx.createOscillator();
      const clickGain = endCtx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(320, tEnd);
      click.frequency.exponentialRampToValueAtTime(80, tEnd + 0.03);
      clickGain.gain.setValueAtTime(0.25, tEnd);
      clickGain.gain.exponentialRampToValueAtTime(0.001, tEnd + 0.03);
      click.connect(clickGain);
      clickGain.connect(endCtx.destination);
      click.start(tEnd);
      click.stop(tEnd + 0.035);
    }, duration * 1000 * 0.85);
  }

  // 3. CRT TV Channel Zapping / Static Click
  public playCrtZap() {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // 15.75 kHz vintage CRT flyback whine burst
    const flyback = ctx.createOscillator();
    const flybackGain = ctx.createGain();
    flyback.type = 'sine';
    flyback.frequency.setValueAtTime(14000, t);
    flybackGain.gain.setValueAtTime(0.05, t);
    flybackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    flyback.connect(flybackGain);
    flybackGain.connect(ctx.destination);
    flyback.start(t);
    flyback.stop(t + 0.12);

    // Mechanical TV knob rotary detent click
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.04);
    oscGain.gain.setValueAtTime(0.28, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.045);

    // Static chirp
    const bufferSize = Math.floor(ctx.sampleRate * 0.05);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.15, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    noise.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(t);
  }

  // 4. 8-Bit Retro Gaming Chiptune Beep (Sega/Nintendo style)
  public play8BitBeep(freq = 587.33, length = 0.09) {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, t);
    // Subtle retro vibrato/arpeggio
    osc.frequency.setValueAtTime(freq * 1.5, t + length * 0.35);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.setValueAtTime(0.18, t + length * 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, t + length);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + length + 0.01);
  }

  // 5. Object Lifted / Picked Up (Subtle soft whoosh)
  public playPickup() {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.12);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  // 6. Object Dropped / Released with Bounce (Acoustic soft wooden/vinyl tap)
  public playDrop() {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.09);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);

    // Second smaller bounce echo
    setTimeout(() => {
      if (this.isMuted) return;
      const bCtx = this.getContext();
      if (!bCtx) return;
      const tb = bCtx.currentTime;
      const bOsc = bCtx.createOscillator();
      const bGain = bCtx.createGain();
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(120, tb);
      bOsc.frequency.exponentialRampToValueAtTime(40, tb + 0.05);
      bGain.gain.setValueAtTime(0.12, tb);
      bGain.gain.exponentialRampToValueAtTime(0.001, tb + 0.05);
      bOsc.connect(bGain);
      bGain.connect(bCtx.destination);
      bOsc.start(tb);
      bOsc.stop(tb + 0.055);
    }, 70);
  }

  // 7. Manga Book Page Flip / Paper rustle
  public playPageFlip() {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.14);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.frequency.linearRampToValueAtTime(1400, t + 0.14);
    filter.Q.setValueAtTime(1.8, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);
  }
}

export const dioramaAudio = new DioramaSoundEngine();
