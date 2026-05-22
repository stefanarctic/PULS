import { useEffect, useRef, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  TRADUCERI_COLLECTION,
  TRADUCERI_EN_DOC_ID,
  TRADUCERI_EN_SUBCOLLECTION,
  mergeProblemWithEn,
  mergeProblemWithEnDoc,
  PROBLEM_TRANSLATION_VERSION,
  translateProblemToEnPayload,
} from '../lib/deeplProblemTranslate';

/**
 * Pentru /en: încarcă din `traduceri/{problemId}/en/main` sau traduce cu DeepL, salvează, apoi afișează.
 */
export function useProblemEnglishTranslation(problema, lang) {
  const problemaRef = useRef(problema);
  problemaRef.current = problema;

  const [displayProblema, setDisplayProblema] = useState(problema);
  const [status, setStatus] = useState(() => (lang === 'en' ? 'loading' : 'ready'));

  const problemId = problema?.id ?? null;

  useEffect(() => {
    setDisplayProblema(problema);
  }, [problema]);

  useEffect(() => {
    const latest = problemaRef.current;

    if (!latest) {
      setStatus('ready');
      return;
    }

    if (lang !== 'en') {
      setStatus('ready');
      setDisplayProblema(latest);
      return;
    }

    if (!problemId) {
      setDisplayProblema(latest);
      setStatus('ready');
      return;
    }

    let cancelled = false;

    (async () => {
      setStatus('loading');
      setDisplayProblema(latest);

      try {
        const enRef = doc(db, TRADUCERI_COLLECTION, problemId, TRADUCERI_EN_SUBCOLLECTION, TRADUCERI_EN_DOC_ID);
        const snap = await getDoc(enRef);

        if (cancelled) return;

        const current = problemaRef.current;
        if (!current || current.id !== problemId) {
          if (!cancelled) setStatus('ready');
          return;
        }

        const cached = snap.exists() ? snap.data() : null;
        const cacheOk =
          cached &&
          Number(cached.translationVersion) === PROBLEM_TRANSLATION_VERSION &&
          (cached.titlu || cached.continut);
        if (cacheOk) {
          setDisplayProblema(mergeProblemWithEnDoc(current, cached));
          setStatus('ready');
          return;
        }

        const enPayload = await translateProblemToEnPayload(current);
        if (cancelled) return;

        const afterTranslate = problemaRef.current;
        if (!afterTranslate || afterTranslate.id !== problemId) {
          if (!cancelled) setStatus('ready');
          return;
        }

        await setDoc(
          enRef,
          {
            problemId,
            problemIndex: afterTranslate.index ?? null,
            sourceLang: 'ro',
            translationVersion: PROBLEM_TRANSLATION_VERSION,
            updatedAt: serverTimestamp(),
            ...enPayload,
          },
          { merge: true },
        );

        if (cancelled) return;
        setDisplayProblema(mergeProblemWithEn(afterTranslate, enPayload));
        setStatus('ready');
      } catch (e) {
        console.error('[useProblemEnglishTranslation]', e);
        if (!cancelled) {
          const cur = problemaRef.current;
          setDisplayProblema(cur);
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, problemId]);

  return { displayProblema, status };
}
