import { assetURL, getNames, getAvatar, players, defaultAvatar, saveProfile, resizeAvatar } from '../core/profile.js';
import { getGlobalStats, WIN_SCORE } from '../core/stats.js';
import { toggleSound, isSoundEnabled } from '../core/audio.js';
import { $, element, openDialog, toast } from '../core/ui.js';

export const games = [
  { id: 'cards', number: '01', title: 'Cărți de joc', short: 'Cărți de joc', description: 'O carte aleasă. O nouă surpriză.', meta: '45 DE CĂRȚI', path: 'games/card-game/index.html', symbol: '♠' },
  { id: 'wheel', number: '02', title: 'Roata surprizelor', short: 'Roata surprizelor', description: 'Puțin noroc. Multă spontaneitate.', meta: '6 POSIBILITĂȚI', path: 'games/wheel-game/index.html', symbol: '✳' },
  { id: 'xo', number: '03', title: 'X și O', short: 'X și O', description: 'Un clasic, cu o miză doar a voastră.', meta: 'STRATEGIE ÎN DOI', path: 'games/xo/index.html', symbol: '×' },
  { id: 'roleplay', number: '04', title: 'Roleplay', short: 'Roleplay', description: 'Alte personaje. Aceeași chimie.', meta: '5 PAȘI · O POVESTE', path: 'roleplay/index.html', symbol: '✦' }
];

export function mountShell(page, { eyebrow = 'COLECȚIA PASSIONBOX', title, description } = {}) {
  $('#app').innerHTML = `
    <aside class="sidebar">
      <a class="brand" href="${assetURL('index.html')}" aria-label="PassionBox — acasă"><span class="brand-mark">♡</span> passion<span>box</span><sup>®</sup></a>
      <div class="sidebar-caption">MAI APROAPE, PRIN JOACĂ.</div>
      <nav class="navigation" aria-label="Navigare principală">
        <a class="nav-link ${page === 'home' ? 'selected' : ''}" ${page === 'home' ? 'aria-current="page"' : ''} href="${assetURL('index.html')}"><span class="nav-symbol">⌂</span> Spațiul vostru</a>
        <span class="nav-heading">ALEGEȚI UN JOC</span>
        ${games.map(game => `<a class="nav-link ${page === game.id ? 'selected' : ''}" ${page === game.id ? 'aria-current="page"' : ''} href="${assetURL(game.path)}"><span class="nav-symbol">${game.symbol}</span> ${game.short}</a>`).join('')}
      </nav>
      <div class="sidebar-bottom"><div class="together-mark">♡<span>×</span>♡</div><p>Cele mai bune momente<br>încep cu voi doi.</p><button class="text-button" data-profile>Profilul vostru <span>↗</span></button></div>
      <span class="sidebar-foot">FĂCUT PENTRU CONEXIUNE</span>
    </aside>
    <div class="workspace">
      <header class="topbar"><span class="topbar-label">O PAUZĂ DE LA COTIDIAN</span><div class="topbar-actions"><button class="icon-button" id="soundButton" aria-label="Sunet" title="Sunet">♪</button><button class="icon-button" id="fullscreenButton" aria-label="Ecran complet" title="Ecran complet">⛶</button><button class="profile-pill" data-profile><span class="mini-avatars"><img data-player-avatar="he" alt=""><img data-player-avatar="she" alt=""></span><span>Voi doi</span><span>⌄</span></button></div></header>
      <main id="main" tabindex="-1">${page !== 'home' ? `<div class="page-heading"><a class="back-link" href="${assetURL('index.html')}">← Toate jocurile</a><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="muted">${description}</p></div>` : ''}<div id="pageContent"></div></main>
      <footer class="footer"><span>passionbox <span class="footer-star">✦</span> Momente de păstrat.</span><span>DOAR VOI. AICI ȘI ACUM.</span></footer>
    </div>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
    <dialog id="profileDialog" aria-labelledby="profileTitle"><div class="dialog-top"><span class="eyebrow">MICUL VOSTRU UNIVERS</span><button class="icon-button" data-close aria-label="Închide">×</button></div><h2 id="profileTitle">Să vă cunoaștem.</h2><p class="muted">Numele și avatarurile voastre, în toate jocurile.</p><form id="profileForm"><div class="profile-fields">${players.map(player => `<fieldset><legend>${player === 'he' ? 'El' : 'Ea'}</legend><label for="name-${player}">Nume</label><input id="name-${player}" name="${player}" maxlength="40" required autocomplete="off" placeholder="${player === 'he' ? 'Numele lui' : 'Numele ei'}"><div class="avatar-options" id="avatars-${player}" aria-label="Avatar ${player === 'he' ? 'el' : 'ea'}"></div><label class="upload-label">Încarcă o fotografie<input type="file" data-upload="${player}" accept="image/png,image/jpeg,image/webp"></label></fieldset>`).join('')}</div><p id="profileError" class="form-error" role="alert"></p><div class="dialog-actions"><button class="button secondary" type="button" data-close>Anulează</button><button class="button" type="submit">Salvează profilul <span>↗</span></button></div><p class="form-note">Profilul și scorurile sunt salvate în acest browser.</p></form></dialog>
    <dialog id="confirmDialog" aria-labelledby="confirmTitle"><p class="eyebrow">UN NOU ÎNCEPUT</p><h2 id="confirmTitle"></h2><p id="confirmDescription" class="muted"></p><div class="dialog-actions"><button class="button secondary" data-close>Anulează</button><button class="button" id="confirmAction">Confirmă</button></div></dialog>`;
  installProfile();
  refreshProfile();
  if (matchMedia('(max-width: 760px)').matches) {
    const selected = $('.nav-link.selected');
    if (selected) $('.navigation').scrollLeft = Math.max(0, selected.offsetLeft - 20);
  }
  window.addEventListener('passionbox:profile', refreshProfile);
  window.addEventListener('storage', () => { refreshProfile(); window.dispatchEvent(new Event('passionbox:score')); });
  window.addEventListener('passionbox:storage-unavailable', () => toast('Salvarea în browser nu este disponibilă. Datele rămân în această sesiune.'));
  document.addEventListener('click', event => { const close = event.target.closest('[data-close]'); close?.closest('dialog')?.close(); });
  const sound = $('#soundButton');
  function soundUI() { sound.setAttribute('aria-pressed', String(isSoundEnabled())); sound.title = sound.ariaLabel = isSoundEnabled() ? 'Oprește sunetul' : 'Pornește sunetul'; sound.textContent = isSoundEnabled() ? '♪' : '♫'; }
  sound.onclick = () => { toggleSound(); soundUI(); };
  soundUI();
  const fullscreen = $('#fullscreenButton');
  fullscreen.hidden = !document.fullscreenEnabled;
  fullscreen.onclick = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { toast('Ecranul complet nu este disponibil în acest browser.'); }
  };
  document.addEventListener('fullscreenchange', () => { fullscreen.setAttribute('aria-pressed', String(!!document.fullscreenElement)); fullscreen.ariaLabel = document.fullscreenElement ? 'Ieși din ecran complet' : 'Ecran complet'; });
  return $('#pageContent');
}

export function refreshProfile() {
  const names = getNames();
  document.querySelectorAll('[data-player-name]').forEach(node => { node.textContent = names[node.dataset.playerName]; });
  document.querySelectorAll('[data-player-avatar]').forEach(node => {
    node.src = getAvatar(node.dataset.playerAvatar);
    node.onerror = () => { node.onerror = null; node.src = assetURL(defaultAvatar(node.dataset.playerAvatar)); };
  });
}

export function scoreMarkup() {
  return `<div class="scoreboard" aria-label="Scorul jocului">${players.map(player => `<div class="player-score" data-score-player="${player}"><img class="avatar" data-player-avatar="${player}" alt=""><div><small>JUCĂTOR ${player === 'he' ? '01' : '02'}</small><strong data-player-name="${player}"></strong></div><b data-score>0</b><span class="active-dot" title="La rând"></span></div>`).join('')}</div>`;
}

export function globalProgress() {
  const stats = getGlobalStats();
  const leading = Math.max(stats.he.score, stats.she.score);
  return { stats, leading, percent: Math.min(100, leading / WIN_SCORE * 100) };
}

function installProfile() {
  const dialog = $('#profileDialog');
  let avatars;
  let uploads = 0;
  function showChoices(player) {
    const holder = $(`#avatars-${player}`);
    holder.replaceChildren();
    for (let i = 1; i <= 4; i++) {
      const path = `images/avatars/${player === 'he' ? 'male/m' : 'female/f'}${i}.png`;
      const button = element('button', 'avatar-choice');
      button.type = 'button';
      button.ariaLabel = `Avatar ${i}`;
      button.setAttribute('aria-pressed', String(avatars[player] === assetURL(path) || avatars[player] === path));
      const img = element('img'); img.src = assetURL(path); img.alt = '';
      button.append(img);
      button.onclick = () => { avatars[player] = path; showChoices(player); };
      holder.append(button);
    }
    if (avatars[player]?.startsWith('data:')) {
      const img = element('img', 'uploaded-preview'); img.src = avatars[player]; img.alt = 'Fotografia aleasă'; holder.append(img);
    }
  }
  document.querySelectorAll('[data-profile]').forEach(button => { button.onclick = () => {
    const names = getNames(); avatars = Object.fromEntries(players.map(player => [player, getAvatar(player)]));
    $('#profileError').textContent = '';
    players.forEach(player => { $(`#name-${player}`).value = names[player]; showChoices(player); });
    openDialog(dialog);
  }; });
  document.querySelectorAll('[data-upload]').forEach(input => { input.onchange = async () => {
    if (!input.files[0]) return;
    uploads++;
    $('#profileForm button[type="submit"]').disabled = true;
    try { avatars[input.dataset.upload] = await resizeAvatar(input.files[0]); showChoices(input.dataset.upload); $('#profileError').textContent = ''; }
    catch (error) { $('#profileError').textContent = error.message; }
    finally { input.value = ''; uploads--; $('#profileForm button[type="submit"]').disabled = uploads > 0; }
  }; });
  $('#profileForm').onsubmit = event => {
    event.preventDefault();
    if (uploads) return;
    const names = Object.fromEntries(players.map(player => [player, $(`#name-${player}`).value.trim()]));
    if (!names.he || !names.she) { $('#profileError').textContent = 'Completează ambele nume.'; return; }
    const persisted = saveProfile(names, avatars);
    dialog.close();
    toast(persisted ? 'Profilul vostru a fost salvat.' : 'Profilul este disponibil doar în această sesiune. Browserul nu permite salvarea.');
  };
}
