/**
 * Verifică dacă textul este în română și, dacă nu, îl traduce prin Groq API.
 * Folosește o euristică simplă pentru detecție + fallback la Groq pentru traducere.
 */

const GROQ_CHAT_COMPLETIONS = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

const ROMANIAN_MARKERS = [
  /[ăîâșțĂÎÂȘȚ]/,
  /\b(și|sau|este|sunt|care|pentru|acest|această|într-un|într-o|poate|despre|trebuie|foarte|acum|când|unde|cum|dacă|dintre|prin|doar|aici|apoi|astfel|deci|încă|totuși|precum|decât|oricare|fiecare|nimeni|cineva|oricine|orice)\b/i,
];

function looksRomanian(text) {
  if (!text || text.length < 20) return true;

  const plainText = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/\$\$[\s\S]*?\$\$/g, '')
    .replace(/\$[^$]+\$/g, '')
    .replace(/\\\([\s\S]*?\\\)/g, '')
    .replace(/\\\[[\s\S]*?\\\]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[#*_~>|[\](){}\\\/=+\-\d.,;:!?<>@^%&]+/g, ' ')
    .trim();

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

  const model = import.meta.env.VITE_GROQ_TRANSLATE_MODEL || DEFAULT_MODEL;

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
    const res = await fetch(GROQ_CHAT_COMPLETIONS, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.1,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn('[ensureRomanian] Groq error:', data?.error?.message || res.status);
      return text;
    }

    const translated = data.choices?.[0]?.message?.content;
    if (!translated || typeof translated !== 'string' || translated.trim().length === 0) {
      return text;
    }

    return translated.trim();
  } catch (err) {
    console.warn('[ensureRomanian] Eroare la traducere:', err);
    return text;
  }
}
