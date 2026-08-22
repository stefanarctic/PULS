/**
 * Puls-AI solve / analyze pe Groq (Llama 4 Scout), cu post-procesarea JSON
 * descrisă de fluxul original puls-ai-two.
 */

import {
    callGroqWithModelFallbacks,
    getGroqApiKey,
    getGroqAssistantModels,
    getGroqVisionModels,
} from './groqClient';
import {
    ANALYZE_JSON_KEYS_HINT,
    ANALYZE_JSON_KEYS_HINT_EN,
    SOLVE_JSON_KEYS_HINT,
    SOLVE_JSON_KEYS_HINT_EN,
    getAnalyzeSystemPrompt,
    getSolveSystemPrompt,
} from './assistantPrompts';

const PLACEHOLDER_RE =
    /^(explicații detaliate|explicatii detaliate|vom detalia|vom calcula|detailed explanations?|we will (detail|calculate)|n\/a|todo)\b/i;

const NUMERIC_LINE_RE =
    /(\d+([.,]\d+)?\s*(N|kg|g|m\/s²|m\/s2|m\/s|m\b|cm|J|W|Hz|A|V|Ω|Pa|°|rad)|[A-Za-zα-ωΑ-Ω][A-Za-z0-9_]*\s*=\s*-?\d)/i;

/**
 * @param {string} text
 * @param {number} max
 */
function truncateText(text, max) {
    if (typeof text !== 'string') return '';
    if (text.length <= max) return text;
    return text.slice(0, max);
}

/**
 * @param {unknown} raw
 */
export function parseJsonFromModelReply(raw) {
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        return /** @type {Record<string, unknown>} */ (raw);
    }
    if (typeof raw !== 'string' || !raw.trim()) {
        throw new Error('Răspuns gol de la model.');
    }

    const trimmed = raw.trim();

    const fenceJson = trimmed.match(/```json\s*([\s\S]*?)```/i);
    if (fenceJson) {
        return JSON.parse(fenceJson[1].trim());
    }

    const fence = trimmed.match(/```\s*([\s\S]*?)```/);
    if (fence) {
        try {
            return JSON.parse(fence[1].trim());
        } catch {
            /* continue */
        }
    }

    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        try {
            return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
        } catch {
            /* continue */
        }
    }

    return JSON.parse(trimmed);
}

/**
 * @param {unknown} value
 * @param {string} key
 */
function unwrapNestedJsonField(value, key) {
    if (typeof value !== 'string') return value;
    const t = value.trim();
    if (!t.startsWith('{')) return value;
    try {
        const obj = JSON.parse(t);
        if (obj && typeof obj === 'object' && !Array.isArray(obj) && key in obj) {
            return obj[key];
        }
    } catch {
        /* keep original */
    }
    return value;
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function normalizeFormulasUsed(value) {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.map((item) => String(item ?? '').trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        if (trimmed.startsWith('[')) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed)) {
                    return parsed.map((item) => String(item ?? '').trim()).filter(Boolean);
                }
            } catch {
                /* split below */
            }
        }
        return trimmed
            .split(/\n|;/)
            .map((item) => item.replace(/^[-*]\s*/, '').trim())
            .filter(Boolean);
    }
    return [];
}

/**
 * @param {unknown} value
 * @returns {Array<{ label: string, value: string, unit?: string }>}
 */
function normalizeQuantityList(value) {
    if (!value) return [];

    let parsed = value;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        try {
            parsed = JSON.parse(trimmed);
        } catch {
            return [{ label: trimmed, value: '' }];
        }
    }

    if (Array.isArray(parsed)) {
        return parsed
            .map((item) => {
                if (item == null) return null;
                if (typeof item === 'string') {
                    const m = item.match(/^(.+?)\s*=\s*(.+)$/);
                    if (m) return { label: m[1].trim(), value: m[2].trim() };
                    return { label: item, value: '' };
                }
                if (typeof item !== 'object') return { label: String(item), value: '' };
                const rec = /** @type {Record<string, unknown>} */ (item);
                const label = String(rec.label ?? rec.name ?? rec.simbol ?? rec.symbol ?? '');
                const val = String(rec.value ?? rec.valoare ?? rec.result ?? '');
                const unit = rec.unit != null ? String(rec.unit) : rec.unitate != null ? String(rec.unitate) : undefined;
                if (!label && !val) return null;
                return unit ? { label, value: val, unit } : { label, value: val };
            })
            .filter(Boolean);
    }

    if (typeof parsed === 'object') {
        return Object.entries(/** @type {Record<string, unknown>} */ (parsed))
            .map(([label, v]) => {
                if (v && typeof v === 'object' && !Array.isArray(v)) {
                    const rec = /** @type {Record<string, unknown>} */ (v);
                    const unit = rec.unit != null ? String(rec.unit) : undefined;
                    return unit
                        ? { label, value: String(rec.value ?? ''), unit }
                        : { label, value: String(rec.value ?? '') };
                }
                return { label, value: String(v ?? '') };
            })
            .filter((row) => row.label || row.value);
    }

    return [];
}

/**
 * @param {string} correctSolution
 */
function extractNumericFinale(correctSolution) {
    const lines = String(correctSolution || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
    const numeric = lines.filter((line) => NUMERIC_LINE_RE.test(line));
    if (numeric.length) return numeric.slice(-6).join('\n');
    return lines.slice(-3).join('\n');
}

/**
 * @param {unknown} rating
 */
function normalizeRating(rating) {
    if (rating == null) return '';
    if (typeof rating === 'string') return rating.trim();
    if (typeof rating === 'object') {
        const rec = /** @type {Record<string, unknown>} */ (rating);
        const obtained = rec.obtained ?? rec.score ?? rec.nota;
        const max = rec.max ?? rec.total ?? 10;
        if (obtained != null) return `${obtained}/${max}`;
    }
    return String(rating);
}

/**
 * @param {unknown} raw
 * @returns {Record<string, unknown>}
 */
export function postProcessPhysicsJson(raw) {
    const data = parseJsonFromModelReply(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('JSON invalid de la model.');
    }

    const out = { ...data };

    for (const key of Object.keys(out)) {
        out[key] = unwrapNestedJsonField(out[key], key);
    }

    out.formulasUsed = normalizeFormulasUsed(out.formulasUsed);
    out.givenData = normalizeQuantityList(out.givenData);
    out.numericalResults = normalizeQuantityList(out.numericalResults);

    const explanation = typeof out.explanation === 'string' ? out.explanation.trim() : '';
    const correctSolution = typeof out.correctSolution === 'string' ? out.correctSolution.trim() : '';
    if (!explanation || PLACEHOLDER_RE.test(explanation)) {
        out.explanation = correctSolution || explanation;
    }

    const finalAnswer = typeof out.finalAnswer === 'string' ? out.finalAnswer.trim() : String(out.finalAnswer ?? '');
    if (!finalAnswer || PLACEHOLDER_RE.test(finalAnswer)) {
        out.finalAnswer = extractNumericFinale(correctSolution) || finalAnswer;
    }

    return out;
}

/**
 * @param {string} value
 */
function asMathIfNeeded(value) {
    const t = String(value ?? '').trim();
    if (!t) return t;
    if (/\$|\\\(|\\\[/.test(t)) return t;
    if (/[=^_\\]|\\frac|\\sqrt|[α-ωΑ-Ω]/.test(t)) return `$${t}$`;
    return t;
}

/**
 * @param {{ label: string, value: string, unit?: string }} item
 */
function formatQuantityLine(item) {
    if (!item || typeof item !== 'object') {
        return `- ${asMathIfNeeded(String(item ?? ''))}`;
    }
    const rec = /** @type {{ label?: string, value?: string, unit?: string }} */ (item);
    const label = asMathIfNeeded(rec.label || '');
    const value = asMathIfNeeded(rec.value || '');
    const unit = rec.unit ? ` ${rec.unit}` : '';
    if (label && value) return `- ${label} = ${value}${unit}`;
    if (label) return `- ${label}${unit}`;
    return `- ${value}${unit}`;
}

/**
 * @param {Record<string, unknown>} data
 * @param {'ro'|'en'} locale
 * @param {'solve'|'analyze'} mode
 */
export function formatPhysicsResultForChat(data, locale = 'ro', mode = 'solve') {
    const isEn = locale === 'en';
    const parts = [];

    const problemSummary = typeof data.problemSummary === 'string' ? data.problemSummary.trim() : '';
    const feedbackSummary = typeof data.feedbackSummary === 'string' ? data.feedbackSummary.trim() : '';
    const explanation = typeof data.explanation === 'string' ? data.explanation.trim() : '';
    const correctSolution = typeof data.correctSolution === 'string' ? data.correctSolution.trim() : '';
    const errorAnalysis = typeof data.errorAnalysis === 'string' ? data.errorAnalysis.trim() : '';
    const studentWorkReflection =
        typeof data.studentWorkReflection === 'string' ? data.studentWorkReflection.trim() : '';
    const finalAnswer = typeof data.finalAnswer === 'string' ? data.finalAnswer.trim() : String(data.finalAnswer ?? '');
    const formulas = Array.isArray(data.formulasUsed) ? data.formulasUsed : [];
    const givenData = Array.isArray(data.givenData) ? data.givenData : [];
    const numericalResults = Array.isArray(data.numericalResults) ? data.numericalResults : [];
    const rating = normalizeRating(data.rating);

    if (problemSummary) {
        parts.push(`**${isEn ? 'Summary' : 'Rezumat'}**\n\n${problemSummary}`);
    }
    if (mode === 'analyze' && feedbackSummary) {
        parts.push(`**${isEn ? 'Feedback' : 'Feedback'}**\n\n${feedbackSummary}`);
    }
    if (mode === 'analyze' && rating) {
        parts.push(`**${isEn ? 'Score' : 'Punctaj'}**\n\n${rating}`);
    }
    if (givenData.length) {
        parts.push(
            `**${isEn ? 'Given data' : 'Date din enunț'}**\n\n${givenData.map(formatQuantityLine).join('\n')}`,
        );
    }
    if (explanation) {
        parts.push(`**${isEn ? 'Explanation' : 'Explicație'}**\n\n${explanation}`);
    }
    if (correctSolution) {
        parts.push(`**${isEn ? 'Solution' : 'Rezolvare'}**\n\n${correctSolution}`);
    }
    if (mode === 'analyze' && errorAnalysis) {
        parts.push(`**${isEn ? 'Error analysis' : 'Analiza erorilor'}**\n\n${errorAnalysis}`);
    }
    if (mode === 'analyze' && studentWorkReflection) {
        parts.push(
            `**${isEn ? "Student's work" : 'Lucrarea elevului'}**\n\n${studentWorkReflection}`,
        );
    }
    if (formulas.length) {
        parts.push(
            `**${isEn ? 'Formulas' : 'Formule'}**\n\n${formulas
                .map((f) => `- ${asMathIfNeeded(String(f))}`)
                .join('\n')}`,
        );
    }
    if (numericalResults.length) {
        parts.push(
            `**${isEn ? 'Results' : 'Rezultate'}**\n\n${numericalResults.map(formatQuantityLine).join('\n')}`,
        );
    }
    if (finalAnswer) {
        parts.push(`**${isEn ? 'Final answer' : 'Răspuns final'}**\n\n${asMathIfNeeded(finalAnswer)}`);
    }

    return parts.join('\n\n').trim();
}

/**
 * @param {object} params
 * @param {'solve'|'analyze'} params.mode
 * @param {string} params.problemText
 * @param {string} [params.additionalContext]
 * @param {string} [params.solutionText]
 * @param {string[]} [params.imageDataUris]
 * @param {string[]} [params.solutionImageDataUris]
 * @param {'ro'|'en'} [params.locale]
 * @param {AbortSignal} [params.signal]
 */
export async function runPulsAiPhysics({
    mode,
    problemText,
    additionalContext,
    solutionText,
    imageDataUris = [],
    solutionImageDataUris = [],
    locale = 'ro',
    signal,
}) {
    const loc = locale === 'en' ? 'en' : 'ro';
    const isAnalyze = mode === 'analyze';
    const hasImages =
        (Array.isArray(imageDataUris) && imageDataUris.length > 0) ||
        (Array.isArray(solutionImageDataUris) && solutionImageDataUris.length > 0);

    const textLimit = hasImages ? 4000 : 8000;
    const problem =
        truncateText(String(problemText || '').trim(), textLimit) ||
        (loc === 'en' ? '(no problem text provided)' : '(nu este furnizat text)');

    /** @type {Array<{ type: string, text?: string, image_url?: { url: string } }>} */
    const userContent = [];

    userContent.push({
        type: 'text',
        text:
            loc === 'en'
                ? `Problem text:\n${problem}`
                : `Textul Problemei:\n${problem}`,
    });

    for (const uri of imageDataUris || []) {
        if (typeof uri === 'string' && uri.startsWith('data:image/')) {
            userContent.push({ type: 'image_url', image_url: { url: uri } });
        }
    }

    const extra = truncateText(String(additionalContext || '').trim(), textLimit);
    if (extra) {
        userContent.push({
            type: 'text',
            text:
                loc === 'en'
                    ? `Additional context / requested exercise: ${extra}`
                    : `Context Adițional/Exercițiul dorit: ${extra}`,
        });
    }

    if (isAnalyze) {
        const solution = truncateText(String(solutionText || '').trim(), textLimit);
        if (solution) {
            userContent.push({
                type: 'text',
                text:
                    loc === 'en'
                        ? `User solution text:\n${solution}`
                        : `Textul Soluției Utilizatorului:\n${solution}`,
            });
        }
        const solImages = (solutionImageDataUris || []).filter(
            (uri) => typeof uri === 'string' && uri.startsWith('data:image/'),
        );
        if (solImages.length) {
            userContent.push({
                type: 'text',
                text:
                    loc === 'en'
                        ? 'Images of the user solution (one or more follow):'
                        : 'Imagini cu Soluția Utilizatorului (urmează una sau mai multe):',
            });
            for (const uri of solImages) {
                userContent.push({ type: 'image_url', image_url: { url: uri } });
            }
        }
    }

    userContent.push({
        type: 'text',
        text: isAnalyze
            ? loc === 'en'
                ? ANALYZE_JSON_KEYS_HINT_EN
                : ANALYZE_JSON_KEYS_HINT
            : loc === 'en'
              ? SOLVE_JSON_KEYS_HINT_EN
              : SOLVE_JSON_KEYS_HINT,
    });

    const groqMessages = [
        {
            role: 'system',
            content: isAnalyze ? getAnalyzeSystemPrompt(loc) : getSolveSystemPrompt(loc),
        },
        {
            role: 'user',
            content: hasImages
                ? userContent
                : userContent
                      .map((part) => part.text)
                      .filter(Boolean)
                      .join('\n\n'),
        },
    ];
    const groqCommon = {
        apiKey: getGroqApiKey(loc),
        models: hasImages ? getGroqVisionModels() : getGroqAssistantModels(),
        messages: groqMessages,
        temperature: 0.2,
        maxTokens: isAnalyze ? 3000 : 4000,
        signal,
    };

    let processed;
    try {
        const raw = await callGroqWithModelFallbacks({ ...groqCommon, jsonMode: true });
        processed = postProcessPhysicsJson(raw);
    } catch (err) {
        if (err?.name === 'AbortError') throw err;
        const raw = await callGroqWithModelFallbacks({ ...groqCommon, jsonMode: false });
        processed = postProcessPhysicsJson(raw);
    }
    const formatted = formatPhysicsResultForChat(processed, loc, isAnalyze ? 'analyze' : 'solve');
    if (!formatted) {
        throw new Error(
            loc === 'en'
                ? 'The physics model returned an empty solution.'
                : 'Modelul de fizică a returnat o soluție goală.',
        );
    }
    return formatted;
}
