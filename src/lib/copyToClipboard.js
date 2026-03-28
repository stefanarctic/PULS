/**
 * Copiază text în clipboard (API modern + fallback pentru contexte fără permisiuni).
 */
export async function copyToClipboard(text) {
  if (text == null || text === '') return false;
  const s = String(text);
  try {
    await navigator.clipboard.writeText(s);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = s;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}
