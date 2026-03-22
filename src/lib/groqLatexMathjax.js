/**
 * Al doilea pas după /api/analyze: trimite același JSON la Groq și primește înapoi
 * aceeași structură, cu formulele adaptate pentru MathJax în Markdown ($...$, $$...$$).
 *
 * Folosește VITE_GROQ_API_KEY din .env (vizibil în bundle-ul client — acceptabil doar
 * dacă ești conștient de limitare; pentru producție publică, mută apelul pe un API server).
 */

const GROQ_CHAT_COMPLETIONS = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

/**
 * @param {Record<string, unknown>} original
 * @param {Record<string, unknown>} groq
 */
function mergeAnalyzeResponse(original, groq) {
    if (!groq || typeof groq !== 'object' || Array.isArray(groq)) {
        return original;
    }
    /** @type {Record<string, unknown>} */
    const out = { ...original };
    for (const key of Object.keys(original)) {
        if (!(key in groq)) continue;
        const o = original[key];
        const g = groq[key];
        if (typeof o === 'string' && typeof g === 'string') {
            out[key] = g;
        } else if (Array.isArray(o) && Array.isArray(g)) {
            out[key] = o.map((item, i) => {
                if (i >= g.length) return item;
                if (typeof item === 'string' && typeof g[i] === 'string') return g[i];
                if (
                    item &&
                    typeof item === 'object' &&
                    !Array.isArray(item) &&
                    g[i] &&
                    typeof g[i] === 'object' &&
                    !Array.isArray(g[i])
                ) {
                    return mergeAnalyzeResponse(
                        /** @type {Record<string, unknown>} */ (item),
                        /** @type {Record<string, unknown>} */ (g[i]),
                    );
                }
                return item;
            });
        } else if (
            o &&
            typeof o === 'object' &&
            !Array.isArray(o) &&
            g &&
            typeof g === 'object' &&
            !Array.isArray(g)
        ) {
            out[key] = mergeAnalyzeResponse(
                /** @type {Record<string, unknown>} */ (o),
                /** @type {Record<string, unknown>} */ (g),
            );
        }
    }
    return out;
}

/**
 * @param {Record<string, unknown>} analyzeResponse
 * @returns {Promise<Record<string, unknown>>}
 */
export async function transformAnalyzeResponseForMathJax(analyzeResponse) {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
        return analyzeResponse;
    }

    const model = import.meta.env.VITE_GROQ_LATEX_MODEL || DEFAULT_MODEL;

    const systemPrompt = `Primești un singur obiect JSON (răspuns API analiză fizică).
Sarcina ta: returnezi UN singur obiect JSON cu ACELEAȘI chei și ACEEAȘI structură ca la intrare.

Reguli stricte:
- Nu modifica: chei, tipuri, array-uri de obiecte pentru date numerice (givenData, numericalResults) decât dacă un câmp e string și conține matematică.
- Nu modifica câmpul rating (string sau obiect) decât dacă e identic la structură și doar textul auxiliar din același obiect cere delimitatori — preferă să lași rating neschimbat.
- Pentru ORICE valoare string care conține notație matematică/LaTeX: rescrie astfel încât să se randeze cu MathJax în Markdown:
  - matematică în linie: delimitatori $ ... $
  - ecuații pe linii separate: $$ ... $$
  - înlocuiește \\(...\\) cu $...$ și \\[...\\] cu $$...$$ când e cazul.
- Pentru array-uri de stringuri (ex. formulasUsed): aplică aceleași reguli pe fiecare element.
- Păstrează textul în română neschimbat în afara delimitatorilor de formule.
- Nu adăuga chei noi. Nu șterge chei. Nu folosi blocuri markdown în afara JSON.
- Răspunsul tău trebuie să fie DOAR JSON valid, fără text înainte sau după.`;

    const body = {
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(analyzeResponse) },
        ],
        temperature: 0,
        response_format: { type: 'json_object' },
    };

    const res = await fetch(GROQ_CHAT_COMPLETIONS, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey.trim()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
        console.warn('[Groq LaTeX]', data?.error?.message || res.status, data);
        return analyzeResponse;
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text || typeof text !== 'string') {
        return analyzeResponse;
    }

    try {
        const parsed = JSON.parse(text);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return analyzeResponse;
        }
        return mergeAnalyzeResponse(analyzeResponse, /** @type {Record<string, unknown>} */ (parsed));
    } catch (e) {
        console.warn('[Groq LaTeX] JSON parse failed', e);
        return analyzeResponse;
    }
}
