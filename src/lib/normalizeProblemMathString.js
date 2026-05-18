/**
 * DeepL / cache EN: fragmente gen `$\\text{ ext}kg$`, `$\\text { ext } kg$`, `$\\textbf{ ext}m/s^2$`
 * (ruperea lui `\\text{kg}`). Nu lezează `\\text{extract}` etc.: după `{` trebuie să urmeze doar token-ul ext înainte de `}`.
 *
 * @param {string} s
 */
function repairDeepLBrokenExtUnitWrappers(s) {
  const extBrace = '\\{\\s*[eE][xX][tT]\\s*\\}';
  // După `{ ext}` opțional spațiu, apoi unitate „simpă” sau deja \\mathrm{…}
  const unitTail =
    '(\\s*)(\\\\mathrm\\{[^}]+\\}|[a-zA-Z%/µμ][a-zA-Z0-9./^²³°{}]*)';

  let out = s;
  const cmds = ['text', 'textbf', 'mathrm', 'textrm', 'textit', 'mbox'];
  for (const cmd of cmds) {
    out = out.replace(
      new RegExp(`\\\\${cmd}\\s*${extBrace}${unitTail}`, 'gi'),
      (_, sp, unitPart) =>
        /^\\mathrm\{/.test(unitPart)
          ? '\\,' + sp + unitPart
          : '\\,' + sp + '\\mathrm{' + unitPart + '}',
    );
  }

  for (const cmd of cmds) {
    out = out.replace(new RegExp(`\\\\${cmd}\\s*${extBrace}`, 'gi'), '');
  }

  // Evită \, \, după ce există deja \, în fața lui \\text{ ext}
  out = out.replace(/(\\,\s*){2,}/g, '\\,');

  return out;
}

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
  // Nu înlocui \\r dacă urmează literă — altfel \\rho, \\right, \\mathrm etc. se strică.
  s = s.replace(/\\r(?![a-zA-Z])/g, '<br/>');

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
  // Nu înlocui \\t dacă urmează literă — altfel \\text, \\tan, \\theta, \\textbf etc. → „ ext”.
  s = s.replace(/\\t(?![a-zA-Z])/g, ' ');

  s = repairDeepLBrokenExtUnitWrappers(s);

  return s;
}
