import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cards } from '../games/card-game/data.js';
import { reshuffleDeck } from '../games/card-game/deck.js';

test('every shuffle moves every action to a different numbered position', () => {
  let previous = [...cards];
  const originalIds = cards.map(card => card.id).sort();
  for (let round = 0; round < 100; round++) {
    const snapshot = [...previous];
    const next = reshuffleDeck(previous);
    assert.equal(next.length, 45);
    assert.deepEqual(next.map(card => card.id).sort(), originalIds);
    assert.ok(next.every((card, index) => card.id !== previous[index].id));
    assert.deepEqual(previous, snapshot, 'previous deck is not mutated');
    for (const card of next) assert.equal(card, cards.find(original => original.id === card.id));
    previous = next;
  }
});

test('empty and single-action decks do not loop or lose entries', () => {
  assert.deepEqual(reshuffleDeck([]), []);
  assert.deepEqual(reshuffleDeck([cards[0]]), [cards[0]]);
});
