const method = document.querySelector('#method');
const routes = [...document.querySelectorAll('[data-route]')];
const progress = document.querySelector('#progress');
const progressText = document.querySelector('#progress-text');
const progressBar = document.querySelector('#progress-bar');
const requested = new URLSearchParams(location.search).get('method');

function updateProgress() {
  const items = [...document.querySelectorAll('.checklist input')].filter(input => !input.closest('[hidden]'));
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
method.addEventListener('change', showRoute);
document.querySelector('.journey').addEventListener('change', updateProgress);
