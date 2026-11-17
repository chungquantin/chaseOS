"use client";

/**
 * Original generative lo-fi, synthesised live with Web Audio — no audio
 * files, no licensing. A slow ii–V–I-ish loop of warm pads with a soft
 * bassline, a sparse pentatonic melody, swung drums and vinyl crackle.
 *
 * Browsers only allow audio after a user gesture, so call start() from a
 * click/keypress handler.
 */

const BPM = 74;
const BEAT = 60 / BPM;
const STEP = BEAT / 2; // eighth notes

// Fmaj9 → Em7 → Dm9 → Cmaj7 (two bars each), as MIDI notes
const CHORDS = [
  [53, 57, 60, 64, 67],
  [52, 55, 59, 62, 67],
  [50, 53, 57, 60, 64],
  [48, 52, 55, 59, 62],
];
const BASS = [41, 40, 38, 36];
const SCALE = [60, 62, 64, 67, 69, 72, 74, 76]; // C major pentatonic-ish

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

class LofiEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: BiquadFilterNode | null = null;
  private noise: AudioBuffer | null = null;
  private crackle: AudioBufferSourceNode | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  playing = false;

  private ensure() {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    // warm, slightly muffled master like an old tape
    this.bus = ctx.createBiquadFilter();
    this.bus.type = "lowpass";
    this.bus.frequency.value = 3800;
    this.bus.connect(this.master).connect(ctx.destination);

    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  start() {
    const ctx = this.ensure();
    if (this.playing) return;
    void ctx.resume();
    this.playing = true;
    this.nextTime = ctx.currentTime + 0.1;
    this.startCrackle();
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setTargetAtTime(0.22, ctx.currentTime, 1.2); // fade in
    this.timer = window.setInterval(() => this.schedule(), 25);
  }

  stop() {
    if (!this.ctx || !this.playing) return;
    this.playing = false;
    const ctx = this.ctx;
    this.master!.gain.setTargetAtTime(0, ctx.currentTime, 0.4); // fade out
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    window.setTimeout(() => {
      if (!this.playing) {
        this.crackle?.stop();
        this.crackle = null;
      }
    }, 2000);
  }

  /** look-ahead scheduler: queue anything due in the next 120ms */
  private schedule() {
    const ctx = this.ctx!;
    while (this.nextTime < ctx.currentTime + 0.12) {
      this.playStep(this.step, this.nextTime);
      // swing: long-short eighths
      this.nextTime += this.step % 2 === 0 ? STEP * 1.16 : STEP * 0.84;
      this.step = (this.step + 1) % 64; // 4 chords × 2 bars × 8 eighths
    }
  }

  private playStep(step: number, t: number) {
    const chord = Math.floor(step / 16);
    const inBar = step % 8;

    if (step % 16 === 0) this.pad(CHORDS[chord], t, BEAT * 8);
    if (inBar === 0 || (inBar === 5 && Math.random() < 0.6)) this.bass(hz(BASS[chord]), t, BEAT * 1.6);

    // drums: kick on 1 and the "and" of 3, snare on 2 and 4, soft hats
    if (inBar === 0 || inBar === 5) this.kick(t);
    if (inBar === 2 || inBar === 6) this.snare(t);
    this.hat(t, inBar % 2 === 0 ? 0.05 : 0.03);

    // sparse melody
    if (Math.random() < (inBar % 2 === 0 ? 0.32 : 0.14)) {
      const note = SCALE[Math.floor(Math.random() * SCALE.length)];
      this.keys(hz(note), t, BEAT * (Math.random() < 0.3 ? 1.5 : 0.7));
    }
  }

  /* ----------------------------------------------------------- voices */

  private env(t: number, peak: number, attack: number, release: number) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
    return g;
  }

  private pad(notes: number[], t: number, dur: number) {
    const ctx = this.ctx!;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(700, t);
    lp.frequency.linearRampToValueAtTime(1300, t + dur * 0.5);
    lp.frequency.linearRampToValueAtTime(800, t + dur);
    const g = this.env(t, 0.05, 1.2, dur);
    lp.connect(g).connect(this.bus!);
    for (const n of notes) {
      for (const detune of [-7, 6]) {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = hz(n);
        o.detune.value = detune;
        o.connect(lp);
        o.start(t);
        o.stop(t + dur + 1.5);
      }
    }
  }

  private bass(f: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    const g = this.env(t, 0.32, 0.02, dur);
    o.connect(g).connect(this.bus!);
    o.start(t);
    o.stop(t + dur + 0.2);
  }

  private keys(f: number, t: number, dur: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = f;
    const o2 = ctx.createOscillator();
    o2.type = "sine";
    o2.frequency.value = f * 2;
    const g = this.env(t, 0.07, 0.008, dur);
    const g2 = this.env(t, 0.015, 0.008, dur * 0.6);
    o.connect(g).connect(this.bus!);
    o2.connect(g2).connect(this.bus!);
    o.start(t);
    o2.start(t);
    o.stop(t + dur + 0.2);
    o2.stop(t + dur + 0.2);
  }

  private kick(t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    const g = this.env(t, 0.5, 0.004, 0.32);
    o.connect(g).connect(this.bus!);
    o.start(t);
    o.stop(t + 0.4);
  }

  private noiseHit(t: number, type: BiquadFilterType, freq: number, peak: number, dur: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = this.env(t, peak, 0.002, dur);
    src.connect(f).connect(g).connect(this.bus!);
    src.start(t, Math.random());
    src.stop(t + dur + 0.05);
  }

  private snare(t: number) {
    this.noiseHit(t, "bandpass", 1800, 0.12, 0.18);
  }

  private hat(t: number, peak: number) {
    this.noiseHit(t, "highpass", 7000, peak, 0.05);
  }

  private startCrackle() {
    const ctx = this.ctx!;
    // sparse clicks over a quiet hiss, looped
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * 0.012 + (Math.random() < 0.0004 ? (Math.random() * 2 - 1) * 0.5 : 0);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1200;
    const g = ctx.createGain();
    g.gain.value = 0.35;
    src.connect(hp).connect(g).connect(this.master!);
    src.start();
    this.crackle = src;
  }
}

let engine: LofiEngine | null = null;
const PREF_KEY = "tc-room:music";

export const music = {
  get playing() {
    return engine?.playing ?? false;
  },
  start() {
    engine ??= new LofiEngine();
    engine.start();
    savePref(true);
  },
  stop() {
    engine?.stop();
    savePref(false);
  },
  /** visitor's last choice; defaults to on */
  wanted() {
    try {
      return window.localStorage.getItem(PREF_KEY) !== "off";
    } catch {
      return true;
    }
  },
};

function savePref(on: boolean) {
  try {
    window.localStorage.setItem(PREF_KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
}
