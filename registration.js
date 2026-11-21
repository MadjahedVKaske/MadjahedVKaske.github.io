const method = document.querySelector('#method');
const routes = [...document.querySelectorAll('[data-route]')];
const progress = document.querySelector('#progress');
const progressText = document.querySelector('#progress-text');
const progressBar = document.querySelector('#progress-bar');
const requested = new URLSearchParams(location.search).get('method');
const boxes = [...document.querySelectorAll('.checklist input')];
const checklistKey = 'azbuka-registration-checklist-v1';

try {
  const saved = JSON.parse(sessionStorage.getItem(checklistKey) || 'null');
  if (Array.isArray(saved) && saved.length === boxes.length) {
    boxes.forEach((input, index) => { input.checked = saved[index] === true; });
  }
} catch {
  // The checklist still works if browser storage is unavailable.
}

function updateProgress() {
  const items = boxes.filter(input => !input.closest('[hidden]'));
  const done = items.filter(input => input.checked).length;
  progressText.textContent = `Отмечено ${done} из ${items.length}`;
  progressBar.max = items.length;
  progressBar.value = done;
}

function showRoute() {
  const selected = method.querySelector(':checked').value;
  for (const route of routes) route.hidden = route.dataset.route !== selected;
  updateProgress();
}

if (requested === 'office') method.querySelector('[value=office]').checked = true;
method.hidden = false;
progress.hidden = false;
showRoute();
method.addEventListener('change', () => {
  const url = new URL(location.href);
  url.searchParams.set('method', method.querySelector(':checked').value);
  history.replaceState(null, '', url);
  showRoute();
});
document.querySelector('.journey').addEventListener('change', () => {
  updateProgress();
  try {
    sessionStorage.setItem(checklistKey, JSON.stringify(boxes.map(input => input.checked)));
  } catch {
    // Keep the current checklist usable without browser storage.
  }
});
