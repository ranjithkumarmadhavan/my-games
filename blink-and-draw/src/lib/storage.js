import { useEffect, useState } from 'react';

// localStorage can throw (private mode, blocked storage), so every access is guarded
// and the game keeps working without persistence.
export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = load(key, initial);
    const isPlainObject = initial && typeof initial === 'object' && !Array.isArray(initial);
    // Merge so settings added in later versions get their defaults.
    return isPlainObject ? { ...initial, ...stored } : stored;
  });

  useEffect(() => save(key, value), [key, value]);

  return [value, setValue];
}
