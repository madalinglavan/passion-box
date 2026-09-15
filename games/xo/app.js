import { gifts } from './data.js';
import { getWinningLine } from './rules.js';
import { mountGame } from '../../src/components/game-layout.js';
import { getGameStats, saveGameStats, resetGameStats, addGlobalPoint } from '../../src/core/stats.js';
import { getNames } from '../../src/core/profile.js';
import { pick } from '../../src/core/random.js';
import { playSound } from '../../src/core/audio.js';
import { $, element, renderScore, confirmAction, openDialog } from '../../src/core/ui.js';

mountGame('xo', { title: 'Un clasic. În felul vostru.', description: 'Trei simboluri la rând. Un motiv în plus să zâmbiți.', eyebrow: '03 / X ȘI O', noteTitle: 'Puțină strategie în doi.', instructions: 'El joacă cu X, ea cu O. Aliniați trei simboluri pe orizontală, verticală sau diagonală. Câștigătorul primește un punct și o surpriză.' }, `
  <div class="game-toolbar"><button class="button secondary" id="switchPlayer">Schimbă cine începe ⇄</button><button class="text-button" id="resetScore">Resetează scorul</button></div><p class="game-status" id="status" role="status"></p><div class="xo-board" id="board" aria-label="Tabla X și O"></div><div class="xo-actions"><button class="button secondary" id="restart">Rundă nouă ↻</button><button class="button" id="gift" hidden>Descoperă surpriza ↗</button></div><dialog id="giftDialog" aria-labelledby="giftTitle"><p class="eyebrow">O VICTORIE DE SĂRBĂTORIT</p><h2 id="giftTitle"></h2><img id="giftImage" class="result-image" alt="Surpriza câștigătorului"><p id="giftText" class="result-label"></p><div class="dialog-actions"><button class="button" data-close>Frumos jucat ♡</button></div></dialog>`);
let board = Array(9).fill(null);
let player = 'he';
let winner = null;
let finished = false;
let reward = null;

function render() {
  $('#board').replaceChildren();
  const line = winner ? getWinningLine(board, winner) : [];
  board.forEach((value, index) => {
    const cell = element('button', `xo-cell ${value ?? ''}${line?.includes(index) ? ' winning' : ''}`, value ? value === 'he' ? '×' : '○' : '');
    cell.ariaLabel = `Rândul ${Math.floor(index / 3) + 1}, coloana ${index % 3 + 1}: ${value ? value === 'he' ? 'X' : 'O' : 'liber'}`;
    cell.disabled = finished || !!value;
    cell.onclick = () => move(index);
    $('#board').append(cell);
  });
  $('#status').textContent = winner ? `${getNames()[winner]} a câștigat!` : finished ? 'Egalitate. Încă o rundă?' : `La rând: ${getNames()[player]} · ${player === 'he' ? 'X' : 'O'}`;
  $('#switchPlayer').disabled = board.some(Boolean);
  $('#gift').hidden = !winner;
  renderScore(getGameStats('xo'), winner || player);
}
function move(index) {
  if (finished || board[index]) return;
  board[index] = player;
  playSound('games/xo/sounds/move.mp3');
  if (getWinningLine(board, player)) {
    winner = player; finished = true; reward = pick(gifts);
    const stats = getGameStats('xo'); stats[player]++;
    saveGameStats('xo', stats); addGlobalPoint(player, 'xo');
    playSound('games/xo/sounds/accept1.mp3');
  } else if (board.every(Boolean)) finished = true;
  else player = player === 'he' ? 'she' : 'he';
  render();
}
function restart() { board = Array(9).fill(null); winner = null; reward = null; finished = false; render(); }
$('#restart').onclick = () => { if (!finished && board.some(Boolean)) confirmAction('Începeți o rundă nouă?', 'Tabla curentă va fi golită. Scorul rămâne păstrat.', restart); else restart(); };
$('#switchPlayer').onclick = () => { if (board.some(Boolean)) return; player = player === 'he' ? 'she' : 'he'; render(); };
$('#resetScore').onclick = () => confirmAction('Resetăm scorul?', 'Se resetează doar scorul X și O. Progresul comun rămâne păstrat.', () => { resetGameStats('xo'); render(); });
$('#gift').onclick = () => { if (!winner || !reward) return; $('#giftTitle').textContent = `Felicitări, ${getNames()[winner]}!`; $('#giftImage').src = reward.img; $('#giftText').textContent = reward.label; openDialog($('#giftDialog')); };
window.addEventListener('passionbox:profile', render);
render();
