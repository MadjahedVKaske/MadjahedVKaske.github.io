const usnLimit = 490_500_000;
const patentLimit = 20_000_000;
const ausnRegions = new Set(['16', '40', '50', '77']);
const number = value => new Intl.NumberFormat('ru-RU').format(Math.round(value)) + ' ₽';

export function evaluateModes({region, activity, income, expenses, employees, priorIncome}) {
  const result = [];
  const push = (mode, status, reason, url) => result.push({mode, status, reason, url});
  const usn = 'https://www.nalog.gov.ru/rn77/service/mp/';
  const vat = income > patentLimit || priorIncome > patentLimit
    ? ' Отдельно проверьте НДС: доход превышает порог 20 млн ₽.' : '';
  const vatUnknown = priorIncome === null && income <= patentLimit
    ? ' Для проверки освобождения от НДС укажите доход за 2025 год, если ИП тогда работал.' : '';
  const usnProblems = [];
  if (income > usnLimit) usnProblems.push('Доход превышает 490,5 млн ₽.');
  if (employees > 130) usnProblems.push('Численность превышает 130 человек.');
  const usnReason = 'По доходу и сотрудникам проходит. Проверьте региональную ставку, ограничения по деятельности и срок перехода.';
  push('УСН «Доходы»', usnProblems.length ? 'no' : 'yes',
    usnProblems.join(' ') || usnReason + ' По базовой ставке 6% до уменьшения на взносы: ' + number(income * .06) + '.' + vat + vatUnknown, usn);
  push('УСН «Доходы минус расходы»', usnProblems.length ? 'no' : 'yes',
    usnProblems.join(' ') || usnReason + ' При базовой ставке 15% с учётом минимального налога и без учёта взносов: ' +
      number(Math.max((income - expenses) * .15, income * .01)) + '. Расходы должны признаваться по правилам УСН.' + vat + vatUnknown, usn);

  const patentProblems = [];
  if (income > patentLimit || priorIncome > patentLimit) patentProblems.push('Превышен лимит 20 млн ₽ за 2025 или 2026 год, если введённый доход учитывается для ПСН.');
  if (employees > 15) patentProblems.push('Численность превышает 15 человек.');
  push('Патент (ПСН)', patentProblems.length ? 'no' : 'check',
    patentProblems.join(' ') || (priorIncome === null ? 'Уточните доход за 2025 год. ' : '') +
      'Проверьте точный вид деятельности, территорию и условия в своём регионе. При совмещении с УСН для лимита учитывайте доходы по обоим режимам.',
    'https://patent.nalog.ru/info/');

  const npdProblems = [];
  if (income > 2_400_000) npdProblems.push('Доход превышает 2,4 млн ₽.');
  if (employees > 0) npdProblems.push('Есть работники по трудовым договорам.');
  if (activity === 'resale') npdProblems.push('НПД не применяется к перепродаже товаров.');
  push('НПД', npdProblems.length ? 'no' : ['other', 'agency'].includes(activity) ? 'check' : 'yes',
    npdProblems.join(' ') || (activity === 'agency'
      ? 'Посредническая деятельность в общем случае исключает НПД. Проверьте, применимо ли исключение ФНС.'
      : 'Проверьте, разрешён ли ваш вид деятельности и нет ли несовместимого режима. Ставки — 4% с доходов от физлиц и 6% от ИП и организаций.'), 'https://npd.nalog.ru/');

  const ausnProblems = [];
  if (income > 60_000_000) ausnProblems.push('Доход превышает 60 млн ₽.');
  if (employees > 5) ausnProblems.push('Численность превышает пять человек.');
  push('АУСН', ausnProblems.length ? 'no' : 'check', ausnProblems.join(' ') ||
    (ausnRegions.has(region) ? 'Регион участвует в эксперименте. ' : 'Уточните участие региона и дату начала эксперимента в списке ФНС. ') +
    'Проверьте банк и остальные ограничения. Совмещать с патентом и другими спецрежимами нельзя. Ставки — 8% или 20%, для второго объекта минимум 3% дохода.',
    'https://ausn.nalog.gov.ru/');

  const farming = ['farm', 'other'].includes(activity);
  push('ЕСХН', farming ? 'check' : 'no', farming
    ? 'Проверьте статус сельхозтоваропроизводителя и долю профильного дохода. Для базового случая она составляет не менее 70%.'
    : 'Выбранная категория деятельности сама по себе не даёт права на сельхозналог.',
  'https://www.nalog.gov.ru/rn77/taxation/taxes/eshn/');
  push('ОСНО', 'yes', 'Доступный общий режим. Для сравнения отдельно рассчитайте НДФЛ, взносы и НДС.', usn);
  return result;
}
