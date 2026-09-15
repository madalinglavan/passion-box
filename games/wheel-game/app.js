import { wheelItems } from './data.js';
import { mountGame, resultDialog } from '../../src/components/game-layout.js';
import { getGameStats, saveGameStats, resetGameStats, addGlobalPoint } from '../../src/core/stats.js';
import { getNames } from '../../src/core/profile.js';
import { playSound } from '../../src/core/audio.js';
import { $, renderScore, confirmAction, openDialog } from '../../src/core/ui.js';

mountGame('wheel', { title: 'Lăsați puțin loc norocului.', description: 'O rotire și șase posibilități. Restul depinde de voi.', eyebrow: '02 / ROATA SURPRIZELOR', noteTitle: 'Un strop de spontaneitate.', instructions: 'Apasă butonul pentru a roti. Poți și să îl ții apăsat pentru mai multă putere. Acceptă sau refuză rezultatul înainte de următoarea rotire.' }, `
  <div class="game-toolbar"><button class="button secondary" id="switchPlayer">Schimbă jucătorul ⇄</button><button class="text-button" id="resetScore">Resetează scorul</button></div><p class="game-status" id="status" role="status"></p><div class="wheel-stage"><span class="wheel-pointer" aria-hidden="true"></span><div id="wheel" class="wheel" aria-label="Roată cu șase segmente">${wheelItems.map((_, index) => `<span class="wheel-symbol" style="--i:${index}">${['♡','✦','♧','✳','◇','☾'][index]}</span>`).join('')}</div><div class="wheel-hub" aria-hidden="true">pb.</div></div><div class="spin-controls"><button class="button" id="spin">Rotește roata <span>↻</span></button><div class="charge-track"><div id="charge"></div></div><p>Apasă sau ține apăsat, apoi eliberează.</p></div>${resultDialog('wheelDialog','ROATA A ALES')}`);
let player = 'he';
let state = 'idle';
let rotation = 0;
let started = 0;
let frame;
let resultPlayer;
const spin = $('#spin');
const dialog = $('#wheelDialog');
function render() {
  renderScore(getGameStats('wheel'), player);
  $('#status').textContent = state === 'spinning' ? 'Un moment de suspans…' : `La rând: ${getNames()[player]}`;
  $('#switchPlayer').disabled = $('#resetScore').disabled = state !== 'idle';
  spin.disabled = state === 'spinning' || state === 'result';
}
function charge() {
  if (state !== 'idle') return;
  state = 'charging'; started = performance.now();
  function update() { $('#charge').style.width = `${Math.min(100, (performance.now() - started) / 15)}%`; frame = requestAnimationFrame(update); }
  update(); render();
}
function cancelCharge() { cancelAnimationFrame(frame); state = 'idle'; $('#charge').style.width = '0%'; render(); }
function release() {
  if (state !== 'charging') return;
  cancelAnimationFrame(frame);
  const power = Math.min(1, (performance.now() - started) / 1500);
  state = 'spinning'; resultPlayer = player;
  rotation += 360 * (4 + Math.floor(power * 3)) + Math.random() * 360;
  $('#wheel').style.transform = `rotate(${rotation}deg)`;
  $('#charge').style.width = '0%';
  playSound('games/wheel-game/sounds/spin.mp3');
  render();
  setTimeout(() => {
    const index = Math.floor(((360 - rotation % 360) % 360) / (360 / wheelItems.length));
    const result = wheelItems[index];
    $('#resultImage').src = result.img;
    $('#resultImage').alt = 'Rezultatul roții';
    $('#resultText').textContent = result.label;
    state = 'result'; render(); openDialog(dialog);
  }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 3200);
}
spin.onpointerdown = event => { if (event.button !== 0) return; spin.setPointerCapture(event.pointerId); charge(); };
spin.onpointerup = release;
spin.onpointercancel = () => { if (state === 'charging') cancelCharge(); };
spin.onclick = event => { if (event.detail === 0 && state === 'idle') { charge(); release(); } };
window.addEventListener('blur', () => { if (state === 'charging') cancelCharge(); });
dialog.addEventListener('cancel', event => event.preventDefault());
function decide(accepted) {
  if (state !== 'result') return;
  const stats = getGameStats('wheel');
  stats[resultPlayer] = Math.max(0, stats[resultPlayer] + (accepted ? 1 : -1));
  saveGameStats('wheel', stats); addGlobalPoint(resultPlayer, 'wheel', accepted ? 1 : -1);
  dialog.close(); state = 'idle'; render();
  playSound(accepted ? 'games/wheel-game/sounds/accept1.mp3' : 'games/wheel-game/sounds/reject.mp3');
}
$('#accept').onclick = () => decide(true); $('#reject').onclick = () => decide(false);
$('#switchPlayer').onclick = () => { if (state !== 'idle') return; player = player === 'he' ? 'she' : 'he'; render(); };
$('#resetScore').onclick = () => confirmAction('Remiză și un nou început?', 'Se resetează doar scorul roții. Progresul comun rămâne păstrat.', () => { resetGameStats('wheel'); render(); });
window.addEventListener('passionbox:profile', render);
render();
