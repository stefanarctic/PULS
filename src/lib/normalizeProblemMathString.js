/**
 * Uniformizează text matematic din Firestore / DeepL: uneori LaTeX ajunge cu backslash dublu
 * (ex. \\omega, \\frac) sau cu secvențe pseudo-escaped (\\n vizibil în enunț).
 *
 * Folosit la afișare și după decode DeepL — nu alterează o singură backslash corectă în comenzi TeX.
 *
 * @param {string|null|undefined} str
 * @returns {string|null|undefined}
 */
export function normalizeProblemMathString(str) {
  if (str == null || str === '') return str;
  let s = String(str);

  // Secvențe tip „\r\n” ca text (slash + litere), înainte de prăbușirea backslash-urilor duble
  s = s.replace(/\\r\\n/g, '<br/>');
  s = s.replace(/\\r/g, '<br/>');

  let prev;
  let guard = 0;
  do {
    prev = s;
    // \\( \\) \\[ \\] și acolade — delimitatori sau nesting adesea dublate greșit
    s = s.replace(/\\\\([\(\)\[\]{}])/g, '\\$1');
    // \\omega, \\frac, etc.
    s = s.replace(/\\\\([a-zA-Z]+)/g, '\\$1');
    guard++;
  } while (s !== prev && guard < 24);

  // După prăbușire: pseudo-newline \n (nu \nu, \nabla, …)
  s = s.replace(/\\n(?![a-zA-Z])/g, '<br/>');
  s = s.replace(/\\t/g, ' ');

  return s;
}
