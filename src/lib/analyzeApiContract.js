/**
 * Contract de normalizare pentru răspunsul evaluării (Groq pipeline).
 *
 * Câmpuri așteptate (JSON):
 * - rating: { obtained: number, max: number }
 * - problemSummary, feedbackSummary: string (markdown ok)
 * - studentWorkReflection?: string
 * - givenData?: Array<{ label: string, value: string, unit?: string }>
 * - numericalResults?: Array<{ label: string, value: string, unit?: string }>
 * - formulasUsed?: string | string[]
 * - explanation, correctSolution, errorAnalysis, finalAnswer?: string (markdown)
 */

const DEFAULT_MAX_SCORE = 10;

/** @param {unknown} v */
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/**
 * Extrage rating din text (legacy).
 * @param {string} [text]
 * @returns {string|null}
 */
export const extractRatingFromJson = (text) => {
    if (!text) return null;

    const jsonMatches = text.match(/\{[\s\S]{0,3000}?\}/g);
    if (jsonMatches) {
        for (const jsonStr of jsonMatches) {
            try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.rating && typeof parsed.rating === 'string') {
                    const rating = parsed.rating.trim();
                    if (rating && rating !== '—/10 puncte' && rating !== '-/10 puncte') {
                        return rating;
                    }
                }
            } catch {
                const ratingMatch = jsonStr.match(/"rating"\s*:\s*"([^"]+)"/);
                if (ratingMatch && ratingMatch[1]) {
                    const rating = ratingMatch[1].trim();
                    if (rating && rating !== '—/10 puncte' && rating !== '-/10 puncte') {
                        return rating;
                    }
                }
            }
        }
    }

    const jsonPatterns = [
        /"rating"\s*:\s*"([^"]+)"/,
        /"rating"\s*:\s*'([^']+)'/,
        /"rating"\s*:\s*([^",}\]]+)/,
        /rating["\s]*:["\s]*([^",}\]]+)/i,
    ];

    for (const pattern of jsonPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            const rating = match[1].trim();
            if (
                rating &&
                rating !== '—/10 puncte' &&
                rating !== '-/10 puncte' &&
                (/\d/.test(rating) || rating.includes('/'))
            ) {
                return rating;
            }
        }
    }

    const plainTextPatterns = [
        /Punctaj\s+total:\s*(\d+\/\d+\s*puncte)/i,
        /Punctaj\s+obținut:\s*(\d+\/\d+\s*puncte)/i,
        /Punctaj:\s*(\d+\/\d+\s*puncte)/i,
        /(\d+\/\d+\s*puncte)/,
    ];

    for (const pattern of plainTextPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim();
        }
    }

    return null;
};

/**
 * @param {string} [text]
 */
const cleanText = (text) => {
    if (!text) return text;

    let cleaned = text;

    cleaned = cleaned.replace(
        /\{\s*"solution"\s*:\s*\{[\s\S]*?\},\s*"errorAnalysis"\s*:\s*"[\s\S]*?",\s*"rating"\s*:\s*"[\s\S]*?"\s*\}/g,
        '',
    );
    cleaned = cleaned.replace(
        /\{\s*"solution"\s*:\s*"[\s\S]*?",\s*"errorAnalysis"\s*:\s*"[\s\S]*?",\s*"rating"\s*:\s*"[\s\S]*?"\s*\}/g,
        '',
    );
    cleaned = cleaned.replace(/\{\s*"rating"\s*:\s*"[^"]*"\s*\}/g, '');

    cleaned = cleaned.replace(/^[a-z]\)\s+[^:]*:\s+\d+\s+puncte\s+\([^)]*\)\s*$/gim, '');
    cleaned = cleaned.replace(/Punctaj\s+total:\s*\d+\/\d+\s+puncte/gi, '');
    cleaned = cleaned.replace(/Punctaj\s+obținut:\s*\d+\/\d+\s+puncte/gi, '');
    cleaned = cleaned.replace(/Punctaj:\s*\d+\/\d+\s+puncte/gi, '');

    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

    return cleaned.trim();
};

/**
 * @param {unknown} row
 * @returns {{ label: string, value: string, unit?: string } | null}
 */
const normalizeDataRow = (row) => {
    if (!row || typeof row !== 'object') return null;
    const o = /** @type {Record<string, unknown>} */ (row);
    const label = o.label != null ? String(o.label).trim() : '';
    const value = o.value != null ? String(o.value).trim() : '';
    const unit = o.unit != null ? String(o.unit).trim() : '';
    if (!label && !value && !unit) return null;
    return {
        label: label || '—',
        value: value || '—',
        ...(unit ? { unit } : {}),
    };
};

/**
 * @param {unknown} arr
 * @returns {Array<{ label: string, value: string, unit?: string }>|null}
 */
const normalizeDataArray = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const out = [];
    for (const item of arr) {
        const row = normalizeDataRow(item);
        if (row) out.push(row);
    }
    return out.length ? out : null;
};

/**
 * @param {unknown} f
 * @returns {string[]|null}
 */
export const normalizeFormulasUsed = (f) => {
    if (f == null) return null;
    if (Array.isArray(f)) {
        const s = f.map((x) => String(x).trim()).filter(Boolean);
        return s.length ? s : null;
    }
    if (typeof f === 'string' && f.trim()) {
        return [f.trim()];
    }
    return null;
};

/**
 * @param {string} ratingStr
 * @returns {{ obtained: number, max: number } | null}
 */
export const parseRatingFraction = (ratingStr) => {
    if (!ratingStr || typeof ratingStr !== 'string') return null;
    const m = ratingStr.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)/);
    if (!m) return null;
    return {
        obtained: parseFloat(m[1]),
        max: parseFloat(m[2]) || DEFAULT_MAX_SCORE,
    };
};

/**
 * @param {unknown} rating
 * @returns {{ display: string | null, score: { obtained: number, max: number } | null }}
 */
export const normalizeRatingField = (rating) => {
    if (rating == null) return { display: null, score: null };

    if (typeof rating === 'object' && !Array.isArray(rating)) {
        const o = /** @type {Record<string, unknown>} */ (rating);
        const obtained = Number(o.obtained);
        const max = Number(o.max);
        if (Number.isFinite(obtained) && Number.isFinite(max) && max > 0) {
            const display = `${obtained}/${max} puncte`;
            return { display, score: { obtained, max } };
        }
    }

    if (typeof rating === 'string' && rating.trim()) {
        const t = rating.trim();
        if (t === '—/10 puncte' || t === '-/10 puncte') {
            return { display: null, score: null };
        }
        const score = parseRatingFraction(t);
        return { display: t, score };
    }

    return { display: null, score: null };
};

/**
 * Uneori modelul returnează întreg JSON-ul ca string în `solution`.
 * @param {Record<string, unknown>} raw
 */
const mergeEmbeddedSolutionJson = (raw) => {
    const sol = raw.solution;
    if (typeof sol !== 'string') return raw;

    const s = sol.trim();
    if (!s.startsWith('{')) return raw;

    try {
        const parsed = JSON.parse(s);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const p = /** @type {Record<string, unknown>} */ (parsed);
            const hasContractKeys =
                'problemSummary' in p ||
                'correctSolution' in p ||
                'givenData' in p ||
                'numericalResults' in p ||
                'formulasUsed' in p;
            if (!hasContractKeys) return raw;

            return {
                ...p,
                ...raw,
                errorAnalysis: raw.errorAnalysis ?? p.errorAnalysis,
                rating: raw.rating ?? p.rating,
            };
        }
    } catch {
        /* ignore */
    }
    return raw;
};

/**
 * @typedef {Object} NormalizedAnalyzeResponse
 * @property {string|null} ratingDisplay
 * @property {{ obtained: number, max: number }|null} ratingScore
 * @property {string|null} problemSummary
 * @property {string|null} feedbackSummary
 * @property {string|null} studentWorkReflection
 * @property {Array<{label:string,value:string,unit?:string}>|null} givenData
 * @property {Array<{label:string,value:string,unit?:string}>|null} numericalResults
 * @property {string[]|null} formulasUsed
 * @property {string|null} explanation
 * @property {string|null} correctSolution
 * @property {string|null} errorAnalysis
 * @property {string|null} finalAnswer
 * @property {boolean} hasStructured
 * @property {boolean} legacyFallback
 */

/**
 * @param {Record<string, unknown>} raw
 * @returns {NormalizedAnalyzeResponse}
 */
export const normalizeAnalyzeResponse = (raw) => {
    const merged = mergeEmbeddedSolutionJson(raw);

    const ratingFromField = normalizeRatingField(merged.rating);
    const legacySolution = typeof merged.solution === 'string' ? merged.solution : '';
    const legacyError = typeof merged.errorAnalysis === 'string' ? merged.errorAnalysis : '';

    const ratingFromLegacy =
        ratingFromField.display ||
        extractRatingFromJson(legacySolution) ||
        extractRatingFromJson(legacyError);

    const ratingDisplay = ratingFromField.display || ratingFromLegacy || null;
    const ratingScore =
        ratingFromField.score ||
        (ratingFromLegacy ? parseRatingFraction(ratingFromLegacy) : null);

    const problemSummary = isNonEmptyString(merged.problemSummary)
        ? merged.problemSummary.trim()
        : null;
    const feedbackSummary = isNonEmptyString(merged.feedbackSummary)
        ? merged.feedbackSummary.trim()
        : null;
    const studentWorkReflection = isNonEmptyString(merged.studentWorkReflection)
        ? merged.studentWorkReflection.trim()
        : null;

    const givenData = normalizeDataArray(merged.givenData);
    const numericalResults = normalizeDataArray(merged.numericalResults);

    const formulasUsed = normalizeFormulasUsed(merged.formulasUsed);

    const explanation = isNonEmptyString(merged.explanation) ? merged.explanation.trim() : null;
    const correctSolution =
        isNonEmptyString(merged.correctSolution) ? merged.correctSolution.trim() : null;
    const finalAnswer = isNonEmptyString(merged.finalAnswer) ? merged.finalAnswer.trim() : null;
    const errorAnalysis = isNonEmptyString(merged.errorAnalysis) ? merged.errorAnalysis.trim() : null;

    const cleanedLegacySolution = legacySolution ? cleanText(legacySolution) : '';
    const cleanedLegacyError = legacyError ? cleanText(legacyError) : '';

    /** Câmpuri noi explicite — nu folosim doar errorAnalysis, ca să nu pierdem solution legacy. */
    const hasStructured = !!(
        problemSummary ||
        feedbackSummary ||
        studentWorkReflection ||
        givenData ||
        numericalResults ||
        (formulasUsed && formulasUsed.length) ||
        explanation ||
        correctSolution ||
        finalAnswer
    );

    const effectiveCorrectSolution = hasStructured
        ? correctSolution || null
        : cleanedLegacySolution || null;
    const effectiveErrorAnalysis = hasStructured
        ? errorAnalysis || null
        : cleanedLegacyError || null;

    return {
        ratingDisplay,
        ratingScore,
        problemSummary,
        feedbackSummary,
        studentWorkReflection,
        givenData,
        numericalResults,
        formulasUsed,
        explanation,
        correctSolution: effectiveCorrectSolution,
        errorAnalysis: effectiveErrorAnalysis,
        finalAnswer,
        hasStructured,
        legacyFallback: !hasStructured && (!!cleanedLegacySolution || !!cleanedLegacyError),
    };
};

export { DEFAULT_MAX_SCORE, cleanText };
