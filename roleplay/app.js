import { getOptions, buildStory } from './data.js';
import { mountShell } from '../src/components/shell.js';
import { getNames } from '../src/core/profile.js';
import { pick } from '../src/core/random.js';
import { playSound } from '../src/core/audio.js';
import { $, confirmAction } from '../src/core/ui.js';

const content = mountShell('roleplay', { title: 'Aceiași voi. O altă poveste.', description: 'Cinci alegeri mici deschid o lume nouă.', eyebrow: '04 / ROLEPLAY' });
content.innerHTML = `<section class="roleplay-layout"><div class="roleplay-card"><div class="step-heading"><span class="eyebrow" id="stepCount"></span><button class="text-button" id="restart">De la început ↻</button></div><div class="steps" aria-label="Progres"><span></span><span></span><span></span><span></span><span></span></div><div id="selectionPanel"><span class="roleplay-emblem" aria-hidden="true">✦</span><h2 id="stepTitle"></h2><p class="step-description">Lăsați întâmplarea să aleagă un detaliu al poveștii.</p><div class="selection-result" id="selection" role="status">Ce rol vă rezervă seara?</div><div class="roleplay-actions"><button class="button secondary" id="roll">Alege aleatoriu ⚄</button><button class="button" id="next" disabled>Continuă ↗</button></div><button class="text-button previous" id="previous" hidden>← Pasul anterior</button></div><article class="story" id="story" hidden><h2>Povestea voastră.</h2><p id="storyText"></p><button class="button secondary" id="newStory">O altă poveste ↻</button></article></div><aside class="roleplay-aside"><p class="eyebrow">CADRUL POVEȘTII</p><h3>Din cinci detalii,<br>ceva doar al vostru.</h3><ol id="summary"><li>Personajul lui<span>Încă de descoperit</span></li><li>Personajul ei<span>Încă de descoperit</span></li><li>Locul<span>Încă de descoperit</span></li><li>Elementul cheie<span>Încă de descoperit</span></li><li>Dinamica<span>Încă de descoperit</span></li></ol><p class="roleplay-aside-note">O poveste fără punctaje.<br>Doar imaginația voastră.</p></aside></section>`;
const keys = ['male','female','location','object','control'];
let names = getNames();
let options = getOptions(names.he, names.she);
let selections = {};
let step = 0;
let rolling = false;
let timer;
function render() {
  const complete = step === keys.length;
  $('#stepCount').textContent = complete ? 'POVESTEA ESTE GATA' : `PASUL ${step + 1} DIN ${keys.length}`;
  document.querySelectorAll('.steps span').forEach((node, index) => { node.classList.toggle('done', index < step); node.classList.toggle('current', index === step); });
  $('#selectionPanel').hidden = complete;
  $('#story').hidden = !complete;
  if (complete) $('#storyText').textContent = buildStory(selections, names.he, names.she);
  else {
    $('#stepTitle').textContent = [`${names.he}, cine vei fi?`, `${names.she}, cine vei fi?`, 'Unde începe povestea?', 'Ce detaliu schimbă totul?', 'Cine conduce scena?'][step];
    $('#selection').textContent = selections[keys[step]] || 'Apasă zarul și descoperă.';
    $('#selection').classList.toggle('chosen', !!selections[keys[step]]);
    $('#next').disabled = !selections[keys[step]] || rolling;
    $('#next').textContent = step === 4 ? 'Descoperă povestea ↗' : 'Continuă ↗';
    $('#previous').hidden = step === 0;
  }
  document.querySelectorAll('#summary li').forEach((node, index) => { node.classList.toggle('complete', !!selections[keys[index]]); node.querySelector('span').textContent = selections[keys[index]] || 'Încă de descoperit'; });
}
$('#roll').onclick = () => {
  if (rolling) return;
  rolling = true;
  $('#roll').disabled = $('#next').disabled = $('#previous').disabled = true;
  playSound('roleplay/sounds/dice.mp3');
  let count = 0;
  timer = setInterval(() => {
    $('#selection').textContent = pick(options[keys[step]]);
    if (++count >= (matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 8)) {
      clearInterval(timer); selections[keys[step]] = pick(options[keys[step]]); rolling = false;
      $('#roll').disabled = $('#previous').disabled = false; render();
    }
  }, 65);
};
$('#next').onclick = () => { if (rolling || !selections[keys[step]]) return; step++; render(); };
$('#previous').onclick = () => { if (rolling || step === 0) return; step--; render(); };
function restart() { clearInterval(timer); rolling = false; step = 0; selections = {}; names = getNames(); options = getOptions(names.he, names.she); $('#roll').disabled = $('#previous').disabled = false; render(); }
$('#restart').onclick = () => { if (rolling || Object.keys(selections).length) confirmAction('O altă poveste?', 'Alegerile curente vor fi înlocuite. Profilul vostru rămâne păstrat.', restart); else restart(); };
$('#newStory').onclick = restart;
window.addEventListener('passionbox:profile', () => {
  const controlIndex = options.control.indexOf(selections.control);
  names = getNames();
  options = getOptions(names.he, names.she);
  if (controlIndex >= 0) selections.control = options.control[controlIndex];
  render();
});
render();
