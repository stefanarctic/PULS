/** Alias pentru URL-uri și clasament: fără spații, doar litere (Unicode), cifre, _ și -. */

export const ALIAS_MIN_LENGTH = 3;
export const ALIAS_MAX_LENGTH = 32;

const ALIAS_PATTERN = /^[\p{L}\p{N}_-]+$/u;

/**
 * Elimină caracterele nepermise și limitează lungimea (pentru input controlat).
 */
export function sanitizeAliasInput(raw) {
  if (raw == null) return '';
  return String(raw).replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, ALIAS_MAX_LENGTH);
}

/**
 * @param {string} alias - de obicei deja trim și/sau trecut prin sanitize
 * @returns {string|null} mesaj de eroare în română sau null dacă e valid
 */
export function getAliasFormatError(alias) {
  const t = (alias || '').trim();
  if (!t) return 'Aliasul nu poate fi gol.';
  if (t.length < ALIAS_MIN_LENGTH) {
    return `Aliasul trebuie să aibă cel puțin ${ALIAS_MIN_LENGTH} caractere.`;
  }
  if (t.length > ALIAS_MAX_LENGTH) {
    return `Aliasul nu poate avea mai mult de ${ALIAS_MAX_LENGTH} caractere.`;
  }
  if (!ALIAS_PATTERN.test(t)) {
    return 'Aliasul poate conține doar litere, cifre, underscore (_) și cratimă (-), fără spații.';
  }
  return null;
}

/**
 * @returns {'empty'|'tooShort'|'tooLong'|'invalidPattern'|null}
 */
export function getAliasFormatIssueCode(alias) {
  const s = (alias || '').trim();
  if (!s) return 'empty';
  if (s.length < ALIAS_MIN_LENGTH) return 'tooShort';
  if (s.length > ALIAS_MAX_LENGTH) return 'tooLong';
  if (!ALIAS_PATTERN.test(s)) return 'invalidPattern';
  return null;
}
