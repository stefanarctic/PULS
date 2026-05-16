/**
 * Verifică dacă textul este în română și, dacă nu, îl traduce prin Groq API.
 * Folosește o euristică simplă pentru detecție + fallback la Groq pentru traducere.
 */

import { callGroqWithModelFallbacks, getGroqTextModels } from './groqClient';

function getTranslateModelChain() {
  const single = import.meta.env.VITE_GROQ_TRANSLATE_MODEL?.trim();
  const fallbacks = getGroqTextModels();
  if (single) {
    return [single, ...fallbacks.filter((m) => m !== single)];
  }
  return fallbacks;
}

const ROMANIAN_MARKERS = [
  /[ăîâșțĂÎÂȘȚ]/,
  /\b(și|si|sau|este|sunt|care|pentru|acest|această|într-un|într-o|poate|despre|trebuie|foarte|acum|când|unde|cum|dacă|dintre|prin|doar|aici|apoi|astfel|deci|încă|totuși|precum|decât|oricare|fiecare|nimeni|cineva|oricine|orice|deoarece|iar|însă|poți|vrei|știu|știți|vreți|răspuns|întreb|întrebare|cele|celelalte)\b/i,
];

function stripPlainForLangDetect(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\$\$[\s\S]*?\$\$/g, '')
    .replace(/\$[^$]+\$/g, '')
    .replace(/\\\([\s\S]*?\\\)/g, '')
    .replace(/\\\[[\s\S]*?\\\]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[#*_~>|[\](){}\\/=+\-\d.,;:!?<>@^%&]+/g, ' ')
    .trim();
}

function looksRomanian(text) {
  if (!text || text.length < 20) return true;

  const plainText = stripPlainForLangDetect(text);

  if (plainText.length < 15) return true;

  for (const marker of ROMANIAN_MARKERS) {
    if (marker.test(plainText)) return true;
  }

  return false;
}

/**
 * Asigură că textul AI este în limba română.
 * Dacă detectăm că nu e în română, trimitem la Groq pentru traducere.
 *
 * @param {string} text - Textul răspunsului AI
 * @returns {Promise<string>} - Textul în română
 */
export async function ensureRomanian(text) {
  if (!text || typeof text !== 'string') return text;
  if (looksRomanian(text)) return text;

  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    console.warn('[ensureRomanian] VITE_GROQ_API_KEY lipsă — nu pot traduce.');
    return text;
  }

  const models = getTranslateModelChain();

  const systemPrompt = `Ești un traducător profesionist. Primești un text care poate fi în orice limbă.

Reguli stricte:
- Traduce COMPLET textul în limba română.
- Păstrează EXACT formatarea Markdown (titluri, liste, bold, italic, code blocks, link-uri).
- Păstrează EXACT formulele matematice/LaTeX (tot ce e între $...$ sau $$...$$ sau \\(...\\) sau \\[...\\]).
- Păstrează code blocks și snippeturile de cod NETRADUSE — doar comentariile din cod pot fi traduse.
- Nu adăuga text suplimentar, explicații sau note. Returnează DOAR traducerea.
- Termenii tehnici de fizică/matematică care au echivalent clar în română trebuie traduși (ex: "velocity" → "viteza", "force" → "forța").
- Termenii tehnici IT fără echivalent consacrat pot rămâne în engleză.`;

  try {
    const translated = await callGroqWithModelFallbacks({
      apiKey: apiKey.trim(),
      models,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      jsonMode: false,
      temperature: 0.1,
    });

    if (!translated || typeof translated !== 'string' || translated.trim().length === 0) {
      return text;
    }

    return translated.trim();
  } catch (err) {
    console.warn('[ensureRomanian] Eroare la traducere:', err);
    return text;
  }
}

const ENGLISH_MARKERS = [
  /\b(the|and|you|your|what|why|when|how|because|would|could|physics|formula|problem|solve|explains?|thanks|thank you|welcome|sorry|their|than|motion|acceleration|force|forces|energy|mass|velocity|momentum|diagram|circuit|potential|approximately|derivative|particle|electron|electric|magnetic|kinetic|gravity|Newton|conserved|between|through|without|should|about|which|where|there|these|those|this|that)\b/i,
];
function looksLikeRomanianScript(text) {
  return typeof text === 'string' && ROMANIAN_MARKERS[0].test(text);
}

/**
 * True when assistant output should be normalized to English (Romanian-looking content).
 */
function probablyRomanianText(text) {
  if (!text || typeof text !== 'string') return false;
  // Diacritics anywhere in markdown
  if (ROMANIAN_MARKERS[0].test(text)) return true;
  const plain = stripPlainForLangDetect(text);
  if (!plain || plain.length < 8) return false;
  for (let i = 1; i < ROMANIAN_MARKERS.length; i++) {
    if (ROMANIAN_MARKERS[i].test(plain)) return true;
  }
  /** Physics / Bac phrasing sometimes appears without diacritics */
  const asciiRoCue =
    /\b(ramura|mecanica|mecanic|mi[sş]carii|corpuri|forte(le|lor)?|vitez(a|elor|ei)|accelerati|formula|barem|cinetica|cinetic|potentiala|potential|energiei)\b/i;
  return asciiRoCue.test(plain);
}

function looksEnglishRough(text) {
  if (!text || text.length < 15) return true;
  const plainText = stripPlainForLangDetect(text);

  if (plainText.length < 12) return true;
  if (looksLikeRomanianScript(text)) return false;

  for (const marker of ROMANIAN_MARKERS) {
    if (marker.test(plainText)) return false;
  }
  let hits = 0;
  for (const marker of ENGLISH_MARKERS) {
    if (marker.test(plainText)) hits++;
  }
  /** Require clearer English signal than before (Romanian prose often overlaps on "formula", "physics".) */
  return hits >= 1;
}

/**
 * If the upstream model replied in Romanian (or mixed), normalize to fluent English via Groq.
 */
export async function ensureEnglish(text) {
  if (!text || typeof text !== 'string') return text;

  if (!probablyRomanianText(text) && looksEnglishRough(text)) return text;

  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    console.warn('[ensureEnglish] Missing VITE_GROQ_API_KEY — cannot normalize language.');
    return text;
  }

  const models = getTranslateModelChain();

  const systemPrompt = `You are a professional translator. You receive text that might be Romanian or bilingual.

Strict rules:
- Translate the FULL text into clear, natural English for high-school physics students.
- Preserve Markdown exactly (headings, lists, bold, italic, code blocks, links).
- Preserve mathematical/LaTeX exactly ($...$, $$...$$, \\(...\\), \\[...\\]).
- Do not translate code inside fenced code blocks except comments if clearly natural language.
- Return ONLY the translated text — no preamble or notes.
- Prefer standard physics terminology in English (velocity, displacement, kinetic energy).`;

  try {
    const translated = await callGroqWithModelFallbacks({
      apiKey: apiKey.trim(),
      models,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      jsonMode: false,
      temperature: 0.15,
    });

    if (!translated || typeof translated !== 'string' || translated.trim().length === 0) {
      return text;
    }

    return translated.trim();
  } catch (err) {
    console.warn('[ensureEnglish] Translation failed:', err);
    return text;
  }
}

/**
 * Romanian UI expects Romanian replies; English UI expects English.
 */
export async function postProcessAiReply(text, locale) {
  if (locale === 'en') return ensureEnglish(text);
  return ensureRomanian(text);
}
