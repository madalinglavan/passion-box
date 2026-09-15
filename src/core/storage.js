// Keep the original keys so existing profiles and scores survive the redesign.
const memory = new Map();

export function readText(key, fallback = null) {
  if (memory.has(key)) return memory.get(key);
  try { return localStorage.getItem(key) ?? fallback; }
  catch { return fallback; }
}

export function writeText(key, value) {
  try {
    localStorage.setItem(key, value);
    memory.delete(key);
    return true;
  } catch {
    memory.set(key, value);
    globalThis.dispatchEvent?.(new Event('passionbox:storage-unavailable'));
    return false;
  }
}

export function readJSON(key, fallback) {
  try { return JSON.parse(readText(key)) ?? structuredClone(fallback); }
  catch { return structuredClone(fallback); }
}

export const writeJSON = (key, value) => writeText(key, JSON.stringify(value));
export const count = value => Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
