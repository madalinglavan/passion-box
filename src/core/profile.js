import { readJSON, readText, writeJSON, writeText } from './storage.js';

export const rootURL = new URL('../../', import.meta.url);
export const assetURL = path => new URL(path.replace(/^\/+/, ''), rootURL).href;
export const players = ['he', 'she'];
export const defaultAvatar = player => `images/avatars/${player === 'he' ? 'male/m1' : 'female/f1'}.png`;

export function getNames() {
  const raw = readJSON('coupleNames', {});
  return Object.fromEntries(players.map(player => [player,
    typeof raw?.[player] === 'string' && raw[player].trim() ? raw[player].trim().slice(0, 40) : player === 'he' ? 'EL' : 'EA'
  ]));
}

export function getAvatar(player) {
  const saved = readText(player === 'he' ? 'avatarHe' : 'avatarShe', defaultAvatar(player));
  if (/^data:image\/(png|jpeg|webp);base64,/i.test(saved) || /^https?:\/\//i.test(saved)) return saved;
  if (/^\/?images\/avatars\/(male|female)\/[mf][1-4]\.png$/.test(saved)) return assetURL(saved);
  return assetURL(defaultAvatar(player));
}

export function saveProfile(names, avatars) {
  let persisted = writeJSON('coupleNames', names);
  for (const player of players) {
    const avatar = avatars[player].startsWith(rootURL.href) ? avatars[player].slice(rootURL.href.length) : avatars[player];
    persisted = writeText(player === 'he' ? 'avatarHe' : 'avatarShe', avatar) && persisted;
  }
  globalThis.dispatchEvent(new Event('passionbox:profile'));
  return persisted;
}

export async function resizeAvatar(file) {
  if (!file || !/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error('Alege o imagine JPG, PNG sau WebP.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Imaginea trebuie să aibă maximum 10 MB.');
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 240;
  const size = Math.min(bitmap.width, bitmap.height);
  canvas.getContext('2d').drawImage(bitmap, (bitmap.width-size)/2, (bitmap.height-size)/2, size, size, 0, 0, 240, 240);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.85);
}
