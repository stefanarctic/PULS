/**
 * Detectează dacă mesajul e chat general, rezolvare de problemă sau corectare lucrare.
 */

const ANALYZE_PATTERNS = [
    /\bcorecteaz[aă]/i,
    /\bverific[aă]\b/i,
    /\bevalueaz[aă]/i,
    /\banalizeaz[aă]/i,
    /\bsolu[tț]ia mea\b/i,
    /\blucrarea (mea|elevului)\b/i,
    /\bam rezolvat\b/i,
    /\beste corect\b/i,
    /\be corect\b/i,
    /\bce not[aă]\b/i,
    /\bpunctaj\b/i,
    /\bcheck my (work|solution)\b/i,
    /\bgrade (this|my)\b/i,
    /\bcorrect my\b/i,
    /\bmy solution\b/i,
];

const SOLVE_PATTERNS = [
    /\brezolv[aă]/i,
    /\brezolvare\b/i,
    /\bsolve\b/i,
    /\bcalculeaz[aă]/i,
    /\bcalculate\b/i,
    /\bexerci[tț]i(u|ul|ile)\b/i,
    /\bexercise\b/i,
    /PROBLEMA\s*#/i,
    /\benun[tț](ul)?\b/i,
    /\bs[aă] se (determine|calculeze|afle|g[aă]seasc[aă])/i,
    /\bcalcula[tț]i\b/i,
    /\bdetermina[tț]i\b/i,
    /\bg[aă]si[tț]i\b/i,
];

const PHYSICS_UNIT_RE =
    /\b(\d+([.,]\d+)?)\s*(kg|g|m\/s²|m\/s2|m\/s|m\b|cm|km|N|J|W|Hz|kHz|A|V|Ω|ohm|C|K|Pa|kPa|°C|rad|s\b)\b/i;

const GIVEN_DATA_RE = /\b([a-zα-ωA-Z][a-zA-Z0-9_]{0,6})\s*=\s*-?\d/;

/**
 * @param {string} text
 */
function looksLikePhysicsProblem(text) {
    const trimmed = String(text || '').trim();
    if (trimmed.length < 40) return false;

    const hasUnits = PHYSICS_UNIT_RE.test(trimmed);
    const hasGiven = GIVEN_DATA_RE.test(trimmed);
    const hasClassicCue =
        /\b(se dă|se dau|un corp|un pendul|un circuit|un gaz|un electron|o sarcin[aă]|o for[tț][aă]|un resort)\b/i.test(
            trimmed,
        );
    const lineCount = trimmed.split('\n').filter((line) => line.trim()).length;

    if ((hasUnits || hasGiven) && (hasClassicCue || lineCount >= 3 || trimmed.length > 180)) {
        return true;
    }
    if (hasUnits && hasGiven) return true;
    return false;
}

/**
 * @param {Array<{ role?: string, text?: string }>} history
 */
function historyLooksLikePhysicsTask(history) {
    if (!Array.isArray(history) || history.length === 0) return false;
    const recentUser = [...history]
        .reverse()
        .find((m) => m && (m.role === 'user' || !m.role) && m.text);
    if (!recentUser?.text) return false;
    const t = String(recentUser.text);
    return SOLVE_PATTERNS.some((re) => re.test(t)) || ANALYZE_PATTERNS.some((re) => re.test(t)) || looksLikePhysicsProblem(t);
}

/**
 * @param {string} message
 * @param {Array<{ role?: string, text?: string }>} [history]
 * @returns {'chat' | 'solve' | 'analyze'}
 */
export function detectAssistantIntent(message, history = []) {
    const text = String(message ?? '').trim();
    if (!text) return 'chat';

    if (ANALYZE_PATTERNS.some((re) => re.test(text))) return 'analyze';
    if (SOLVE_PATTERNS.some((re) => re.test(text))) return 'solve';
    if (looksLikePhysicsProblem(text)) return 'solve';

    const followUp =
        /^(iar|și|si|dar|ok|okay|da|nu|la punctul|punctul|subpunct|ex\.?\s*\d+|doar|în schimb|in schimb)\b/i.test(
            text,
        ) || text.length < 80;
    if (followUp && historyLooksLikePhysicsTask(history)) {
        const lastUser = [...history].reverse().find((m) => m?.text && (m.role === 'user' || !m.role));
        if (lastUser?.text && ANALYZE_PATTERNS.some((re) => re.test(String(lastUser.text)))) {
            return 'analyze';
        }
        return 'solve';
    }

    return 'chat';
}

/**
 * Scoate prefixul „Rezolvă această problemă” ca să rămână enunțul.
 * @param {string} message
 */
export function extractProblemTextFromMessage(message) {
    const raw = String(message ?? '').trim();
    if (!raw) return raw;
    return raw
        .replace(/^(rezolv[aă]\s+(aceast[aă]\s+)?(problema|problema:)\s*:?\s*)/i, '')
        .replace(/^(solve\s+(this\s+)?problem\s*:?\s*)/i, '')
        .trim() || raw;
}
