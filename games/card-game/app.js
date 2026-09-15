import { cards } from './data.js';
import { reshuffleDeck } from './deck.js';
import { mountGame, resultDialog } from '../../src/components/game-layout.js';
import { getGameStats, saveGameStats, resetGameStats, addGlobalPoint } from '../../src/core/stats.js';
import { getNames } from '../../src/core/profile.js';
import { shuffle, pick } from '../../src/core/random.js';
import { playSound } from '../../src/core/audio.js';
import { $, element, renderScore, confirmAction, openDialog, toast } from '../../src/core/ui.js';

mountGame('cards', { title: 'O carte. O surpriză.', description: 'Alegeți pe rând. Lăsați curiozitatea să decidă.', eyebrow: '01 / CĂRȚI DE JOC', noteTitle: 'Urmați curiozitatea.', instructions: 'Alege jucătorul, apoi o carte. Acceptarea adaugă un punct, iar refuzul scade unul, până la minimum zero. Cărțile acceptate rămân marcate.' }, `
  <div class="game-toolbar"><button class="button secondary" id="switchPlayer">Schimbă jucătorul ⇄</button><button class="button secondary" id="shuffle">Amestecă ↻</button><button class="button" id="randomCard">Alege pentru noi ⚄</button><button class="text-button" id="resetScore">Resetează jocul</button></div><p class="game-status" id="status" role="status"></p><div class="cards-board" id="board"></div><p class="cards-count" id="cardsCount"></p>${resultDialog('cardDialog','CARTEA ALEASĂ')}`);
let currentPlayer = 'he';
let order = shuffle(cards);
let selectedCard = null;
let selectedPlayer = null;
const dialog = $('#cardDialog');

function render() {
  const stats = getGameStats('card');
  const opened = new Set(stats.openedCards.map(card => String(card.id)));
  $('#board').replaceChildren();
  for (const [position, card] of order.entries()) {
    const used = opened.has(card.id);
    const button = element('button', `playing-card${used ? ' used' : ''}`);
    button.type = 'button';
    button.dataset.cardPosition = String(position);
    button.ariaLabel = `Cartea ${position + 1}${used ? ', deja acceptată' : ''}`;
    button.disabled = used;
    button.append(element('span', 'playing-card-number', String(position + 1).padStart(2, '0')), element('span', 'playing-card-symbol', used ? '✓' : '✳'), element('span', 'playing-card-brand', used ? getNames()[stats.openedCards.find(entry => String(entry.id) === card.id).player] : 'PASSIONBOX'));
    button.onclick = () => reveal(card, position);
    $('#board').append(button);
  }
  $('#cardsCount').textContent = `${opened.size} din ${cards.length} cărți descoperite`;
  $('#randomCard').disabled = opened.size === cards.length;
  $('#status').textContent = opened.size === cards.length ? 'Toate cărțile au fost descoperite. Începeți din nou când doriți.' : `La rând: ${getNames()[currentPlayer]}`;
  renderScore(stats, currentPlayer);
}
function reveal(card, position) {
  if (dialog.open) return;
  selectedCard = card;
  selectedPlayer = currentPlayer;
  $('#resultImage').src = card.img;
  $('#resultImage').alt = `Cartea ${position + 1}`;
  $('#resultText').textContent = card.text;
  playSound('games/card-game/sounds/card_flip.mp3');
  openDialog(dialog);
}
function decide(accepted) {
  if (!selectedCard) return;
  const stats = getGameStats('card');
  if (accepted) stats.openedCards.push({ id: selectedCard.id, player: selectedPlayer });
  stats[selectedPlayer] = Math.max(0, stats[selectedPlayer] + (accepted ? 1 : -1));
  saveGameStats('card', stats);
  addGlobalPoint(selectedPlayer, 'card', accepted ? 1 : -1);
  selectedCard = null;
  dialog.close();
  playSound(accepted ? 'games/card-game/sounds/accept1.mp3' : 'games/card-game/sounds/reject.mp3');
  render();
}
$('#accept').onclick = () => decide(true);
$('#reject').onclick = () => decide(false);
dialog.addEventListener('close', () => { selectedCard = null; });
$('#switchPlayer').onclick = () => { currentPlayer = currentPlayer === 'he' ? 'she' : 'he'; render(); };
$('#shuffle').onclick = () => { order = reshuffleDeck(order); render(); playSound('games/card-game/sounds/shuffle.mp3'); };
$('#randomCard').onclick = () => {
  const opened = new Set(getGameStats('card').openedCards.map(card => String(card.id)));
  const card = pick(order.filter(card => !opened.has(card.id)));
  if (card) reveal(card, order.indexOf(card));
};
$('#resetScore').onclick = () => confirmAction('O luăm de la capăt?', 'Scorul jocului și cărțile acceptate se vor reseta. Progresul comun rămâne păstrat.', () => { resetGameStats('card'); order = reshuffleDeck(order); render(); toast('Jocul de cărți a fost resetat.'); });
window.addEventListener('passionbox:profile', render);
window.addEventListener('pageshow', event => {
  if (!event.persisted) return;
  // Back/Forward may restore the document without evaluating this module again.
  if (dialog.open) dialog.close();
  selectedCard = null;
  order = reshuffleDeck(order);
  render();
});
render();
