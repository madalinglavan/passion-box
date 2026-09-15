import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { getGlobalStats, addGlobalPoint, getGameStats, saveGameStats, resetGlobalScore } from '../src/core/stats.js';
import { getNames } from '../src/core/profile.js';
import { shuffle } from '../src/core/random.js';
import { cards } from '../games/card-game/data.js';
import { getWinningLine, winningLines } from '../games/xo/rules.js';
const data = new Map();
globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key,value) => data.set(key,value) };
beforeEach(() => data.clear());
test('malformed saved data does not break names, game scores or global scores', () => {
  for (const raw of ['{', 'null', '[]', '42', '{"he":"bad","she":-2}']) {
    for (const key of ['coupleNames','globalStats','stats','wheelStats','xoStats']) data.set(key,raw);
    assert.equal(getNames().he, raw.includes('bad') ? 'bad' : 'EL');
    assert.equal(getGlobalStats().he.score,0);
    for (const game of ['card','wheel','xo']) assert.equal(getGameStats(game).he,0);
  }
});
test('existing profile and score keys remain compatible', () => {
  data.set('coupleNames',JSON.stringify({he:'Alex',she:'Maria'}));
  data.set('stats',JSON.stringify({he:3,she:2,openedCards:[{id:'4',player:'he'}]}));
  assert.equal(getNames().he,'Alex');
  assert.equal(getGameStats('card').he,3);
  assert.equal(getGameStats('card').openedCards[0].id,'4');
});
test('invalid players, games and point values cannot corrupt scores', () => {
  for (const args of [['he','invalid',1],['invalid','card',1],['he','card',NaN],['he','card',Infinity]]) addGlobalPoint(...args);
  assert.equal(getGlobalStats().he.score,0);
  addGlobalPoint('he','card',-1); assert.equal(getGlobalStats().he.score,0);
});
test('first unlocked winner remains stable until the reward is claimed', () => {
  addGlobalPoint('he','card',10); addGlobalPoint('she','wheel',10);
  assert.equal(getGlobalStats().bigBoxWinner,'he');
  resetGlobalScore();
  assert.equal(getGlobalStats().bigBoxUnlocked,false);
  assert.equal(getGlobalStats().he.score,0);
  assert.equal(getGlobalStats().he.wins.card,1);
});
test('shuffling preserves stable card identities and accepted cards', () => {
  saveGameStats('card',{he:1,she:0,openedCards:[{id:'8',player:'he'}]});
  const mixed = shuffle(cards);
  assert.equal(new Set(mixed.map(card=>card.id)).size,45);
  assert.equal(mixed.find(card=>card.id==='8').img, cards[8].img);
  assert.equal(getGameStats('card').openedCards[0].id,'8');
});
test('XO detects every winning line and does not award a draw', () => {
  for (const line of winningLines) {
    const board = Array(9).fill(null); line.forEach(index=>board[index]='he');
    assert.deepEqual(getWinningLine(board,'he'),line);
  }
  const draw = ['he','she','he','he','she','she','she','he','he'];
  assert.equal(getWinningLine(draw,'he'),undefined); assert.equal(getWinningLine(draw,'she'),undefined);
});
