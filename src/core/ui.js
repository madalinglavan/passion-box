export const $ = selector => document.querySelector(selector);
export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
let toastTimer;
export function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('visible'), 3500);
}

export function openDialog(dialog) {
  dialog.showModal();
  dialog.querySelector('input, button')?.focus();
}

export function confirmAction(title, description, action) {
  const dialog = $('#confirmDialog');
  $('#confirmTitle').textContent = title;
  $('#confirmDescription').textContent = description;
  $('#confirmAction').onclick = () => { dialog.close(); action(); };
  openDialog(dialog);
}

export function renderScore(stats, active) {
  for (const player of ['he','she']) {
    const item = $(`[data-score-player="${player}"]`);
    if (!item) continue;
    item.classList.toggle('active', active === player);
    item.querySelector('[data-score]').textContent = stats[player];
    item.setAttribute('aria-label', `${item.querySelector('[data-player-name]').textContent}: ${stats[player]} puncte${active === player ? ', la rând' : ''}`);
  }
}
