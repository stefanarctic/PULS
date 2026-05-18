/**
 * Structură Firestore: `traduceri/{problemId}/en/main` — traducerea în engleză.
 * `problemId` = același ID ca la `problems/{problemId}`.
 */

export const TRADUCERI_COLLECTION = 'traduceri';
export const TRADUCERI_EN_SUBCOLLECTION = 'en';
/** Un singur document EN per problemă. */
export const TRADUCERI_EN_DOC_ID = 'main';

/** Versiune cache — incrementează după schimbări la structură / strategie. */
export const PROBLEM_TRANSLATION_VERSION = 5;

/** Câmpuri meta pe documentul de traducere — nu se îmbină în problema afișată. */
export const EN_DOC_META_KEYS = new Set([
  'problemId',
  'problemIndex',
  'sourceLang',
  'translationVersion',
  'updatedAt',
]);

/** Extrage din documentul `traduceri/.../en/main` doar câmpurile care se aplică peste problemă. */
export function enPayloadFromDoc(data) {
  if (!data || typeof data !== 'object') return null;
  const out = { ...data };
  for (const k of EN_DOC_META_KEYS) {
    delete out[k];
  }
  return out;
}

export function mergeProblemWithEnDoc(problem, enFirestoreDoc) {
  if (!problem || !enFirestoreDoc) return problem;
  const payload = enPayloadFromDoc(enFirestoreDoc);
  return mergeProblemWithEn(problem, payload);
}

// $$...$$, \[...\], \(...\), $...$
const MATH_RE = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$]*\$)/g;

function xmlEscapeForTag(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function xmlUnescapeFromTag(s) {
  return String(s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Împachetează segmentele math în <m>…</m> (DeepL ignore_tags=m). */
export function encodeMathForDeepL(raw) {
  return (raw ?? '').replace(MATH_RE, (match) => `<m>${xmlEscapeForTag(match)}</m>`);
}

/** Scoate <m> după răspuns și restaurează LaTeX-ul. */
export function decodeMathFromDeepL(translated) {
  if (translated == null) return '';
  return String(translated).replace(/<m>([\s\S]*?)<\/m>/gi, (_, inner) => xmlUnescapeFromTag(inner));
}

/** Ruta same-origin: Vite middleware (dev) sau Vercel /api (prod) — evită CORS DeepL. */
function translateProxyUrl() {
  return '/api/deepl/translate';
}

/** @param {string[]} texts */
async function deeplTranslateChunk(texts) {
  const res = await fetch(translateProxyUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepL proxy ${res.status}: ${errText}`);
  }
  const data = await res.json();
  if (!data.translations || !Array.isArray(data.translations)) {
    throw new Error('DeepL: răspuns neașteptat');
  }
  return data.translations.map((x) => x.text);
}

/** @param {string[]} texts */
export async function deeplTranslateMany(texts) {
  const list = texts.map((t) => (t == null ? '' : String(t)));
  const out = [];
  const chunkSize = 45;
  for (let i = 0; i < list.length; i += chunkSize) {
    const chunk = list.slice(i, i + chunkSize);
    const part = await deeplTranslateChunk(chunk);
    out.push(...part);
  }
  return out;
}

/**
 * @param {object} problema — documentul din Firestore (problems)
 * @returns {Promise<object>} câmpuri text traduse (titlu, continut, …) pentru documentul `en/{id}`
 */
export async function translateProblemToEnPayload(problema) {
  const encoded = [];

  const push = (s) => {
    encoded.push(encodeMathForDeepL(s ?? ''));
  };

  push(problema.titlu ?? '');
  push(problema.descriere ?? '');
  push(problema.continut ?? '');

  const formule = Array.isArray(problema.formule) ? problema.formule : [];
  for (const f of formule) {
    push(f ?? '');
  }

  const dateKeys = Object.keys(problema.date ?? {}).sort();
  for (const k of dateKeys) {
    push(k);
    push(String(problema.date[k] ?? ''));
  }

  const subpuncte = Array.isArray(problema.subpuncte) ? problema.subpuncte : [];
  for (const sp of subpuncte) {
    push(sp?.cerinta ?? '');
  }

  const translated = await deeplTranslateMany(encoded);
  for (let i = 0; i < translated.length; i++) {
    translated[i] = decodeMathFromDeepL(translated[i]);
  }

  let idx = 0;
  const en = {
    titlu: translated[idx++] ?? '',
    descriere: translated[idx++] ?? '',
    continut: translated[idx++] ?? '',
    formule: formule.map(() => translated[idx++] ?? ''),
    date: {},
    subpuncte: [],
  };

  for (let di = 0; di < dateKeys.length; di++) {
    const newKey = translated[idx++];
    const newVal = translated[idx++];
    en.date[newKey] = newVal;
  }

  for (let i = 0; i < subpuncte.length; i++) {
    en.subpuncte.push({ cerinta: translated[idx++] ?? '' });
  }

  return en;
}

export function mergeProblemWithEn(problema, en) {
  if (!en || typeof en !== 'object') return problema;
  const merged = { ...problema };
  if (en.titlu) merged.titlu = en.titlu;
  if (en.descriere != null && en.descriere !== '') merged.descriere = en.descriere;
  if (en.continut) merged.continut = en.continut;
  if (Array.isArray(en.formule)) merged.formule = en.formule;
  if (en.date && typeof en.date === 'object') merged.date = en.date;
  if (Array.isArray(en.subpuncte) && Array.isArray(problema.subpuncte)) {
    merged.subpuncte = problema.subpuncte.map((sp, i) => ({
      ...sp,
      cerinta: en.subpuncte[i]?.cerinta ?? sp.cerinta,
    }));
  }
  return merged;
}
