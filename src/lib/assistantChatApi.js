/**
 * Asistent PULS: chat Groq + rezolvare/analiză Puls-AI, tot pe Groq.
 * Fără n8n / automations.puls-fizica.ro / puls-ai-two.
 */

import {
    callGroqWithModelFallbacks,
    getGroqApiKey,
    getGroqAssistantModels,
} from './groqClient';
import { getChatSystemPrompt } from './assistantPrompts';
import { detectAssistantIntent, extractProblemTextFromMessage } from './assistantIntent';
import { runPulsAiPhysics } from './pulsAiPhysics';
import { cleanSpuriousMathCommasInMarkdown } from './mathJaxifyPlainMath';

const MAX_HISTORY_TURNS = 12;
const MAX_HISTORY_CHARS = 8000;

/** Scoate emojis / pictograme, lasă MathJax și punctuația obișnuită. */
function stripEmojis(text) {
    if (typeof text !== 'string' || !text) return text;
    return text
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/\uFE0F/g, '')
        .replace(/\u200D/g, '')
        .replace(/[ \t]{2,}/g, ' ')
        .replace(/ *\n{3,}/g, '\n\n')
        .trim();
}

function polishAssistantReply(text) {
    return cleanSpuriousMathCommasInMarkdown(stripEmojis(text));
}

/**
 * @param {unknown} item
 * @returns {{ role: 'user' | 'assistant', content: string } | null}
 */
function normalizeHistoryItem(item) {
    if (!item || typeof item !== 'object') return null;
    const rec = /** @type {Record<string, unknown>} */ (item);
    const roleRaw = rec.role === 'ai' || rec.role === 'assistant' ? 'assistant' : 'user';
    const text = String(rec.text ?? rec.content ?? rec.message ?? '').trim();
    if (!text) return null;
    return {
        role: roleRaw,
        content: text.length > MAX_HISTORY_CHARS ? text.slice(0, MAX_HISTORY_CHARS) : text,
    };
}

/**
 * @param {unknown} history
 * @returns {Array<{ role: 'user' | 'assistant', content: string }>}
 */
function takeRecentHistory(history) {
    if (!Array.isArray(history)) return [];
    const normalized = history.map(normalizeHistoryItem).filter(Boolean);
    return normalized.slice(-MAX_HISTORY_TURNS);
}

/**
 * @param {Array<{ role: string, content: string }>} history
 * @param {string} currentMessage
 */
function additionalContextFromHistory(history, currentMessage) {
    const priorUser = [...history]
        .reverse()
        .find((m) => m.role === 'user' && m.content && m.content !== currentMessage);
    return priorUser?.content ? priorUser.content.slice(0, MAX_HISTORY_CHARS) : '';
}

/**
 * @param {object} params
 * @param {string} params.message
 * @param {'ro'|'en'} params.locale
 * @param {Array<{ role: 'user' | 'assistant', content: string }>} params.history
 * @param {AbortSignal} [params.signal]
 */
async function runChatReply({ message, locale, history, signal }) {
    const loc = locale === 'en' ? 'en' : 'ro';
    const messages = [
        { role: 'system', content: getChatSystemPrompt(loc) },
        ...history,
        { role: 'user', content: message },
    ];

    const text = await callGroqWithModelFallbacks({
        apiKey: getGroqApiKey(loc),
        models: getGroqAssistantModels(),
        messages,
        temperature: 0.4,
        maxTokens: 2500,
        signal,
    });

    if (!text || !String(text).trim()) {
        throw new Error(
            loc === 'en'
                ? 'The assistant returned an empty reply.'
                : 'Asistentul a returnat un răspuns gol.',
        );
    }
    return polishAssistantReply(String(text).trim());
}

/**
 * @param {string} message
 * @param {string} [_sessionId] păstrat pentru compatibilitate cu apelanții vechi
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @param {'ro'|'en'} [options.locale]
 * @param {Array<{ role?: string, text?: string, content?: string }>} [options.history]
 * @param {'chat'|'solve'|'analyze'} [options.forceIntent]
 * @param {string[]} [options.imageDataUris]
 * @param {string[]} [options.solutionImageDataUris]
 * @param {string} [options.solutionText]
 */
export async function fetchAssistantReply(message, _sessionId, options = {}) {
    const {
        signal,
        locale = 'ro',
        history: rawHistory = [],
        forceIntent,
        imageDataUris = [],
        solutionImageDataUris = [],
        solutionText,
    } = options;

    const loc = locale === 'en' ? 'en' : 'ro';
    const outboundMessage = String(message ?? '').trim();
    if (!outboundMessage) {
        throw new Error(loc === 'en' ? 'Empty message.' : 'Mesaj gol.');
    }

    const history = takeRecentHistory(rawHistory);
    const intent =
        forceIntent === 'chat' || forceIntent === 'solve' || forceIntent === 'analyze'
            ? forceIntent
            : detectAssistantIntent(outboundMessage, rawHistory);

    try {
        if (intent === 'solve' || intent === 'analyze') {
            const problemText = extractProblemTextFromMessage(outboundMessage);
            const extra = additionalContextFromHistory(history, outboundMessage);
            return polishAssistantReply(await runPulsAiPhysics({
                mode: intent,
                problemText: intent === 'analyze' && extra ? extra : problemText,
                additionalContext: intent === 'analyze' ? problemText : extra,
                solutionText:
                    solutionText ||
                    (intent === 'analyze' ? outboundMessage : undefined),
                imageDataUris,
                solutionImageDataUris,
                locale: loc,
                signal,
            }));
        }

        return await runChatReply({
            message: outboundMessage,
            locale: loc,
            history,
            signal,
        });
    } catch (err) {
        if (err?.name === 'AbortError') throw err;
        const fallback = err?.message
            ? String(err.message)
            : loc === 'en'
              ? 'Could not get a reply from the assistant.'
              : 'Nu s-a putut obține un răspuns de la asistent.';
        throw new Error(fallback);
    }
}
