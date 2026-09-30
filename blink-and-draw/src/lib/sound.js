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

function tone(freq, duration, { type = 'sine', gain = 0.15, delay = 0 } = {}) {
  if (muted) return;
  unlockAudio();
  if (!ctx) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export const sfx = {
  click: () => tone(660, 0.06, { gain: 0.06 }),
  count: () => tone(523, 0.16),
  go: () => tone(880, 0.35, { gain: 0.18 }),
  tick: () => tone(1320, 0.05, { gain: 0.07 }),
  warn: () => tone(740, 0.12, { type: 'square', gain: 0.05 }),
  buzzer: () => tone(160, 0.8, { type: 'sawtooth', gain: 0.12 }),
  correct: () => {
    tone(660, 0.12);
    tone(990, 0.18, { delay: 0.1 });
  },
  wrong: () => tone(220, 0.25, { type: 'triangle', gain: 0.15 }),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, { delay: i * 0.12 })),
};
