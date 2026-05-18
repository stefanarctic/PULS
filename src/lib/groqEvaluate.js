/**
 * Two-step Groq evaluation pipeline for physics problems.
 *
 * Step 1 (Evaluator): A physics expert AI evaluates the student's solution
 *   in free-form text (Romanian or English from locale), grading per-barem when subpuncte are available.
 * Step 2 (Extractor): A second AI call parses the free-form evaluation into
 *   the structured JSON contract expected by normalizeAnalyzeResponse.
 *
 * Uses VITE_GROQ_API_KEY from .env (client-side — for production, move to server).
 */

import {
    callGroqWithModelFallbacks,
    getGroqReasoningModels,
    getGroqTextModels,
    getGroqVisionModels,
} from './groqClient';
import { summarizeProblemImages } from './problemImageSummary';

function getApiKey(locale = 'ro') {
    const key = import.meta.env.VITE_GROQ_API_KEY;
    if (!key || typeof key !== 'string' || !key.trim()) {
        throw new Error(
            locale === 'en'
                ? 'VITE_GROQ_API_KEY is missing from configuration.'
                : 'VITE_GROQ_API_KEY lipsește din configurare.'
        );
    }
    return key.trim();
}

/**
 * @param {object} params
 * @param {string[]} params.models
 * @param {Array<{role: string, content: string | Array}>} params.messages
 * @param {boolean} [params.jsonMode]
 * @returns {Promise<string>}
 */
async function callGroq({ models, messages, jsonMode = false, locale = 'ro' }) {
    return callGroqWithModelFallbacks({
        apiKey: getApiKey(locale),
        models,
        messages,
        jsonMode,
        temperature: 0.3,
    });
}

/**
 * Build the barem section for the evaluator prompt.
 * @param {object|null} problem
 * @returns {string}
 */
function buildBaremSection(problem, locale = 'ro') {
    const isEn = locale === 'en';
    if (!problem?.subpuncte?.length) {
        return isEn
            ? 'There is no explicit rubric with sub-items. Evaluate holistically on a scale from 0 to 10.'
            : 'Nu există un barem explicit cu subpuncte. Evaluează holistic pe o scală de la 0 la 10.';
    }

    const total = problem.punctajTotal || problem.subpuncte.reduce((s, sp) => s + (sp.punctaj || 0), 0);
    const lines = problem.subpuncte.map((sp, i) => {
        const id = sp.id || String.fromCharCode(97 + i);
        return isEn
            ? `  - Part ${id}: "${sp.cerinta}" — ${sp.punctaj} pts`
            : `  - Punctul ${id}: „${sp.cerinta}" — ${sp.punctaj}p`;
    });

    return isEn
        ? [
              'Rubric (sub-items with points):',
              ...lines,
              `Total points for the problem: ${total}`,
              '',
              `Final score is computed as: (sum of points earned / ${total}) × 10, rounded to one decimal place.`,
              'Express the result as X/10 (no % symbol).',
          ].join('\n')
        : [
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
 * @returns {{ models: string[], messages: Array }}
 */
function buildEvaluatorRequest({
    problemText,
    systemPrompt,
    solutionText,
    solutionPhotoDataUris,
    locale = 'ro',
}) {
    const isEn = locale === 'en';
    const hasImages = solutionPhotoDataUris && solutionPhotoDataUris.length > 0;
    const models = hasImages ? getGroqVisionModels() : getGroqReasoningModels();

    let userText = isEn ? `PROBLEM:\n${problemText}` : `PROBLEMĂ:\n${problemText}`;
    if (solutionText) {
        userText += isEn
            ? `\n\nSTUDENT'S SOLUTION (text):\n${solutionText}`
            : `\n\nSOLUȚIA ELEVULUI (text):\n${solutionText}`;
    }
    if (hasImages) {
        userText += isEn
            ? "\n\nThe student's solution also includes the images attached below."
            : '\n\nSOLUȚIA ELEVULUI include și imaginile atașate mai jos.';
    }

    if (!hasImages) {
        return {
            models,
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
        models,
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

const EVALUATOR_SYSTEM_PROMPT_BASE_EN = `You are an expert in solving physics problems and a fair, flexible grader. Analyse the problem (text and/or images) and the user's solution. Apply reasonable tolerance for numerical approximations. Reply exclusively in English.

For mathematical notation, use MathJax delimiters: $...$ for inline formulas and $$...$$ for display equations.

Your response MUST include ALL of the sections below, clearly labelled:

1. **Problem summary** — Briefly describe what the problem asks.

2. **What I understood from the student's solution** — Describe what the student wrote/drew, which approach they used, what they calculated.

3. **General feedback** — Summary of solution quality: what they did well, what they got wrong, recommendations.

4. **Given data from the statement** — List all quantities given in the problem, with values and units (e.g. $m = 2$ kg, $v_0 = 5$ m/s).

5. **Numerical results** — List the expected (correct) numerical results for each requirement, with units.

6. **Formulas used** — List relevant formulas using MathJax notation.

7. **Detailed evaluation per sub-item** — For each rubric sub-item, explain:
   - what the student did
   - whether it is correct or not, and why
   - how many points you award out of the sub-item total
   Format: "Part X: Y/Z points — explanation"

8. **Correct solution** — Present the full correct solution step by step.

9. **Error analysis** — What mistakes the student made and why they are wrong (if none, say so).

10. **Final answers** — The correct final answers for each sub-item.

11. **Total score** — Final score as X/10.`;

const EXTRACTOR_SYSTEM_PROMPT_EN = `You receive the full text of a physics evaluation written in English. Extract the information into exactly the following JSON structure.

Rules:
- Return ONLY a valid JSON object, with no text before or after.
- Keep MathJax delimiters ($...$ and $$...$$) exactly as in the original text.
- Keep all string content in English as in the evaluation.
- If a section has no matching content in the evaluation, use null for that field.
- rating.obtained and rating.max must be numbers. max is always 10.
- For long string fields (explanation, correctSolution, errorAnalysis), preserve markdown formatting.
- IMPORTANT for givenData and numericalResults: "label" and "value" fields that contain mathematical symbols or Greek letters MUST be wrapped in MathJax $...$ delimiters. Examples: "$\\ell$", "$\\lambda$", "$\\Delta D$", "$v_{max}$", "$2\\ell$". Never leave raw LaTeX without $ delimiters.
- IMPORTANT for the "unit" field in givenData and numericalResults: units must be plain text, NOT MathJax. Correct examples: "kg", "m/s", "N", "m/s²", "°", "J", "W". Do NOT use $\\mathrm{...}$ or other MathJax for units.

Exact JSON schema to return:
{
  "rating": { "obtained": <number>, "max": 10 },
  "problemSummary": "<short problem summary>",
  "feedbackSummary": "<general feedback on the student's solution>",
  "studentWorkReflection": "<what the model understood from the student's solution>",
  "givenData": [{ "label": "$<symbol with MathJax>$", "value": "<value>", "unit": "<unit>" }],
  "numericalResults": [{ "label": "$<symbol with MathJax>$", "value": "<value>", "unit": "<unit>" }],
  "formulasUsed": ["<formula1 with MathJax>", "<formula2>"],
  "explanation": "<detailed per-sub-item evaluation with scores>",
  "correctSolution": "<correct step-by-step solution>",
  "errorAnalysis": "<analysis of the student's mistakes>",
  "finalAnswer": "<correct final answers>"
}`;

/**
 * Main entry point: two-step Groq evaluation pipeline.
 *
 * @param {object} params
 * @param {string} params.problemText  — rendered problem text
 * @param {object|null} [params.problem] — full problem object with subpuncte/punctaj
 * @param {string} [params.solutionText]
 * @param {string[]} [params.solutionPhotoDataUris]
 * @param {'ro'|'en'} [params.locale] — UI language; evaluator and extractor reply in this language.
 * @returns {Promise<Record<string, unknown>>}
 */
export async function groqEvaluate({
    problemText,
    problem = null,
    solutionText,
    solutionPhotoDataUris,
    locale = 'ro',
}) {
    const loc = locale === 'en' ? 'en' : 'ro';
    const baremSection = buildBaremSection(problem, loc);
    const problemImageSummary = await summarizeProblemImages({ problemText, problem, locale: loc });

    const evaluatorBase = loc === 'en' ? EVALUATOR_SYSTEM_PROMPT_BASE_EN : EVALUATOR_SYSTEM_PROMPT_BASE;
    const evaluatorSystemPrompt = `${evaluatorBase}\n\n${baremSection}`;
    const imageSummaryHeader =
        loc === 'en'
            ? 'SUMMARY OF IMAGES ATTACHED TO THE PROBLEM STATEMENT:'
            : 'REZUMAT IMAGINI ATAȘATE ENUNȚULUI:';
    const enrichedProblemText = problemImageSummary
        ? `${problemText}\n\n${imageSummaryHeader}\n${problemImageSummary}`
        : problemText;

    // --- Step 1: Evaluator ---
    const evalRequest = buildEvaluatorRequest({
        problemText: enrichedProblemText,
        systemPrompt: evaluatorSystemPrompt,
        solutionText,
        solutionPhotoDataUris,
        locale: loc,
    });

    const evaluationText = await callGroq({
        models: evalRequest.models,
        messages: evalRequest.messages,
        locale: loc,
    });

    const extractorPrompt = loc === 'en' ? EXTRACTOR_SYSTEM_PROMPT_EN : EXTRACTOR_SYSTEM_PROMPT;

    // --- Step 2: Extractor ---
    const structuredJson = await callGroq({
        models: getGroqTextModels(),
        messages: [
            { role: 'system', content: extractorPrompt },
            { role: 'user', content: evaluationText },
        ],
        jsonMode: true,
        locale: loc,
    });

    try {
        const parsed = JSON.parse(structuredJson);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error(loc === 'en' ? 'Invalid JSON response from extractor.' : 'Răspuns JSON invalid de la extractor.');
        }
        return /** @type {Record<string, unknown>} */ (parsed);
    } catch (e) {
        console.error('[Groq Extractor] JSON parse failed', e, structuredJson);
        throw new Error(
            loc === 'en'
                ? 'Could not parse the structured evaluation response.'
                : 'Nu s-a putut parsa răspunsul structurat al evaluării.'
        );
    }
}
