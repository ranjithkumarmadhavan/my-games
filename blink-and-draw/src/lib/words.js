import easy from '../data/easy.json';
import medium from '../data/medium.json';
import hard from '../data/hard.json';
import { load, save } from './storage';

export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', blurb: 'Simple things: cat, sun, pizza', words: easy },
  { id: 'medium', label: 'Medium', blurb: 'More detail: lighthouse, cactus, harp', words: medium },
  { id: 'hard', label: 'Hard', blurb: 'Tricky ideas: jealousy, traffic jam, echo', words: hard },
];

function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Picks `count` random words for a level without repeating words from earlier
 * rounds on this device. Once a level's pool runs out, a fresh cycle starts.
 */
export function pickWords(level, count) {
  const list = DIFFICULTIES.find((d) => d.id === level).words;
  const key = `bd-used-${level}`;

  let used = new Set(load(key, []));
  let picked = shuffle(list.filter((w) => !used.has(w))).slice(0, count);

  if (picked.length < count) {
    used = new Set();
    const rest = shuffle(list.filter((w) => !picked.includes(w)));
    picked = picked.concat(rest.slice(0, count - picked.length));
  }

  picked.forEach((w) => used.add(w));
  save(key, [...used]);
  return picked;
}

export { shuffle };
