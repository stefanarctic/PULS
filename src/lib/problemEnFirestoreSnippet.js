import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import {
  TRADUCERI_COLLECTION,
  TRADUCERI_EN_DOC_ID,
  TRADUCERI_EN_SUBCOLLECTION,
  PROBLEM_TRANSLATION_VERSION,
  enPayloadFromDoc,
  normalizeEnPayloadStrings,
} from './deeplProblemTranslate';

/**
 * Citește cache-ul EN din Firestore pentru probleme (`traduceri/{problemId}/en/main`).
 * @param {string[]} problemIds ID-uri Firebase ale documentelor din colecția `problems`.
 * @returns {Promise<Record<string, { titlu?: string, descriere?: string }>>}
 */
export async function fetchProblemsEnglishSnippetsBatch(problemIds = []) {
  const uniqueIds = [...new Set((problemIds || []).filter(Boolean))];
  const out = {};

  await Promise.all(
    uniqueIds.map(async (problemId) => {
      try {
        const enRef = doc(
          db,
          TRADUCERI_COLLECTION,
          problemId,
          TRADUCERI_EN_SUBCOLLECTION,
          TRADUCERI_EN_DOC_ID,
        );
        const snap = await getDoc(enRef);
        if (!snap.exists()) return;
        const raw = snap.data();
        if (Number(raw.translationVersion) !== PROBLEM_TRANSLATION_VERSION) return;
        const payload = normalizeEnPayloadStrings(enPayloadFromDoc(raw));
        if (!payload || typeof payload !== 'object') return;
        if (!(payload.titlu || payload.descriere)) return;
        out[problemId] = payload;
      } catch (e) {
        console.warn('[fetchProblemsEnglishSnippetsBatch]', problemId, e);
      }
    }),
  );

  return out;
}
