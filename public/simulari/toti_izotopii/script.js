/* =====================================================
   URANIUM ISOTOPE MAP · complete explorer
   26 isotopes, chart, slider, decay curve
   ===================================================== */

// ---------- ISOTOPE DATA (A = 217 → 242) ----------
// halfLife is in SECONDS (so we can compare across microseconds → billion years)
const Y = 365.25 * 24 * 3600; // seconds in a year

const ISOTOPES = [
  { A: 217, halfLife: 26e-3,        hlText: '26 ms',           decay: 'α', daughterA: 213, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'doar cercetare',
    desc: 'Izotop foarte ușor al uraniului, obținut artificial în acceleratoare. Dispare în zeci de milisecunde.' },

  { A: 218, halfLife: 0.51e-3,      hlText: '0.51 ms',         decay: 'α', daughterA: 214, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'Unul dintre cei mai instabili izotopi. Atomul există mai puțin de o milisecundă.' },

  { A: 219, halfLife: 55e-6,        hlText: '55 μs',           decay: 'α', daughterA: 215, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'Sub o sutime de milisecundă. Studiat pentru modele de structură nucleară a izotopilor ușori.' },

  { A: 220, halfLife: 60e-9,        hlText: '~60 ns',          decay: 'α', daughterA: 216, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'Valoare estimată. Aproape imposibil de detectat — dispare în zeci de nanosecunde.' },

  { A: 221, halfLife: 0.66e-6,      hlText: '0.66 μs',         decay: 'α', daughterA: 217, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'Produs în reacții cu ioni grei. Trăiește cât durează o scânteie laser.' },

  { A: 222, halfLife: 4.7e-6,       hlText: '4.7 μs',          decay: 'α', daughterA: 218, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'Valoare estimată. Studiat pentru înțelegerea barierei de fisiune la izotopi ușori de U.' },

  { A: 223, halfLife: 21e-6,        hlText: '21 μs',           decay: 'α', daughterA: 219, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'Viață ultra-scurtă. Detectat prin spectroscopie a fragmentelor α.' },

  { A: 224, halfLife: 940e-6,       hlText: '0.94 ms',         decay: 'α', daughterA: 220, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'Prag milisecundă. Primul izotop de U a cărui viață depășește ms.' },

  { A: 225, halfLife: 61e-3,        hlText: '61 ms',           decay: 'α', daughterA: 221, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'Sub o zecime de secundă. Folosit în studii de dezintegrare α cu lanț scurt.' },

  { A: 226, halfLife: 0.27,         hlText: '0.27 s',          decay: 'α', daughterA: 222, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'O clipă. Util ca marker în experimente cu lanțuri de dezintegrare.' },

  { A: 227, halfLife: 1.1 * 60,     hlText: '1.1 min',         decay: 'α', daughterA: 223, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'Un minut de existență. Produs în reacții nucleare controlate.' },

  { A: 228, halfLife: 9.1 * 60,     hlText: '9.1 min',         decay: 'α', daughterA: 224, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare nucleară',
    desc: 'Cu cât A crește, cu atât izotopul trăiește mai mult. Legătură directă cu stabilitatea.' },

  { A: 229, halfLife: 58 * 60,      hlText: '58 min',          decay: 'CE', daughterA: 229, daughterZ: 91, daughterSym: 'Pa',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'Primul izotop de U care se dezintegrează preponderent prin captură electronică, nu prin α.' },

  { A: 230, halfLife: 20.23 * 24 * 3600,       hlText: '20.2 zile',       decay: 'α', daughterA: 226, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'parțial',           uses: 'cercetare medicală',
    desc: 'Studiat ca potențial agent în terapia cu α (alfa-terapie țintită). Trăiește aproape 3 săptămâni.' },

  { A: 231, halfLife: 4.2 * 24 * 3600,         hlText: '4.2 zile',        decay: 'CE', daughterA: 231, daughterZ: 91, daughterSym: 'Pa',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'Câteva zile de viață. Intermediar în lanțuri artificiale de dezintegrare.' },

  { A: 232, halfLife: 68.9 * Y,                hlText: '68.9 ani',        decay: 'α', daughterA: 228, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'da · neutroni rapizi', uses: 'contaminant în U-233',
    desc: 'Apare în ciclul thoriu-uraniu. Problematic: emite radiații γ puternice prin descendenții săi.' },

  { A: 233, halfLife: 1.592e5 * Y,             hlText: '159 200 ani',     decay: 'α', daughterA: 229, daughterZ: 90, daughterSym: 'Th',
    origin: 'artificial',  abund: '—',           fissile: 'DA · neutroni termici', uses: 'reactoare Th',
    desc: 'Fisil ca U-235. Se obține din Th-232 prin captură de neutron. Speranța reactoarelor de generație IV.' },

  { A: 234, halfLife: 2.455e5 * Y,             hlText: '245 500 ani',     decay: 'α', daughterA: 230, daughterZ: 90, daughterSym: 'Th',
    origin: 'natural · urmă', abund: '0.0055 %',   fissile: 'nu',                uses: 'trasor geologic',
    desc: 'Apare natural ca produs al dezintegrării U-238. Doar 55 părți la un milion din uraniul natural.' },

  { A: 235, halfLife: 7.038e8 * Y,             hlText: '703.8 mil. ani',  decay: 'α', daughterA: 231, daughterZ: 90, daughterSym: 'Th',
    origin: 'natural · primar', abund: '0.720 %',  fissile: 'DA · neutroni termici', uses: 'reactor · armă',
    desc: 'Singurul izotop fisionabil cu neutroni termici găsit în natură. Combustibilul principal al reactoarelor.' },

  { A: 236, halfLife: 2.342e7 * Y,             hlText: '23.4 mil. ani',   decay: 'α', daughterA: 232, daughterZ: 90, daughterSym: 'Th',
    origin: 'natural · urmă', abund: '< 10⁻¹⁰',    fissile: 'nu',                uses: 'criminalistică nucleară',
    desc: 'Indicator al iradierii cu neutroni. Dacă îl găsești în probe naturale → semn de activitate nucleară.' },

  { A: 237, halfLife: 6.75 * 24 * 3600,        hlText: '6.75 zile',       decay: 'β⁻', daughterA: 237, daughterZ: 93, daughterSym: 'Np',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'trasor Pu',
    desc: 'Produs în reactoare. Folosit ca trasor pentru producția de plutoniu. β⁻ → neptuniu.' },

  { A: 238, halfLife: 4.468e9 * Y,             hlText: '4.47 mld. ani',   decay: 'α', daughterA: 234, daughterZ: 90, daughterSym: 'Th',
    origin: 'natural · primar', abund: '99.2742 %', fissile: 'fertil · fast',  uses: 'combustibil fertil · DU',
    desc: 'Peste 99% din tot uraniul Pământului. Nu fisionează ușor, dar prin captură devine Pu-239 fisil.' },

  { A: 239, halfLife: 23.45 * 60,              hlText: '23.5 min',        decay: 'β⁻', daughterA: 239, daughterZ: 93, daughterSym: 'Np',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'precursor Pu-239',
    desc: 'Verigă esențială: U-238 + n → U-239 → Np-239 → Pu-239. Așa se produce plutoniul.' },

  { A: 240, halfLife: 14.1 * 3600,             hlText: '14.1 ore',        decay: 'β⁻', daughterA: 240, daughterZ: 93, daughterSym: 'Np',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'Produs în reactoare de generație II prin captură multiplă de neutroni.' },

  { A: 241, halfLife: 5 * 60,                  hlText: '~5 min',          decay: 'β⁻', daughterA: 241, daughterZ: 93, daughterSym: 'Np',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'Estimare. Izotop foarte bogat în neutroni, produs rar în experimente.' },

  { A: 242, halfLife: 16.8 * 60,               hlText: '16.8 min',        decay: 'β⁻', daughterA: 242, daughterZ: 93, daughterSym: 'Np',
    origin: 'artificial',  abund: '—',           fissile: 'nu',                uses: 'cercetare',
    desc: 'Cel mai greu izotop de uraniu observat experimental. Dincolo de el: teritoriu teoretic.' },
];

const LANG_EN = new URLSearchParams(window.location.search).get('lang') === 'en';

function lbl(path, fallback) {
  return typeof window.simLbl === 'function' ? window.simLbl(path, fallback) : fallback;
}

/** Merge EN strings from catalog for display; keep raw `iso` from ISOTOPES for RO-based logic. */
function displayIso(iso) {
  const en = window.__SIMULATOR_UI_I18N__?.isotopesByA?.[String(iso.A)];
  if (!en) return iso;
  return {
    ...iso,
    hlText: en.hlText ?? iso.hlText,
    origin: en.origin ?? iso.origin,
    abund: en.abund ?? iso.abund,
    fissile: en.fissile ?? iso.fissile,
    uses: en.uses ?? iso.uses,
    desc: en.desc ?? iso.desc,
  };
}

function stabWordFromScore(stab) {
  if (stab < 0.15) return lbl('stab.e0', 'extrem instabil');
  if (stab < 0.35) return lbl('stab.e1', 'foarte instabil');
  if (stab < 0.55) return lbl('stab.e2', 'instabil');
  if (stab < 0.75) return lbl('stab.e3', 'relativ stabil');
  return lbl('stab.e4', 'longeviv');
}

/** Canvas / decay UI strings (read after i18n boot). */
function canvasLbl(key, ro) {
  return lbl(`canvas.${key}`, ro);
}

// ---------- UTILS ----------
const $ = id => document.getElementById(id);

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function decayColor(decay) {
  if (decay === 'α') return '#ff8a4a';
  if (decay === 'β⁻') return '#4ea9ff';
  if (decay === 'β⁺' || decay === 'CE') return '#c77bff';
  return '#7cf9c5';
}

function decayLabel(decay) {
  if (decay === 'α') return lbl('decayChip.alpha', 'α · alfa');
  if (decay === 'β⁻') return lbl('decayChip.betaM', 'β⁻ · beta minus');
  if (decay === 'CE') return lbl('decayChip.ce', 'CE · captură electronică');
  if (decay === 'β⁺') return lbl('decayChip.betaP', 'β⁺ · beta plus');
  return decay;
}

function decayChipClass(decay) {
  if (decay === 'β⁻') return 'beta-m';
  if (decay === 'β⁺' || decay === 'CE') return 'beta-p';
  return ''; // alpha default
}

// normalized stability score 0..1 based on log10(halfLife seconds)
// halfLife range: ~60e-9 s → 4.47e9 * Y s → log10 ranges roughly -7.2 to 17.15
const MIN_LOG = -8;
const MAX_LOG = 17.5;
function stability01(halfLifeSec) {
  const l = Math.log10(halfLifeSec);
  return clamp((l - MIN_LOG) / (MAX_LOG - MIN_LOG), 0, 1);
}

function formatHalfLifeShort(sec) {
  if (sec < 1e-6) return (sec * 1e9).toFixed(0) + ' ' + lbl('unit.ns', 'ns');
  if (sec < 1e-3) return (sec * 1e6).toFixed(1) + ' ' + lbl('unit.us', 'μs');
  if (sec < 1) return (sec * 1e3).toFixed(1) + ' ' + lbl('unit.ms', 'ms');
  if (sec < 60) return sec.toFixed(2) + ' ' + lbl('unit.s', 's');
  if (sec < 3600) return (sec / 60).toFixed(1) + ' ' + lbl('unit.min', 'min');
  if (sec < 86400) return (sec / 3600).toFixed(1) + ' ' + lbl('unit.h', 'h');
  if (sec < Y) return (sec / 86400).toFixed(1) + ' ' + lbl('unit.days', 'zile');
  if (sec < Y * 1e3) return (sec / Y).toFixed(1) + ' ' + lbl('unit.yr', 'ani');
  if (sec < Y * 1e6) return (sec / (Y * 1e3)).toFixed(1) + ' ' + lbl('unit.kyr', 'mii ani');
  if (sec < Y * 1e9) return (sec / (Y * 1e6)).toFixed(1) + ' ' + lbl('unit.Myr', 'mil. ani');
  return (sec / (Y * 1e9)).toFixed(2) + ' ' + lbl('unit.Gyr', 'mld. ani');
}

function formatTimeByHL(tInSecondsOfHL) {
  // tInSecondsOfHL is already unitless ratio (t / T½)
  // we'll display as "x × T½" directly in call sites
  return tInSecondsOfHL.toFixed(2);
}

// format elapsed time using the current halfLife * ratio
function formatElapsed(halfLifeSec, ratio) {
  const t = halfLifeSec * ratio;
  return formatHalfLifeShort(t);
}

function formatLambda(halfLifeSec) {
  const lambda = Math.log(2) / halfLifeSec;
  if (lambda === 0) return '0';
  const exp = Math.floor(Math.log10(lambda));
  const mantissa = lambda / Math.pow(10, exp);
  const supMap = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  const expStr = String(exp).split('').map(c => supMap[c] || c).join('');
  return `${mantissa.toFixed(2)}·10${expStr}`;
}

function origSym(origin) {
  if (origin.startsWith('natural')) return { cls: 'natural', text: origin };
  if (origin.startsWith('artificial')) return { cls: 'artificial', text: 'artificial' };
  return { cls: '', text: origin };
}

// ==========================================
// STATE
// ==========================================
const state = {
  currentA: 235,
  timeRatio: 0, // t / T½ · 100  (slider is 0..500 meaning 0..5)
};

function isoByA(A) { return ISOTOPES.find(i => i.A === A); }

const shortestIso = ISOTOPES.reduce((x, y) => (x.halfLife < y.halfLife ? x : y));
const longestIso = ISOTOPES.reduce((x, y) => (x.halfLife > y.halfLife ? x : y));

function applyTheoryI18n() {
  if (!LANG_EN) return;
  const b = window.__SIMULATOR_UI_I18N__?.theory;
  if (!b) return;
  const li1 = document.getElementById('theoryLi1');
  const li2 = document.getElementById('theoryLi2');
  const li3 = document.getElementById('theoryLi3');
  if (b.li1Html && li1) li1.innerHTML = b.li1Html;
  if (b.li2Html && li2) li2.innerHTML = b.li2Html;
  if (b.li3Html && li3) li3.innerHTML = b.li3Html;
}

function refreshExtremeButtons() {
  const ds = displayIso(shortestIso);
  const dl = displayIso(longestIso);
  const sEl = $('shortestVal');
  const lEl = $('longestVal');
  if (sEl) sEl.textContent = `U-${shortestIso.A} · ${ds.hlText}`;
  if (lEl) lEl.textContent = `U-${longestIso.A} · ${dl.hlText}`;
}

// ==========================================
// NUCLIDE CHART
// ==========================================
const chartGrid = $('chartGrid');
const tooltip = $('chartTooltip');

function buildChart() {
  chartGrid.innerHTML = '';
  ISOTOPES.forEach(iso => {
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.dataset.a = iso.A;
    const color = decayColor(iso.decay);
    const opacity = 0.12 + stability01(iso.halfLife) * 0.65;
    cell.style.setProperty('--cell-color', color);
    cell.style.setProperty('--cell-opacity', opacity.toFixed(3));
    cell.innerHTML = `<span>${iso.A}</span>`;

    cell.addEventListener('click', () => selectA(iso.A));
    cell.addEventListener('mouseenter', e => showTooltip(e, iso));
    cell.addEventListener('mouseleave', hideTooltip);

    chartGrid.appendChild(cell);
  });
}

function hexToRgba(hex, alpha) {
  const m = hex.replace('#', '');
  const r = parseInt(m.substring(0, 2), 16);
  const g = parseInt(m.substring(2, 4), 16);
  const b = parseInt(m.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function showTooltip(e, iso) {
  const d = displayIso(iso);
  const color = decayColor(iso.decay);
  const stab = stability01(iso.halfLife);
  const stabWord = stabWordFromScore(stab);

  tooltip.style.setProperty('--tt-color', color);
  tooltip.style.setProperty('--tt-color-soft', hexToRgba(color, 0.12));

  const fissileRow =
    iso.fissile && iso.fissile !== 'nu'
      ? `<div class="tt-row"><span class="tt-k">${lbl('tooltip.fissile', 'Fisil')}</span><span class="tt-v tt-v-accent">${d.fissile}</span></div>`
      : '';

  tooltip.innerHTML = `
    <div class="tt-head">
      <span class="tt-title">U-${iso.A}</span>
      <span class="tt-decay-chip">${iso.decay}</span>
    </div>
    <div class="tt-row"><span class="tt-k">${lbl('tooltip.protonsZ', 'Protoni · Z')}</span><span class="tt-v">92</span></div>
    <div class="tt-row"><span class="tt-k">${lbl('tooltip.neutronsN', 'Neutroni · N')}</span><span class="tt-v">${iso.A - 92}</span></div>
    <div class="tt-row"><span class="tt-k">${lbl('tooltip.massA', 'Masă · A')}</span><span class="tt-v">${iso.A}</span></div>
    <div class="tt-row"><span class="tt-k">${lbl('tooltip.halfLife', 'T½')}</span><span class="tt-v tt-v-accent">${d.hlText}</span></div>
    <div class="tt-row"><span class="tt-k">${lbl('tooltip.stability', 'Stabilitate')}</span><span class="tt-v">${stabWord}</span></div>
    <div class="tt-row"><span class="tt-k">${lbl('tooltip.origin', 'Origine')}</span><span class="tt-v">${d.origin}</span></div>
    ${fissileRow}
    <div class="tt-footer">${d.desc}</div>
    <div class="tt-hint">${lbl('tooltip.hint', 'click pentru selecție')}</div>
  `;
  tooltip.classList.add('visible');
  positionTooltip(e.currentTarget);
}

function positionTooltip(cellEl) {
  const pad = 12;
  const tw = tooltip.offsetWidth;
  const th = tooltip.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 12;

  const rect = cellEl.getBoundingClientRect();
  const cellCenterX = rect.left + rect.width / 2;

  // horizontal: center over the cell, clamp to viewport
  let x = cellCenterX - tw / 2;
  if (x + tw > vw - margin) x = vw - margin - tw;
  if (x < margin) x = margin;

  // vertical: prefer ABOVE the cell; if not enough room, place BELOW
  const spaceAbove = rect.top - margin;
  const spaceBelow = vh - rect.bottom - margin;

  let y;
  if (spaceAbove >= th + pad) {
    y = rect.top - th - pad;
  } else if (spaceBelow >= th + pad) {
    y = rect.bottom + pad;
  } else {
    // not enough anywhere — pin to whichever side has more room, clamp
    if (spaceBelow >= spaceAbove) {
      y = rect.bottom + pad;
    } else {
      y = rect.top - th - pad;
    }
    y = Math.max(margin, Math.min(y, vh - th - margin));
  }

  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}
function hideTooltip() {
  tooltip.classList.remove('visible');
}

function refreshChartActive() {
  chartGrid.querySelectorAll('.cell').forEach(c => {
    c.classList.toggle('active', +c.dataset.a === state.currentA);
  });
  const activeCell = chartGrid.querySelector(`.cell[data-a="${state.currentA}"]`);
  if (activeCell) {
    activeCell.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }
}

// ==========================================
// SLIDER
// ==========================================
const isoSlider = $('isoSlider');
isoSlider.min = ISOTOPES[0].A;
isoSlider.max = ISOTOPES[ISOTOPES.length - 1].A;
$('sliderMin').textContent = ISOTOPES[0].A;
$('sliderMax').textContent = ISOTOPES[ISOTOPES.length - 1].A;

isoSlider.addEventListener('input', () => {
  selectA(+isoSlider.value);
});

// ==========================================
// BIG DETAIL CARD + MATTERS
// ==========================================
function updateBigCard() {
  const iso = isoByA(state.currentA);
  const d = displayIso(iso);
  const color = decayColor(iso.decay);
  const N = iso.A - 92;
  const stab = stability01(iso.halfLife);

  document.documentElement.style.setProperty('--cell-color', color);

  // header
  $('sliderCurrent').textContent = iso.A;
  $('bigA').textContent = iso.A;
  $('cellN').textContent = N;
  $('cellA').textContent = iso.A;
  $('cellNZ').textContent = (N / 92).toFixed(3);

  // tags (logic on raw Romanian fields)
  const tags = [];
  if (iso.origin.startsWith('natural · primar')) tags.push({ cls: 'natural', text: lbl('tags.natural', 'natural') });
  else if (iso.origin.startsWith('natural · urmă')) tags.push({ cls: 'trace', text: lbl('tags.trace', 'urmă naturală') });
  else tags.push({ cls: 'artificial', text: lbl('tags.artificial', 'artificial') });

  if (iso.fissile.startsWith('DA')) tags.push({ cls: 'fissile', text: lbl('tags.fissile', 'FISIL') });
  else if (iso.fissile.startsWith('fertil')) tags.push({ cls: 'fissile', text: lbl('tags.fertile', 'fertil') });

  $('isoTags').innerHTML = tags.map(t => `<span class="iso-tag ${t.cls}">${t.text}</span>`).join('');

  // half-life block
  $('hlText').textContent = d.hlText;
  $('hlText').style.color = color;
  $('stabFill').style.width = (stab * 100).toFixed(1) + '%';

  $('stabText').textContent = stabWordFromScore(stab);

  // decay chip
  const chip = $('decayChip');
  chip.textContent = decayLabel(iso.decay);
  chip.className = 'dl-chip ' + decayChipClass(iso.decay);

  // daughter nuclide
  $('daughterNuclide').innerHTML = `
    <span class="nums"><sup>${iso.daughterA}</sup><sub>${iso.daughterZ}</sub></span>${iso.daughterSym}
  `;

  // MATTERS CARD (display merged EN when available)
  const oSym = origSym(iso.origin);
  $('mOrigin').textContent = d.origin;
  $('mOrigin').className = 'mrow-v ' + (oSym.cls === 'natural' ? 'yes' : (oSym.cls === 'artificial' ? 'maybe' : ''));
  $('mAbund').textContent = d.abund;

  const fEl = $('mFissile');
  fEl.textContent = d.fissile;
  if (iso.fissile.startsWith('DA')) fEl.className = 'mrow-v yes';
  else if (iso.fissile.startsWith('da') || iso.fissile.startsWith('fertil') || iso.fissile.startsWith('parțial')) fEl.className = 'mrow-v maybe';
  else fEl.className = 'mrow-v no';

  $('mUses').textContent = d.uses;
  $('mDesc').textContent = d.desc;

  // formula current
  $('fIso').textContent = `U-${iso.A}`;
  $('fLambda').textContent = formatLambda(iso.halfLife);

  // slider position
  if (+isoSlider.value !== iso.A) isoSlider.value = iso.A;

  // refresh chart
  refreshChartActive();

  // redraw decay curve
  drawDecayCurve();
  updateDecayStats();
}

// ==========================================
// DECAY CURVE CANVAS
// ==========================================
const decayCanvas = $('decayCanvas');
const dCtx = decayCanvas.getContext('2d');

function setupCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = decayCanvas.parentElement.getBoundingClientRect();
  decayCanvas.width = rect.width * dpr;
  decayCanvas.height = rect.height * dpr;
  dCtx.setTransform(1, 0, 0, 1, 0, 0);
  dCtx.scale(dpr, dpr);
  return { w: rect.width, h: rect.height };
}

function drawDecayCurve() {
  const { w, h } = setupCanvas();
  dCtx.clearRect(0, 0, w, h);

  const padL = 60, padR = 28, padT = 70, padB = 44;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const iso = isoByA(state.currentA);
  const color = decayColor(iso.decay);
  const ratio = state.timeRatio / 100; // 0 .. 5

  // axes labels
  dCtx.font = '10px "JetBrains Mono", monospace';
  dCtx.fillStyle = 'rgba(130, 150, 190, 0.5)';

  // Y grid: 0, 25, 50, 75, 100%
  dCtx.strokeStyle = 'rgba(130, 150, 190, 0.06)';
  dCtx.lineWidth = 1;
  const yTicks = [0, 25, 50, 75, 100];
  yTicks.forEach(pct => {
    const y = padT + plotH * (1 - pct / 100);
    dCtx.beginPath();
    dCtx.moveTo(padL, y);
    dCtx.lineTo(w - padR, y);
    dCtx.stroke();
    dCtx.fillStyle = 'rgba(130, 150, 190, 0.55)';
    dCtx.textAlign = 'right';
    dCtx.textBaseline = 'middle';
    dCtx.fillText(pct + '%', padL - 10, y);
  });

  // X grid: 0, 1, 2, 3, 4, 5 × T½
  const xTicks = [0, 1, 2, 3, 4, 5];
  xTicks.forEach(v => {
    const x = padL + plotW * (v / 5);
    dCtx.strokeStyle = 'rgba(130, 150, 190, 0.06)';
    dCtx.beginPath();
    dCtx.moveTo(x, padT);
    dCtx.lineTo(x, padT + plotH);
    dCtx.stroke();
    dCtx.fillStyle = 'rgba(130, 150, 190, 0.55)';
    dCtx.textAlign = 'center';
    dCtx.textBaseline = 'top';
    dCtx.fillText(v === 0 ? '0' : `${v}${lbl('decay.axisHalf', 'T½')}`, x, padT + plotH + 8);
  });

  // Axis lines
  dCtx.strokeStyle = 'rgba(130, 150, 190, 0.18)';
  dCtx.lineWidth = 1;
  dCtx.beginPath();
  dCtx.moveTo(padL, padT);
  dCtx.lineTo(padL, padT + plotH);
  dCtx.lineTo(w - padR, padT + plotH);
  dCtx.stroke();

  // axis labels
  dCtx.fillStyle = 'rgba(130, 150, 190, 0.7)';
  dCtx.font = '10px "JetBrains Mono", monospace';
  dCtx.textAlign = 'left';
  dCtx.textBaseline = 'top';
  dCtx.fillText(canvasLbl('axisY', 'N(t) / N₀'), padL - 50, padT - 18);
  dCtx.textAlign = 'right';
  dCtx.fillText(canvasLbl('axisX', 'timp (× T½)'), w - padR, padT + plotH + 26);

  // === DECAY CURVE ===
  const pointsMax = 200;
  dCtx.strokeStyle = color;
  dCtx.lineWidth = 2.5;
  dCtx.shadowColor = color;
  dCtx.shadowBlur = 18;
  dCtx.beginPath();
  for (let i = 0; i <= pointsMax; i++) {
    const t = (i / pointsMax) * 5; // 0..5 × T½
    const frac = Math.pow(0.5, t); // N/N0
    const x = padL + plotW * (t / 5);
    const y = padT + plotH * (1 - frac);
    if (i === 0) dCtx.moveTo(x, y);
    else dCtx.lineTo(x, y);
  }
  dCtx.stroke();
  dCtx.shadowBlur = 0;

  // area fill under curve
  dCtx.fillStyle = color;
  dCtx.globalAlpha = 0.08;
  dCtx.lineTo(w - padR, padT + plotH);
  dCtx.lineTo(padL, padT + plotH);
  dCtx.closePath();
  dCtx.fill();
  dCtx.globalAlpha = 1;

  // === CURRENT POSITION ===
  const currentFrac = Math.pow(0.5, ratio);
  const cx = padL + plotW * (ratio / 5);
  const cy = padT + plotH * (1 - currentFrac);

  // vertical line at current time
  dCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  dCtx.lineWidth = 1;
  dCtx.setLineDash([4, 6]);
  dCtx.beginPath();
  dCtx.moveTo(cx, padT);
  dCtx.lineTo(cx, padT + plotH);
  dCtx.stroke();
  // horizontal line at current fraction
  dCtx.beginPath();
  dCtx.moveTo(padL, cy);
  dCtx.lineTo(cx, cy);
  dCtx.stroke();
  dCtx.setLineDash([]);

  // dot
  dCtx.fillStyle = '#fff';
  dCtx.beginPath();
  dCtx.arc(cx, cy, 6, 0, Math.PI * 2);
  dCtx.fill();
  dCtx.fillStyle = color;
  dCtx.beginPath();
  dCtx.arc(cx, cy, 4, 0, Math.PI * 2);
  dCtx.fill();

  // glow ring
  dCtx.strokeStyle = color;
  dCtx.globalAlpha = 0.4;
  dCtx.lineWidth = 1;
  dCtx.beginPath();
  dCtx.arc(cx, cy, 12, 0, Math.PI * 2);
  dCtx.stroke();
  dCtx.globalAlpha = 1;

  // === ATOM DOTS (representation) ===
  drawAtoms(w, h, currentFrac, color);
}

// Tiny scatter of atom dots showing how many remain
function drawAtoms(w, h, frac, color) {
  const padL = 60, padR = 28, padT = 70, padB = 44;
  // box in bottom-right of plot for "atoms remaining" visualization
  const boxW = 132;
  const boxH = 78;
  const boxX = w - padR - boxW - 6;
  const boxY = padT + 6;

  // background box
  dCtx.fillStyle = 'rgba(10, 13, 21, 0.7)';
  dCtx.strokeStyle = 'rgba(130, 150, 190, 0.2)';
  dCtx.lineWidth = 1;
  roundRect(dCtx, boxX, boxY, boxW, boxH, 10, true, true);

  // title
  dCtx.fillStyle = 'rgba(130, 150, 190, 0.6)';
  dCtx.font = '9px "JetBrains Mono", monospace';
  dCtx.textAlign = 'left';
  dCtx.textBaseline = 'top';
  dCtx.fillText(canvasLbl('atomsViz', 'atomi rămași'), boxX + 10, boxY + 8);

  // grid of dots 10x8 = 80 dots
  const cols = 10, rows = 6;
  const total = cols * rows;
  const alive = Math.round(total * frac);
  const gx = boxX + 10;
  const gy = boxY + 26;
  const gw = boxW - 20;
  const gh = boxH - 34;
  const dx = gw / (cols - 1);
  const dy = gh / (rows - 1);

  for (let i = 0; i < total; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = gx + c * dx;
    const y = gy + r * dy;
    if (i < alive) {
      dCtx.fillStyle = color;
      dCtx.globalAlpha = 0.9;
      dCtx.beginPath();
      dCtx.arc(x, y, 2.2, 0, Math.PI * 2);
      dCtx.fill();
    } else {
      dCtx.fillStyle = 'rgba(130, 150, 190, 0.15)';
      dCtx.globalAlpha = 1;
      dCtx.beginPath();
      dCtx.arc(x, y, 1.4, 0, Math.PI * 2);
      dCtx.fill();
    }
  }
  dCtx.globalAlpha = 1;
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// ==========================================
// DECAY TIME SLIDER + STATS
// ==========================================
const timeSlider = $('timeSlider');
timeSlider.addEventListener('input', () => {
  state.timeRatio = +timeSlider.value;
  updateDecayStats();
  drawDecayCurve();
});

function updateDecayStats() {
  const iso = isoByA(state.currentA);
  const ratio = state.timeRatio / 100; // 0..5
  const frac = Math.pow(0.5, ratio);

  $('tRatioVal').textContent = ratio.toFixed(2) + ' ' + lbl('decay.timesHalf', '× T½');
  $('dRemaining').textContent = (frac * 100).toFixed(1) + ' %';
  $('dElapsed').textContent = ratio === 0 ? lbl('decay.zeroElapsed', '0') : formatElapsed(iso.halfLife, ratio);
  $('dPeriods').textContent = ratio.toFixed(2);
}

// ==========================================
// SELECTION
// ==========================================
function selectA(A) {
  A = clamp(A, ISOTOPES[0].A, ISOTOPES[ISOTOPES.length - 1].A);
  state.currentA = A;
  updateBigCard();
}

// ==========================================
// EXTREMES
// ==========================================
$('btnLongest').addEventListener('click', () => {
  selectA(longestIso.A);
  flashCard();
});
$('btnShortest').addEventListener('click', () => {
  selectA(shortestIso.A);
  flashCard();
});

function flashCard() {
  const card = $('isoBigCard');
  card.style.animation = 'none';
  card.offsetHeight; // reflow
  card.style.animation = 'cardFlash 0.6s ease-out';
}

// inject flash keyframes once
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes cardFlash {
    0% { transform: scale(1); box-shadow: var(--shadow-lg); }
    40% { transform: scale(1.015); box-shadow: 0 30px 80px -20px var(--cell-color, rgba(124,249,197,0.4)); }
    100% { transform: scale(1); box-shadow: var(--shadow-lg); }
  }
`;
document.head.appendChild(styleTag);

// ==========================================
// INIT
// ==========================================
function runTotIsoSim() {
  applyTheoryI18n();
  refreshExtremeButtons();
  buildChart();
  selectA(235);
  window.addEventListener('resize', () => drawDecayCurve());
}

runTotIsoSim();
