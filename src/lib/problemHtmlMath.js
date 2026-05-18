import { normalizeProblemMathString } from './normalizeProblemMathString';

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
 * Transformă $...$ / $$...$$ în delimitatori pe care MathJax 3 îi recunoaște în HTML.
 * Folosește [\s\S] (nu „.”) ca formula pe mai multe rânduri să nu scape neconvertită.
 *
 * @param {string|null|undefined} str
 * @returns {string}
 */
export function convertDollarToInlineMathJax(str) {
  if (str == null || str === '') return str;
  let s = prepareProblemHtmlMath(String(str));
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
