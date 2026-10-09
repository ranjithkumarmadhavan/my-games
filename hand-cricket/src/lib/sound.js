// Tiny synthesized sound effects (no audio files to load).
let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
  } catch {
    ctx = null;
  }
}

function tone(freq, duration, { type = 'sine', gain = 0.15, delay = 0, slide } = {}) {
  if (muted) return;
  unlockAudio();
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + duration);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export const sfx = {
  pick: () => tone(700, 0.07, { gain: 0.07 }),
  tick: () => tone(1200, 0.05, { gain: 0.05 }),
  bat: () => {
    tone(180, 0.08, { type: 'square', gain: 0.12 });
    tone(900, 0.12, { delay: 0.03, gain: 0.08 });
  },
  boundary: () => [523, 659, 784].forEach((f, i) => tone(f, 0.18, { delay: i * 0.09 })),
  out: () => tone(520, 0.6, { type: 'sawtooth', gain: 0.1, slide: 110 }),
  whistle: () => tone(1800, 0.35, { gain: 0.06, slide: 2200 }),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, { delay: i * 0.12 })),
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.3, { type: 'triangle', delay: i * 0.15 })),
};
