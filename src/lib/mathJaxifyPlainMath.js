/** @type {Record<string, string>} */
const GREEK_WORD_TO_TEX = {
  alpha: '\\alpha',
  beta: '\\beta',
  gamma: '\\gamma',
  delta: '\\delta',
  epsilon: '\\epsilon',
  theta: '\\theta',
  lambda: '\\lambda',
  mu: '\\mu',
  pi: '\\pi',
  rho: '\\rho',
  sigma: '\\sigma',
  tau: '\\tau',
  phi: '\\phi',
  chi: '\\chi',
  psi: '\\psi',
  omega: '\\omega',
  Omega: '\\Omega',
};

/**
 * Modelele pun des virgulă între factori (\\frac{1}{2}, \\rho, C_d) în loc de înmulțire.
 * Păstrăm \, (spațiu subțire), {,} (zecimală românească) și i,j lipite în indici.
 * @param {string} tex
 */
function cleanMultiplicationCommasInTex(tex) {
  if (typeof tex !== 'string' || !tex.includes(',')) return tex;
  let s = tex;
  s = s.replace(/(?<!\\),(\s+)(?=\\[a-zA-Z]+)/g, ' ');
  if (/=|\\frac|\\cdot|\\times/.test(s)) {
    s = s.replace(/(?<!\\),(\s+)(?=[A-Za-z{])/g, ' ');
  }
  return s;
}

/**
 * Curăță virgulele-înmulțire din blocurile MathJax ale unui răspuns markdown.
 * @param {string} text
 */
export function cleanSpuriousMathCommasInMarkdown(text) {
  if (typeof text !== 'string' || !text.includes(',')) return text;
  return text.replace(
    /\$\$([\s\S]+?)\$\$|\$([^$\n]+)\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)/g,
    (full, displayDollar, inlineDollar, displayBrack, inlineParen) => {
      const inner = displayDollar ?? inlineDollar ?? displayBrack ?? inlineParen;
      const cleaned = cleanMultiplicationCommasInTex(inner);
      if (displayDollar != null) return `$$${cleaned}$$`;
      if (displayBrack != null) return `\\[${cleaned}\\]`;
      if (inlineParen != null) return `\\(${cleaned}\\)`;
      return `$${cleaned}$`;
    },
  );
}

/**
 * Repară fragmente „latex-ish” înainte de MathJax: litere grecești ca text, subscripte fără acolade, %.
 * @param {string} t
 * @returns {string}
 */
function sanitizeLatexishFragment(t) {
  let s = t;
  // caractere Unicode frecvente din răspunsuri AI / Word
  s = s.replace(/\u2212/g, '-'); // minus matematic
  s = s.replace(/\u00d7/g, '\\times'); // ×
  s = s.replace(/\u00b7/g, '\\cdot'); // punct central · (nu \cdot TeX)
  s = cleanMultiplicationCommasInTex(s);
  // \mathrm{A/B^n} → \frac{\mathrm{A}}{\mathrm{B}^{n}} (altfel ^ în interior poate da Math input error)
  s = s.replace(
    /\\mathrm\{([^/}]+)\/([^}^]+)\^(\d+)\}/g,
    '\\frac{\\mathrm{$1}}{\\mathrm{$2}^{$3}}',
  );
  // % comentează restul liniei în TeX
  s = s.replace(/(^|[^\\])%/g, '$1\\%');
  // cuvinte grecești fără backslash (ex. rho_cu); nu atinge \mu deja scris corect
  for (const [word, cmd] of Object.entries(GREEK_WORD_TO_TEX)) {
    s = s.replace(new RegExp(`(?<!\\\\)\\b${word}\\b`, 'gi'), cmd);
  }
  // subscripte cu 2+ caractere fără acolade: t_cu → t_{cu} (nu atinge _{...} deja)
  s = s.replace(/(?<!\\)_([A-Za-z0-9]{2,})(?![}])/g, '_{$1}');
  return s;
}

/**
 * Dacă întregul șir e deja \(...\) sau $...$, sanitizează interiorul (fără a strica delimitatorii).
 * @param {string} raw
 * @returns {string}
 */
function sanitizeExistingDelimitedMath(raw) {
  const s = raw.trim();
  // $$...$$ înainte de $...$ (altfel $$ e interpretat greșit)
  const displayDollars = s.match(/^\$\$([\s\S]*)\$\$$/);
  if (displayDollars) {
    return `\\[${sanitizeLatexishFragment(displayDollars[1].trim())}\\]`;
  }
  const inline = s.match(/^\\\(([\s\S]*)\\\)$/);
  if (inline) {
    return `\\(${sanitizeLatexishFragment(inline[1])}\\)`;
  }
  const displayBracket = s.match(/^\\\[([\s\S]*)\\\]$/);
  if (displayBracket) {
    return `\\[${sanitizeLatexishFragment(displayBracket[1].trim())}\\]`;
  }
  const dollars = s.match(/^\$([^$]*)\$$/);
  if (dollars) {
    return `\\(${sanitizeLatexishFragment(dollars[1])}\\)`;
  }
  return raw;
}

/**
 * Elimină o pereche exterioară de paranteze rotunde dacă învelișul e echilibrat
 * (ex. „(6{,}45 \cdot 10^{7})” → interior fără dublă încadrare la wrap).
 * @param {string} s
 * @returns {string}
 */
function stripOneOuterParenPair(s) {
  const t = s.trim();
  if (t.length < 2 || t[0] !== '(' || t.at(-1) !== ')') return s;
  let depth = 0;
  for (let i = 0; i < t.length; i++) {
    if (t[i] === '(') depth++;
    else if (t[i] === ')') depth--;
    if (depth === 0) return i === t.length - 1 ? t.slice(1, -1).trim() : s;
  }
  return s;
}

/**
 * Pregătește text „latex-ish” venit de la evaluator (fără delimitatori MathJax)
 * pentru randare cu MathJax: încapsulează în \(...\) și normalizează simboluri frecvente.
 *
 * Nu apelează API — doar reguli locale ca să nu mai apară „cdot” brut în celule.
 *
 * @param {string} raw
 * @returns {string}
 */
export function wrapInlineMathIfNeeded(raw) {
  if (typeof raw !== 'string') return raw;
  const s = raw.trim();
  if (!s) return raw;

  // Are deja delimitatori MathJax / LaTeX — repară interiorul (ex. rho_cu, % neescapat)
  if (/^\$\$[\s\S]*\$\$$/.test(s)) {
    return sanitizeExistingDelimitedMath(s);
  }
  if (/^\\\([\s\S]*\\\)$/.test(s)) {
    return sanitizeExistingDelimitedMath(s);
  }
  if (/^\\\[[\s\S]*\\\]$/.test(s)) {
    return sanitizeExistingDelimitedMath(s);
  }
  if (/^\$[^$]*\$$/.test(s)) {
    return sanitizeExistingDelimitedMath(s);
  }
  if (/\\\(|\\\[|\$\$|\\begin\{/.test(s)) return sanitizeExistingDelimitedMath(s);

  // Fără indicii că ar fi formulă — lasă textul (ex. titluri lungi fără simboluri)
  const looksPhysicsy =
    /(?<!\\)\bcdot\b/i.test(s) ||
    /\^/.test(s) ||
    /(?<!\\)\bOmega\b/.test(s) ||
    /\d+,\d+/.test(s) ||
    (s.length <= 120 && /[\/^]/.test(s) && /[0-9A-Za-z]/.test(s));
  if (!looksPhysicsy) return raw;

  let t = stripOneOuterParenPair(s);

  // „cdot” din răspunsuri AI fără backslash (nu atinge \cdot deja corect — altfel apare \\cdot → Math input error)
  t = t.replace(/(?<!\\)\bcdot\b/gi, '\\cdot');

  // Ω (ohm) scris ca cuvânt (nu dubla \Omega)
  t = t.replace(/(?<!\\)\bOmega\b/g, '\\Omega');

  // 10^7 → 10^{7} când lipsește acolada
  t = t.replace(/10\^(\{[^}]+\}|-?\d+)/g, (m, exp) => {
    if (String(exp).startsWith('{')) return m;
    return `10^{${exp}}`;
  });

  // baze gen m^2, kg^3 fără acolade (o singură cifră sau minus e deja ok în unele cazuri)
  t = t.replace(/([A-Za-z]+)\^(\{[^}]+\}|-?\d+)/g, (m, base, exp) => {
    if (String(exp).startsWith('{')) return m;
    if (/^-?\d$/.test(exp)) return m;
    return `${base}^{${exp}}`;
  });

  // virgulă zecimală românească: 6,45 → 6{,}45 (MathJax)
  t = t.replace(/(\d+),(\d+)/g, '$1{,}$2');

  t = sanitizeLatexishFragment(t);

  return `\\(${t}\\)`;
}

/**
 * Conținut care trebuie randat ca text brut (nu prin ReactMarkdown), ca să nu dispară
 * backslash-urile din delimitatorii MathJax \(...\).
 * @param {string} displayContent
 * @param {boolean} _mathJaxify
 * @returns {boolean}
 */
export function shouldRenderMathAsPlainText(displayContent, _mathJaxify) {
  if (typeof displayContent !== 'string') return false;
  // \(...\) / \[...\] — altfel ReactMarkdown poate șterge backslash-uri și apare „Math input error”.
  if (/\\\(|\\\[/.test(displayContent)) return true;
  const t = displayContent.trim();
  // Un singur bloc $$...$$ sau $...$ pe linie (formule din extractor); fără remark-math, $ e totuși ok, dar plain e mai sigur
  if (/^\$\$[\s\S]*\$\$$/.test(t)) return true;
  if (/^\$[^$\n]*\$$/.test(t)) return true;
  return false;
}
