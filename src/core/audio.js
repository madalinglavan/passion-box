import { assetURL } from './profile.js';
import { readText, writeText } from './storage.js';

const clips = new Map();
let enabled = readText('pb_sound', 'true') === 'true';
export const isSoundEnabled = () => enabled;
export function toggleSound() {
  enabled = !enabled;
  writeText('pb_sound', String(enabled));
  if (!enabled) for (const audio of clips.values()) audio.pause();
  return enabled;
}
export function playSound(path, volume = 0.35) {
  if (!enabled) return;
  if (!clips.has(path)) clips.set(path, new Audio(assetURL(path)));
  const audio = clips.get(path);
  audio.volume = volume;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
