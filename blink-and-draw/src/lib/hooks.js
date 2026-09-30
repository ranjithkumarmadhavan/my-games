import { useEffect, useRef, useState } from 'react';
import { sfx, unlockAudio } from './sound';
import { primeSpeech, speak, stopSpeaking } from './speech';

/** Keeps the screen awake on phones while `active` (where supported). */
export function useWakeLock(active) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock = null;
    let cancelled = false;

    const request = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
        if (cancelled) lock.release();
      } catch {
        /* not allowed right now */
      }
    };
    const onVisible = () => document.visibilityState === 'visible' && request();

    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release().catch(() => {});
    };
  }, [active]);
}

/**
 * Runs a 3-2-1 countdown, then steps through `words` every `intervalMs`,
 * speaking each one aloud when `speakWords` is on (otherwise a soft tick).
 * phase: 'idle' | 'countdown' | 'running' | 'done'
 */
export function useWordSequence({ words, intervalMs, speakWords }) {
  const [phase, setPhase] = useState('idle');
  const [count, setCount] = useState(3);
  const [index, setIndex] = useState(-1);

  const start = () => {
    unlockAudio();
    if (speakWords) primeSpeech();
    setIndex(-1);
    setCount(3);
    setPhase('countdown');
  };

  const stop = () => {
    stopSpeaking();
    setIndex(-1);
    setPhase('idle');
  };

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (count === 0) {
      sfx.go();
      const t = setTimeout(() => {
        setIndex(0);
        setPhase('running');
      }, 700);
      return () => clearTimeout(t);
    }
    sfx.count();
    const t = setTimeout(() => setCount((c) => c - 1), 800);
    return () => clearTimeout(t);
  }, [phase, count]);

  useEffect(() => {
    if (phase !== 'running') return;
    if (index >= words.length) {
      setPhase('done');
      return;
    }
    if (speakWords) speak(words[index], { rate: intervalMs <= 1000 ? 1.15 : 1 });
    else sfx.tick();
    const t = setTimeout(() => setIndex((i) => i + 1), intervalMs);
    return () => clearTimeout(t);
  }, [phase, index, words, intervalMs, speakWords]);

  useEffect(() => () => stopSpeaking(), []);

  return { phase, count, index, start, stop };
}

/** Countdown timer in whole seconds; ticks in the last 5 seconds, buzzes at 0. */
export function useCountdownTimer(seconds, running, onEnd) {
  const [remaining, setRemaining] = useState(seconds);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  useEffect(() => {
    if (!running) return;
    const endAt = Date.now() + seconds * 1000;
    let last = seconds;
    setRemaining(seconds);

    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      if (left === last) return;
      last = left;
      setRemaining(left);
      if (left === 0) {
        clearInterval(id);
        sfx.buzzer();
        endRef.current?.();
      } else if (left <= 5) {
        sfx.warn();
      }
    }, 200);

    return () => clearInterval(id);
  }, [seconds, running]);

  return remaining;
}
