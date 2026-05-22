import phraseTranslations from './phraseTranslations';

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK', 'CANVAS', 'SVG', 'MATH']);
const ATTRIBUTES = ['placeholder', 'aria-label', 'title', 'alt', 'value'];

const normalizeText = (value) => value.replace(/\s+/g, ' ').trim();

const sortedEntries = Object.entries(phraseTranslations)
    .sort(([a], [b]) => b.length - a.length);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const translatePhrase = (value) => {
    if (typeof value !== 'string') return value;
    const normalized = normalizeText(value);
    if (!normalized) return value;
    const exact = phraseTranslations[normalized];
    if (exact) return exact;

    let translated = value;
    for (const [source, target] of sortedEntries) {
        if (source.length < 4 || !translated.includes(source)) continue;
        translated = translated.replace(new RegExp(escapeRegExp(source), 'g'), target);
    }
    return translated;
};

const translateTextNode = (node) => {
    const original = node.nodeValue;
    const translated = translatePhrase(original);
    if (translated !== original) {
        const leading = original.match(/^\s*/)?.[0] || '';
        const trailing = original.match(/\s*$/)?.[0] || '';
        node.nodeValue = `${leading}${translated}${trailing}`;
    }
};

const translateAttributes = (element) => {
    for (const attr of ATTRIBUTES) {
        if (!element.hasAttribute?.(attr)) continue;
        const original = element.getAttribute(attr);
        const translated = translatePhrase(original);
        if (translated !== original) {
            element.setAttribute(attr, translated);
        }
    }
};

export const translateDomTree = (root) => {
    if (!root) return;
    const doc = root.nodeType === Node.DOCUMENT_NODE ? root : root.ownerDocument;
    const start = root.nodeType === Node.DOCUMENT_NODE ? root.body : root;
    if (!doc || !start) return;

    const walker = doc.createTreeWalker(
        start,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
        {
            acceptNode(node) {
                const parentElement = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
                if (!parentElement) return NodeFilter.FILTER_REJECT;
                if (SKIP_TAGS.has(parentElement.tagName)) return NodeFilter.FILTER_REJECT;
                if (parentElement.closest?.('[data-no-translate], .MathJax, mjx-container')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            },
        }
    );

    let node = walker.currentNode;
    while (node) {
        if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            translateAttributes(node);
        }
        node = walker.nextNode();
    }
};

export const observeAndTranslate = (root) => {
    if (!root) return () => {};
    translateDomTree(root);

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'characterData') {
                translateTextNode(mutation.target);
                continue;
            }
            for (const added of mutation.addedNodes) {
                if (added.nodeType === Node.TEXT_NODE) {
                    translateTextNode(added);
                } else if (added.nodeType === Node.ELEMENT_NODE) {
                    translateDomTree(added);
                }
            }
            if (mutation.type === 'attributes' && mutation.target?.nodeType === Node.ELEMENT_NODE) {
                translateAttributes(mutation.target);
            }
        }
    });

    observer.observe(root.nodeType === Node.DOCUMENT_NODE ? root.body : root, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ATTRIBUTES,
    });

    return () => observer.disconnect();
};
