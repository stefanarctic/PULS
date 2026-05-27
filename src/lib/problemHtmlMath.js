import { normalizeProblemMathString } from './normalizeProblemMathString';

const EXISTING_MATH_RE =
  /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$]*\$)/g;

/** Linie cu comenzi TeX dar fără delimitatori MathJax — ex. ecuații pe rând separat. */
const UNDELIMITED_LATEX_LINE_RE = /\\[a-zA-Z]+/;

/**
 * DeepL/Markdown: scoate backtick-uri sau <code> în jurul delimitatorilor MathJax.
 * @param {string|null|undefined} str
 */
export function prepareProblemHtmlMath(str) {
  if (str == null || str === '') return str;
  let s = normalizeProblemMathString(String(str));
  s = s.replace(/`(\\\([\s\S]*?\\\))`/g, '$1');
  s = s.replace(/`(\$[\s\S]*?\$)`/g, '$1');
  s = s.replace(/<code[^>]*>\s*(\\\([\s\S]*?\\\))\s*<\/code>/gi, '$1');
  s = s.replace(/<code[^>]*>\s*(\$[\s\S]*?\$)\s*<\/code>/gi, '$1');
  return s;
}

/**
 * Încadrează fragmente LaTeX fără delimitatori (ex. `y = A \\sin(kx)` pe linie separată).
 * Păstrează intact ce e deja în $...$, \\(...\\) sau \\[...\\].
 *
 * @param {string} str
 * @returns {string}
 */
export function wrapUndelimitedLatexInProse(str) {
  if (str == null || str === '') return str;
  const stash = [];
  let s = String(str);

  s = s.replace(EXISTING_MATH_RE, (match) => {
    const token = `\uE000${stash.length}\uE001`;
    stash.push(match);
    return token;
  });

  const wrapLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed || !UNDELIMITED_LATEX_LINE_RE.test(trimmed)) return line;
    const indent = line.match(/^\s*/)?.[0] ?? '';
    return `${indent}\\(${trimmed}\\)`;
  };

  s = s
    .split('\n')
    .map(wrapLine)
    .join('\n');

  return s.replace(/\uE000(\d+)\uE001/g, (_, index) => stash[Number(index)]);
}

/**
 * Transformă $...$ / $$...$$ în delimitatori pe care MathJax 3 îi recunoaște în HTML.
 * Folosește [\s\S] (nu „.”) ca formula pe mai multe rânduri să nu scape neconvertită.
 *
 * @param {string|null|undefined} str
 * @returns {string}
 */
export function convertDollarToInlineMathJax(str) {
  if (str == null || str === '') return str;
  let s = prepareProblemHtmlMath(String(str));
  s = wrapUndelimitedLatexInProse(s);
  s = s.replace(/\uFF04/g, '$');
  // Display înainte de inline, altfel $$ este mâncat greșit de \$(.+?)\$
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_, body) => {
    const t = body.trim();
    return t ? `\\[${t}\\]` : '';
  });
  s = s.replace(/\$([\s\S]+?)\$/g, (_, expr) => {
    const t = expr.trim();
    return t ? `\\(${t}\\)` : '';
  });
  return s;
}
