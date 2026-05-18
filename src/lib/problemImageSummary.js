import {
    callGroqWithModelFallbacks,
    getGroqVisionModels,
} from './groqClient';

const IMAGE_DATA_URI_RE = /^data:image\/[a-zA-Z0-9.+-]+;base64,/;

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
 * @param {unknown} value
 * @returns {value is string}
 */
function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * @param {string} src
 * @returns {string[]}
 */
function buildImageFetchCandidates(src) {
    const trimmed = src.trim();
    const candidates = [trimmed];

    if (trimmed.startsWith('/public/')) {
        candidates.push(trimmed.replace(/^\/public/, ''));
    } else if (trimmed.startsWith('public/')) {
        candidates.push(`/${trimmed.slice('public/'.length)}`);
    }

    return [...new Set(candidates)];
}

/**
 * @param {string} src
 * @returns {Promise<string>}
 */
async function imageSourceToDataUri(src) {
    const trimmed = src.trim();
    if (IMAGE_DATA_URI_RE.test(trimmed)) return trimmed;

    let res = null;
    for (const candidate of buildImageFetchCandidates(trimmed)) {
        res = await fetch(candidate);
        if (res.ok) break;
    }

    if (!res?.ok) {
        throw new Error(
            `Nu s-a putut încărca imaginea problemei (${res?.status || 'network error'}).`
        );
    }

    const blob = await res.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error('Nu s-a putut converti imaginea problemei.'));
            }
        };
        reader.onerror = () => reject(new Error('Nu s-a putut citi imaginea problemei.'));
        reader.readAsDataURL(blob);
    });
}

/**
 * @param {object|null} problem
 * @returns {string[]}
 */
export function getProblemImageSources(problem) {
    if (!problem || typeof problem !== 'object') return [];

    const p = /** @type {Record<string, unknown>} */ (problem);
    const sources = [];

    if (Array.isArray(p.poze)) {
        sources.push(...p.poze.filter(isNonEmptyString));
    }

    for (const key of ['imagine', 'imagine1', 'imagine2']) {
        if (isNonEmptyString(p[key])) {
            sources.push(p[key]);
        }
    }

    return sources;
}

/**
 * @param {object} params
 * @param {string} params.problemText
 * @param {object|null} params.problem
 * @param {'ro'|'en'} [params.locale]
 * @returns {Promise<string|null>}
 */
export async function summarizeProblemImages({ problemText, problem, locale = 'ro' }) {
    const loc = locale === 'en' ? 'en' : 'ro';
    const imageSources = getProblemImageSources(problem);
    if (!imageSources.length) return null;

    const imageDataUris = await Promise.all(imageSources.map(imageSourceToDataUri));
    const userInstructions =
        loc === 'en'
            ? [
                  'Analyse the images attached to a physics problem statement.',
                  'Extract ALL visually useful information for solving it, without solving the problem yet.',
                  'If the image is a graph, describe each axis, quantity, unit, scale, point, segment, slope, area, legend, and any visible numeric values.',
                  'If the image is a table, diagram, or experimental sketch, transcribe all labels, values, geometric relationships, and arrow/force directions.',
                  'Explicitly mention anything that cannot be read reliably.',
                  '',
                  `AVAILABLE STATEMENT TEXT:\n${problemText}`,
              ].join('\n')
            : [
                  'Analizează imaginile atașate enunțului unei probleme de fizică.',
                  'Extrage TOATE informațiile vizuale utile pentru rezolvare, fără să rezolvi problema încă.',
                  'Dacă imaginea conține grafic, descrie fiecare axă, mărime, unitate, scală, punct, segment, pantă, arie, legendă și orice valoare numerică vizibilă.',
                  'Dacă imaginea conține tabel, schemă sau desen experimental, transcrie toate etichetele, valorile, relațiile geometrice și sensurile săgeților/forțelor.',
                  'Menționează explicit ce nu se poate citi sigur.',
                  '',
                  `TEXT ENUNȚ DISPONIBIL:\n${problemText}`,
              ].join('\n');

    const contentParts = [
        {
            type: 'text',
            text: userInstructions,
        },
    ];

    for (const uri of imageDataUris) {
        contentParts.push({
            type: 'image_url',
            image_url: { url: uri },
        });
    }

    const systemPrompt =
        loc === 'en'
            ? 'You are a visual analysis assistant for physics problems. Reply exclusively in English: concise but complete, with all data extracted from the images.'
            : 'Ești un asistent de analiză vizuală pentru probleme de fizică. Răspunde exclusiv în limba română, concis dar complet, cu toate datele extrase din imagine.';

    return callGroqWithModelFallbacks({
        apiKey: getApiKey(loc),
        models: getGroqVisionModels(),
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            { role: 'user', content: contentParts },
        ],
        temperature: 0.3,
    });
}