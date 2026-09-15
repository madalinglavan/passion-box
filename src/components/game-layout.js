import { mountShell, scoreMarkup, refreshProfile } from './shell.js';

export function mountGame(page, options, markup) {
  const content = mountShell(page, options);
  content.innerHTML = `<div class="game-layout"><section class="game-surface" aria-label="Zona de joc">${markup}</section><aside class="game-aside">${scoreMarkup()}<div class="game-note"><p class="eyebrow">CUM SE JOACĂ</p><h3>${options.noteTitle}</h3><p>${options.instructions}</p><hr><p>Scorul acestui joc este separat de progresul comun. Punctele câștigate contribuie și la surpriza de pe pagina principală.</p><p>Ritmul îl alegeți voi.</p></div></aside></div>`;
  refreshProfile();
}

export const resultDialog = (id, title) => `<dialog id="${id}" aria-labelledby="resultTitle"><p class="eyebrow">${title}</p><h2 id="resultTitle">Surpriza voastră.</h2><img class="result-image" id="resultImage" alt=""><p class="result-label" id="resultText"></p><div class="dialog-actions"><button class="button secondary" id="reject">Refuză</button><button class="button" id="accept">Acceptă <span>↗</span></button></div></dialog>`;
