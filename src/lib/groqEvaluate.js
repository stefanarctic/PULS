/**
 * Two-step Groq evaluation pipeline for physics problems.
 *
 * Step 1 (Evaluator): A physics expert AI evaluates the student's solution
 *   in free-form Romanian text, grading per-barem when subpuncte are available.
 * Step 2 (Extractor): A second AI call parses the free-form evaluation into
 *   the structured JSON contract expected by normalizeAnalyzeResponse.
 *
 * Uses VITE_GROQ_API_KEY from .env (client-side — for production, move to server).
 */

const GROQ_CHAT_COMPLETIONS = 'https://api.groq.com/openai/v1/chat/completions';
const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';
const TEXT_MODEL = 'llama-3.3-70b-versatile';
const EXTRACTOR_MODEL = 'llama-3.3-70b-versatile';

function getApiKey() {
    const key = import.meta.env.VITE_GROQ_API_KEY;
    if (!key || typeof key !== 'string' || !key.trim()) {
        throw new Error('VITE_GROQ_API_KEY lipsește din configurare.');
    }
    return key.trim();
}

/**
 * @param {object} params
 * @param {string} params.model
 * @param {Array<{role: string, content: string | Array}>} params.messages
 * @param {boolean} [params.jsonMode]
 * @returns {Promise<string>}
 */
async function callGroq({ model, messages, jsonMode = false }) {
    const apiKey = getApiKey();

    const body = {
        model,
        messages,
        temperature: 0.3,
        ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
    };

    const res = await fetch(GROQ_CHAT_COMPLETIONS, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
        const msg = data?.error?.message || `Groq API error ${res.status}`;
        console.error('[Groq]', msg, data);
        throw new Error(msg);
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text || typeof text !== 'string') {
        throw new Error('Răspuns gol de la Groq.');
    }
    return text;
}

/**
 * Build the barem section for the evaluator prompt.
 * @param {object|null} problem
 * @returns {string}
 */
function buildBaremSection(problem) {
    if (!problem?.subpuncte?.length) {
        return 'Nu există un barem explicit cu subpuncte. Evaluează holistic pe o scală de la 0 la 10.';
    }

    const total = problem.punctajTotal || problem.subpuncte.reduce((s, sp) => s + (sp.punctaj || 0), 0);
    const lines = problem.subpuncte.map((sp, i) => {
        const id = sp.id || String.fromCharCode(97 + i);
        return `  - Punctul ${id}: „${sp.cerinta}" — ${sp.punctaj}p`;
    });

    return [
        'Barem (subpuncte cu punctaje):',
        ...lines,
        `Punctaj total problemă: ${total}p`,
        '',
        `Scorul final se calculează astfel: (suma punctelor obținute / ${total}) × 10, rotunjit la o zecimală.`,
        'Rezultatul trebuie exprimat ca X/10 (fără simbol %).',
    ].join('\n');
}

/**
 * Build Groq messages for the evaluator step, handling vision when images are present.
 * @param {object} params
 * @param {string} params.problemText
 * @param {string} params.systemPrompt
 * @param {string} [params.solutionText]
 * @param {string[]} [params.solutionPhotoDataUris]
 * @returns {{ model: string, messages: Array }}
 */
function buildEvaluatorRequest({ problemText, systemPrompt, solutionText, solutionPhotoDataUris }) {
    const hasImages = solutionPhotoDataUris && solutionPhotoDataUris.length > 0;
    const model = hasImages ? VISION_MODEL : TEXT_MODEL;

    let userText = `PROBLEMĂ:\n${problemText}`;
    if (solutionText) {
        userText += `\n\nSOLUȚIA ELEVULUI (text):\n${solutionText}`;
    }
    if (hasImages) {
        userText += '\n\nSOLUȚIA ELEVULUI include și imaginile atașate mai jos.';
    }

    if (!hasImages) {
        return {
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userText },
            ],
        };
    }

    const contentParts = [{ type: 'text', text: userText }];
    for (const uri of solutionPhotoDataUris) {
        contentParts.push({
            type: 'image_url',
            image_url: { url: uri },
        });
    }

    return {
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: contentParts },
        ],
    };
}

const EVALUATOR_SYSTEM_PROMPT_BASE = `Ești un expert în rezolvarea problemelor de fizică și un evaluator corect și flexibil. Analizează problema (text și/sau imagine) și soluția utilizatorului. Aplică toleranță rezonabilă la aproximări numerice. Răspunde exclusiv în limba română.

Pentru notația matematică, folosește delimitatori MathJax: $...$ pentru formule în linie și $$...$$ pentru ecuații pe rând separat.

Răspunsul tău TREBUIE să conțină TOATE secțiunile de mai jos, clar etichetate:

1. **Rezumat problemă** — Descrie pe scurt ce cere problema.

2. **Ce am înțeles din soluția elevului** — Descrie ce a scris/desenat elevul, ce abordare a folosit, ce a calculat.

3. **Feedback general** — Un rezumat al calității soluției: ce a făcut bine, ce a făcut greșit, recomandări.

4. **Date din enunț** — Listează toate mărimile date în problemă, cu valori și unități de măsură (ex: $m = 2$ kg, $v_0 = 5$ m/s).

5. **Rezultate numerice** — Listează rezultatele numerice așteptate (corecte) pentru fiecare cerință, cu unități.

6. **Formule folosite** — Listează formulele relevante, folosind notație MathJax.

7. **Evaluare detaliată per subpunct** — Pentru fiecare subpunct din barem, explică:
   - ce a făcut elevul
   - dacă este corect sau nu, și de ce
   - câte puncte acordezi din totalul subpunctului
   Format: „Punctul X: Y/Z puncte — explicație"

8. **Rezolvare corectă** — Prezintă rezolvarea completă, corectă, pas cu pas.

9. **Analiza erorilor** — Ce greșeli a făcut elevul și de ce sunt greșeli (dacă nu există erori, menționează asta).

10. **Răspunsuri finale** — Răspunsurile corecte finale pentru fiecare subpunct.

11. **Punctaj total** — Scorul final ca X/10.`;

const EXTRACTOR_SYSTEM_PROMPT = `Primești textul complet al unei evaluări de fizică scrisă în limba română. Extrage informațiile în exact următoarea structură JSON.

Reguli:
- Returnează EXCLUSIV un obiect JSON valid, fără text înainte sau după.
- Păstrează delimitatorii MathJax ($...$ și $$...$$) exact cum apar în textul original.
- Păstrează textul în limba română ca atare.
- Dacă o secțiune nu are conținut corespunzător în evaluare, folosește null pentru acel câmp.
- rating.obtained și rating.max trebuie să fie numere. max este întotdeauna 10.
- Pentru câmpurile string lungi (explanation, correctSolution, errorAnalysis), păstrează formatarea markdown.
- IMPORTANT pentru givenData și numericalResults: câmpurile "label" și "value" care conțin simboluri matematice sau litere grecești TREBUIE să fie înfășurate în delimitatori MathJax $...$. Exemple: "$\\ell$", "$\\lambda$", "$\\Delta D$", "$v_{max}$", "$2\\ell$". Nu lăsa niciodată LaTeX fără delimitatori $.
- IMPORTANT pentru câmpul "unit" din givenData și numericalResults: unitățile de măsură trebuie să fie text simplu, NU MathJax. Exemple corecte: "kg", "m/s", "N", "m/s²", "°", "J", "W". NU folosi $\\mathrm{...}$ sau alți delimitatori MathJax pentru unități.

Schema JSON exactă de returnat:
{
  "rating": { "obtained": <număr>, "max": 10 },
  "problemSummary": "<rezumat scurt al problemei>",
  "feedbackSummary": "<feedback general pe soluția elevului>",
  "studentWorkReflection": "<ce a înțeles AI-ul din soluția elevului>",
  "givenData": [{ "label": "$<simbol cu MathJax>$", "value": "<valoare>", "unit": "<unitate>" }],
  "numericalResults": [{ "label": "$<simbol cu MathJax>$", "value": "<valoare>", "unit": "<unitate>" }],
  "formulasUsed": ["<formula1 cu MathJax>", "<formula2>"],
  "explanation": "<evaluare detaliată per subpunct cu punctaje>",
  "correctSolution": "<rezolvarea corectă pas cu pas>",
  "errorAnalysis": "<analiza erorilor elevului>",
  "finalAnswer": "<răspunsurile finale corecte>"
}`;

/**
 * Main entry point: two-step Groq evaluation pipeline.
 *
 * @param {object} params
 * @param {string} params.problemText  — rendered problem text
 * @param {object|null} [params.problem] — full problem object with subpuncte/punctaj
 * @param {string} [params.solutionText]
 * @param {string[]} [params.solutionPhotoDataUris]
 * @returns {Promise<Record<string, unknown>>}
 */
export async function groqEvaluate({ problemText, problem = null, solutionText, solutionPhotoDataUris }) {
    const baremSection = buildBaremSection(problem);

    const evaluatorSystemPrompt = `${EVALUATOR_SYSTEM_PROMPT_BASE}\n\n${baremSection}`;

    // --- Step 1: Evaluator ---
    const evalRequest = buildEvaluatorRequest({
        problemText,
        systemPrompt: evaluatorSystemPrompt,
        solutionText,
        solutionPhotoDataUris,
    });

    const evaluationText = await callGroq({
        model: evalRequest.model,
        messages: evalRequest.messages,
    });

    // --- Step 2: Extractor ---
    const structuredJson = await callGroq({
        model: EXTRACTOR_MODEL,
        messages: [
            { role: 'system', content: EXTRACTOR_SYSTEM_PROMPT },
            { role: 'user', content: evaluationText },
        ],
        jsonMode: true,
    });

    try {
        const parsed = JSON.parse(structuredJson);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('Răspuns JSON invalid de la extractor.');
        }
        return /** @type {Record<string, unknown>} */ (parsed);
    } catch (e) {
        console.error('[Groq Extractor] JSON parse failed', e, structuredJson);
        throw new Error('Nu s-a putut parsa răspunsul structurat al evaluării.');
    }
}
