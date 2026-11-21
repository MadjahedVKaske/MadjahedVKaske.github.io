import {evaluateModes} from './tax-mode-rules.mjs';

const form = document.querySelector('#mode-form');
const results = document.querySelector('#mode-results');
const list = document.querySelector('#mode-list');
const labels = {yes: 'Подходит по введённым данным', check: 'Нужно уточнить', no: 'Есть ограничение'};
const compact = input => input.value.replace(/[\s\u00a0\u202f]/g, '');
const rubles = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 2});

for (const input of form.querySelectorAll('[data-money]')) {
  input.addEventListener('blur', () => {
    const raw = compact(input);
    if (/^\d+(?:[.,]\d{1,2})?$/.test(raw)) {
      const value = Number(raw.replace(',', '.'));
      if (value <= Number.MAX_SAFE_INTEGER) input.value = rubles.format(value);
    }
  });
}

form.addEventListener('input', event => {
  event.target.setCustomValidity('');
  results.hidden = true;
});

form.addEventListener('submit', event => {
  event.preventDefault();
  const fields = form.elements;
  const values = {};
  for (const input of form.querySelectorAll('[data-money]')) {
    const raw = compact(input);
    const value = raw === '' ? null : Number(raw.replace(',', '.'));
    if ((input.required || raw !== '') && (!/^\d+(?:[.,]\d{1,2})?$/.test(raw) || value > Number.MAX_SAFE_INTEGER)) {
      input.setCustomValidity('Введите сумму в рублях, например 1 500 000.');
      input.reportValidity();
      return;
    }
    values[input.name] = value;
  }
  const options = evaluateModes({...values, region: fields.region.value, activity: fields.activity.value,
    employees: fields.employees.valueAsNumber});
  list.replaceChildren(...options.map(item => {
    const row = document.querySelector('#mode-template').content.firstElementChild.cloneNode(true);
    row.querySelector('h3').textContent = item.mode;
    const status = row.querySelector('strong');
    status.textContent = labels[item.status];
    status.dataset.status = item.status;
    row.querySelector('p').textContent = item.reason;
    row.querySelector('a').href = item.url;
    return row;
  }));
  results.hidden = false;
  results.focus();
});
