/**
 * Apeluri Groq cu fallback între modele când unul dă rate limit, overload sau model indisponibil.
 * Lanțurile implicite pot fi prioritizate prin variabile de mediu (virgulă: model1,model2).
 * Modelele implicite rămân ca rezerve, ca să nu rămânem blocați pe o listă prea scurtă din .env.
 */

export const GROQ_CHAT_COMPLETIONS = 'https://api.groq.com/openai/v1/chat/completions';

/** Modele pentru rezolvare/analiză de probleme: prioritate pe reasoning + matematică. */
export const GROQ_REASONING_MODEL_FALLBACKS = [
    'deepseek-r1-distill-qwen-32b',
    'qwen/qwen3-32b',
    'openai/gpt-oss-120b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
];

/** Modele text / JSON — stabile pentru structurare, traducere și post-procesare. */
export const GROQ_TEXT_MODEL_FALLBACKS = [
    'openai/gpt-oss-120b',
    'qwen/qwen3-32b',
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
];

/** Modele care acceptă imagini în chat completions. */
export const GROQ_VISION_MODEL_FALLBACKS = [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct',
];

/** Modelul principal al asistentului (același ca Puls-AI / n8n). */
export const GROQ_ASSISTANT_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

/** Chat asistent + rezolvare/analiză: Scout întâi, apoi vision/text ca rezervă. */
export const GROQ_ASSISTANT_MODEL_FALLBACKS = [
    GROQ_ASSISTANT_MODEL,
    ...GROQ_VISION_MODEL_FALLBACKS.filter((model) => model !== GROQ_ASSISTANT_MODEL),
    ...GROQ_TEXT_MODEL_FALLBACKS,
];

/**
 * @param {string | undefined} raw
 * @param {string[]} defaults
 * @returns {string[]}
 */
function parseModelListFromEnv(raw, defaults) {
    if (!raw || typeof raw !== 'string') return defaults;
    const parts = raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    if (!parts.length) return defaults;

    return [...parts, ...defaults.filter((model) => !parts.includes(model))];
}

export function getGroqTextModels() {
    return parseModelListFromEnv(
        import.meta.env.VITE_GROQ_TEXT_MODELS,
        GROQ_TEXT_MODEL_FALLBACKS,
    );
}

export function getGroqReasoningModels() {
    return parseModelListFromEnv(
        import.meta.env.VITE_GROQ_REASONING_MODELS,
        GROQ_REASONING_MODEL_FALLBACKS,
    );
}

export function getGroqVisionModels() {
    return parseModelListFromEnv(
        import.meta.env.VITE_GROQ_VISION_MODELS,
        GROQ_VISION_MODEL_FALLBACKS,
    );
}

export function getGroqAssistantModels() {
    const preferred = import.meta.env.VITE_GROQ_MODEL?.trim();
    const chain = parseModelListFromEnv(
        import.meta.env.VITE_GROQ_ASSISTANT_MODELS,
        GROQ_ASSISTANT_MODEL_FALLBACKS,
    );
    if (!preferred) return chain;
    return [preferred, ...chain.filter((model) => model !== preferred)];
}

/**
 * @param {'ro'|'en'} [locale]
 * @returns {string}
 */
export function getGroqApiKey(locale = 'ro') {
    const key = import.meta.env.VITE_GROQ_API_KEY;
    if (!key || typeof key !== 'string' || !key.trim()) {
        throw new Error(
            locale === 'en'
                ? 'VITE_GROQ_API_KEY is missing from configuration.'
                : 'VITE_GROQ_API_KEY lipsește din configurare.',
        );
    }
    return key.trim();
}

/**
 * @param {number} status
 * @param {Record<string, unknown> | null} data
 * @returns {boolean} true = încearcă următorul model
 */
function shouldTryNextModel(status, data) {
    if (status === 401 || status === 403) return false;

    if (status === 429) return true;
    if (status === 502 || status === 503) return true;
    if (status === 529) return true;

    const msg = String(data?.error?.message ?? data?.message ?? '').toLowerCase();
    const code = String(data?.error?.code ?? data?.code ?? '').toLowerCase();
    if (
        msg.includes('rate') ||
        msg.includes('token') ||
        msg.includes('limit') ||
        msg.includes('quota') ||
        msg.includes('capacity') ||
        msg.includes('overloaded') ||
        msg.includes('unavailable') ||
        msg.includes('decommission') ||
        msg.includes('failed to generate json') ||
        code.includes('failed_generation')
    ) {
        return true;
    }

    if (status === 400 || status === 404) {
        if (
            msg.includes('model') &&
            (msg.includes('not found') ||
                msg.includes('invalid') ||
                msg.includes('does not exist') ||
                msg.includes('unknown'))
        ) {
            return true;
        }
    }

    return false;
}

/**
 * @param {string} apiKey
 * @param {object} params
 * @param {string | string[]} params.models
 * @param {Array<{ role: string, content: string | unknown[] }>} params.messages
 * @param {boolean} [params.jsonMode]
 * @param {number} [params.temperature]
 * @param {number} [params.maxTokens]
 * @param {AbortSignal} [params.signal]
 * @returns {Promise<string>}
 */
export async function callGroqWithModelFallbacks({
    apiKey,
    models: modelsInput,
    messages,
    jsonMode = false,
    temperature = 0.3,
    maxTokens,
    signal,
}) {
    const models = (Array.isArray(modelsInput) ? modelsInput : [modelsInput]).filter(Boolean);
    if (!models.length) {
        throw new Error('Niciun model Groq specificat.');
    }

    let lastMessage = 'Toate modelele Groq au eșuat.';

    for (let i = 0; i < models.length; i += 1) {
        const model = models[i];
        const isLast = i === models.length - 1;

        if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }

        console.info(`[Groq] încerc modelul: ${model}`, {
            step: i + 1,
            totalModels: models.length,
            jsonMode,
        });

        const body = {
            model,
            messages,
            temperature,
            ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
            ...(typeof maxTokens === 'number' && maxTokens > 0 ? { max_tokens: maxTokens } : {}),
        };

        let res;
        try {
            res = await fetch(GROQ_CHAT_COMPLETIONS, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey.trim()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                signal,
            });
        } catch (err) {
            if (err?.name === 'AbortError') throw err;
            lastMessage = err?.message || 'Eroare de rețea către Groq.';
            if (!isLast) continue;
            throw err;
        }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            const msg = (data && data.error && data.error.message) || `Groq API error ${res.status}`;
            lastMessage = String(msg);
            console.warn(`[Groq] model=${model} status=${res.status}`, msg);

            if (!isLast && shouldTryNextModel(res.status, data)) {
                continue;
            }
            throw new Error(msg);
        }

        const text = data.choices?.[0]?.message?.content;
        if (!text || typeof text !== 'string') {
            lastMessage = 'Răspuns gol de la Groq.';
            if (!isLast) {
                console.warn(`[Groq] model=${model} empty response, trying next.`);
                continue;
            }
            throw new Error(lastMessage);
        }

        console.info(`[Groq] succes cu modelul: ${model}`, {
            fallbackUsed: i > 0,
            jsonMode,
        });
        return text;
    }

    throw new Error(lastMessage);
}
