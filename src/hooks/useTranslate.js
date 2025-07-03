import { useEffect, useState } from 'react';

// Helper to build a CSS-like path for a node
const getNodePath = (node) => {
    if (!node || !node.parentNode || node === document.body) return 'body';
    const parent = node.parentNode;
    let index = 1;
    for (let sibling of parent.childNodes) {
        if (sibling === node) break;
        if (sibling.nodeType === node.nodeType && sibling.nodeName === node.nodeName) {
            index++;
        }
    }
    return getNodePath(parent) + ` > ${node.nodeName.toLowerCase()}:nth-child(${index})`;
};

// Recursively collect text nodes and their paths
export const getTextNodes = (node, results = []) => {
    if (
        node.nodeType === Node.TEXT_NODE &&
        node.textContent.trim() !== ''
    ) {
        results.push({
            text: node.textContent.trim(),
            path: getNodePath(node)
        });
    } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        !['SCRIPT', 'STYLE', 'META', 'NOSCRIPT'].includes(node.tagName)
    ) {
        for (let child of node.childNodes) {
            getTextNodes(child, results);
        }
    }
    return results;
};

// getTranslate: returns a single object { path: text, ... }
// export const getTranslate = () => {
//     const texts = getTextNodes(document.body);
//     const obj = {};
//     for (const { path, text } of texts) {
//         obj[path] = text;
//     }
//     return obj;
// };

// useTranslateObject: React hook version of getTranslate
export const useTranslateObject = () => {
    const [obj, setObj] = useState({});
    useEffect(() => {
        const texts = getTextNodes(document.body);
        const newObj = {};
        for (const { path, text } of texts) {
            newObj[path] = text;
        }
        setObj(newObj);
    }, []);
    return obj;
};

const useTranslate = () => {
    const [texts, setTexts] = useState([]);

    useEffect(() => {
        // Collect all text nodes and their paths from the body
        const allTexts = getTextNodes(document.body);
        setTexts(allTexts);
    }, []);

    // Return a proxy that stringifies to JSON
    return new Proxy(texts, {
        get(target, prop, receiver) {
            if (prop === 'toString' || prop === 'toJSON') {
                return () => JSON.stringify(target, null, 2);
            }
            return Reflect.get(target, prop, receiver);
        }
    });
};

export default useTranslate;