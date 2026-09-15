import { mountShell, games, refreshProfile, globalProgress } from '../components/shell.js';
import { getNames, assetURL } from '../core/profile.js';
import { resetGlobalScore, WIN_SCORE } from '../core/stats.js';
import { rewards } from '../core/rewards.js';
import { pick } from '../core/random.js';
import { $, openDialog } from '../core/ui.js';

const content = mountShell('home');
content.innerHTML = `
  <section class="hero" aria-labelledby="heroTitle">
    <div class="hero-copy"><p class="eyebrow"><span class="tiny-line"></span> TIMP DE CALITATE. ÎN DOI.</p><h1 id="heroTitle">O seară.<br>Doar <em>voi doi.</em></h1><p class="hero-description">Lăsați rutina la ușă. Alegeți un joc, descoperiți<br class="desktop-break"> ceva nou și bucurați-vă de timpul vostru.</p><div class="hero-actions"><a class="button" href="#games">Descoperă jocurile <span>↗</span></a><button class="surprise-button" id="randomGame"><span>⚄</span> Surprinde-ne</button></div><div class="hero-footnote"><span>✦</span> Puțină joacă. Mai multă conexiune.</div></div>
    <div class="hero-art" aria-hidden="true"><span class="art-label">THE ART OF<br>BEING TOGETHER.</span><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="art-star star-one">✦</span><span class="art-star star-two">✧</span><div class="art-card card-peach"><span class="card-corner">02<br>♡</span><span class="art-heart">♡</span><span class="art-card-caption">a little closer</span></div><div class="art-card card-wine"><span class="card-corner">01<br>✦</span><span class="art-flower">✳</span><span class="art-card-caption">let's play.</span><span class="card-corner corner-bottom">✦</span></div><div class="art-seal">JUST<br><strong>US.</strong></div><span class="art-bottom">EST. FOR TWO &nbsp; — &nbsp; PASSIONBOX</span></div>
  </section>
  <section class="collection" id="games" aria-labelledby="collectionTitle"><div class="section-heading"><div><p class="eyebrow">UN MIC MENIU DE POSIBILITĂȚI</p><h2 id="collectionTitle">Cu ce începem?</h2></div><span class="collection-count">04 jocuri, nenumărate momente</span></div><div class="game-grid">${games.map(game => `<a class="game-card game-${game.id}" href="${assetURL(game.path)}"><div class="game-card-art"><span class="game-number">${game.number}</span><div class="game-illustration illustration-${game.id}">${game.id === 'cards' ? '<span>♡</span><span>♠</span>' : game.id === 'wheel' ? '<span>✳</span>' : game.id === 'xo' ? '<span>×</span><span>○</span>' : '<span>✦</span><span>✧</span>'}</div><span class="game-arrow">↗</span></div><div class="game-card-copy"><p class="game-meta">${game.meta}</p><h3>${game.title}</h3><p>${game.description}</p></div></a>`).join('')}</div></section>
  <section class="connection-panel" aria-labelledby="progressTitle"><div class="connection-intro"><span class="connection-icon">♡</span><div><p class="eyebrow">FIECARE JOC VĂ ADUCE MAI APROAPE</p><h3 id="progressTitle">Mica voastră competiție.</h3><p>Primul la ${WIN_SCORE} puncte deblochează o surpriză.</p></div></div><div class="global-players">${['he','she'].map(player => `<div class="global-player"><img class="avatar" data-player-avatar="${player}" alt=""><div><strong data-player-name="${player}"></strong><span><b id="global-${player}">0</b> puncte</span></div></div>`).join('')}</div><button class="reward-progress" id="rewardButton"><span><span id="rewardLabel">Următoarea surpriză</span><strong id="progressCount">0 / 10</strong></span><span class="progress-track"><span id="globalProgress"></span></span><small id="rewardHint">Puțin câte puțin, împreună.</small></button></section>
  <dialog id="rewardDialog" aria-labelledby="rewardTitle"><p class="eyebrow">UN MOMENT DE SĂRBĂTORIT</p><h2 id="rewardTitle"></h2><p id="rewardText" class="result-label"></p><div class="dialog-actions"><button class="button secondary" data-close>Mai târziu</button><button class="button" id="claimReward">Începeți o nouă rundă ↗</button></div></dialog>`;
refreshProfile();
function update() {
  const { stats, leading, percent } = globalProgress();
  for (const player of ['he','she']) $(`#global-${player}`).textContent = stats[player].score;
  $('#progressCount').textContent = `${Math.min(leading, WIN_SCORE)} / ${WIN_SCORE}`;
  $('#globalProgress').style.width = `${percent}%`;
  $('#rewardLabel').textContent = stats.bigBoxUnlocked ? 'Surpriza voastră este aici ↗' : 'Următoarea surpriză';
  $('#rewardHint').textContent = stats.bigBoxUnlocked ? 'Apasă pentru a o descoperi.' : 'Puțin câte puțin, împreună.';
  $('#rewardButton').disabled = !stats.bigBoxUnlocked;
}
$('#randomGame').onclick = () => { location.href = assetURL(pick(games).path); };
let currentReward;
$('#rewardButton').onclick = () => {
  const { stats } = globalProgress();
  if (!stats.bigBoxUnlocked) return;
  $('#rewardTitle').textContent = `Felicitări, ${getNames()[stats.bigBoxWinner]}!`;
  currentReward ??= pick(rewards);
  $('#rewardText').textContent = currentReward;
  openDialog($('#rewardDialog'));
};
$('#claimReward').onclick = () => { resetGlobalScore(); currentReward = null; $('#rewardDialog').close(); update(); };
window.addEventListener('passionbox:score', update);
window.addEventListener('pageshow', update);
update();
