// Normalizează un string: elimină diacriticele și face lowercase
export function normalizeString(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
} 