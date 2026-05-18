/**
 * Apel DeepL din Node (dev middleware Vite sau Vercel).
 * @param {string[]} texts
 * @param {string} apiKey
 * @returns {Promise<string[]>}
 */
export async function forwardTextsToDeepL(texts, apiKey) {
  const key = String(apiKey ?? '').trim();
  if (!key) {
    const err = new Error('DEEPL_KEY_MISSING');
    err.code = 'DEEPL_KEY_MISSING';
    throw err;
  }
  const base = key.includes(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
  const params = new URLSearchParams();
  for (const t of texts) {
    params.append('text', t == null ? '' : String(t));
  }
  params.set('source_lang', 'RO');
  params.set('target_lang', 'EN');
  params.set('preserve_formatting', '1');
  // Tag-uri <m> — păstrate de DeepL; textul în afara lor se traduce (înclusiv lângă formule).
  params.set('tag_handling', 'xml');
  params.set('ignore_tags', 'm');

  const res = await fetch(`${base}/v2/translate`, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: params.toString(),
  });

  const raw = await res.text();
  if (!res.ok) {
    const err = new Error(`DeepL ${res.status}: ${raw}`);
    err.status = res.status;
    throw err;
  }
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('DeepL: JSON invalid');
  }
  if (!data.translations || !Array.isArray(data.translations)) {
    throw new Error('DeepL: răspuns neașteptat');
  }
  return data.translations.map((x) => x.text);
}
