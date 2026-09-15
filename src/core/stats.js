import { readJSON, writeJSON, count } from './storage.js';

export const WIN_SCORE = 10;
const gameKeys = { card: 'stats', wheel: 'wheelStats', xo: 'xoStats' };
export function getGameStats(game) {
  const raw = readJSON(gameKeys[game], {});
  return {
    he: count(raw?.he), she: count(raw?.she),
    openedCards: Array.isArray(raw?.openedCards) ? raw.openedCards.filter(card => card && /^(?:[0-9]|[1-3][0-9]|4[0-4])$/.test(card.id) && ['he','she'].includes(card.player)) : []
  };
}
export function saveGameStats(game, stats) {
  writeJSON(gameKeys[game], { ...stats, cardsOpened: stats.openedCards?.length ?? 0 });
}
export function resetGameStats(game) { saveGameStats(game, { he: 0, she: 0, openedCards: [] }); }

export function getGlobalStats() {
  const raw = readJSON('globalStats', {});
  const result = {};
  for (const player of ['he', 'she']) {
    result[player] = { score: count(raw?.[player]?.score), wins: {} };
    for (const game of Object.keys(gameKeys)) result[player].wins[game] = count(raw?.[player]?.wins?.[game]);
  }
  result.bigBoxUnlocked = raw?.bigBoxUnlocked === true && ['he','she'].includes(raw?.bigBoxWinner);
  result.bigBoxWinner = result.bigBoxUnlocked ? raw.bigBoxWinner : null;
  return result;
}

export function addGlobalPoint(player, game, value = 1) {
  if (!['he','she'].includes(player) || !Object.hasOwn(gameKeys, game) || !Number.isInteger(value)) return;
  const stats = getGlobalStats();
  stats[player].score = Math.max(0, stats[player].score + value);
  stats[player].wins[game] = Math.max(0, stats[player].wins[game] + Math.sign(value));
  if (!stats.bigBoxUnlocked && value > 0 && stats[player].score >= WIN_SCORE) {
    stats.bigBoxUnlocked = true;
    stats.bigBoxWinner = player;
  }
  writeJSON('globalStats', stats);
  globalThis.dispatchEvent?.(new Event('passionbox:score'));
}

export function resetGlobalScore() {
  const stats = getGlobalStats();
  stats.he.score = stats.she.score = 0;
  stats.bigBoxUnlocked = false;
  stats.bigBoxWinner = null;
  writeJSON('globalStats', stats);
  globalThis.dispatchEvent?.(new Event('passionbox:score'));
}
