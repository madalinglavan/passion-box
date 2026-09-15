import { shuffle } from '../../src/core/random.js';

// IDs belong to actions and are used only for progress. Visible numbers belong
// to board positions. On reshuffle, no action keeps its previous position.
export function reshuffleDeck(previous) {
  if (previous.length < 2) return [...previous];
  let next;
  do {
    next = shuffle(previous);
  } while (next.some((card, index) => card.id === previous[index].id));
  return next;
}
