import { useEffect, useRef, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  TRADUCERI_COLLECTION,
  TRADUCERI_EN_DOC_ID,
  TRADUCERI_EN_SUBCOLLECTION,
  mergeGrilaWithEn,
  mergeGrilaWithEnDoc,
  GRILA_TRANSLATION_VERSION,
  translateGrilaToEnPayload,
} from '../lib/deeplProblemTranslate';

/**
 * Pentru /en: încarcă din `traduceri/{grilaFirestoreId}/en/main` sau traduce cu DeepL, salvează, afișează.
 */
export function useGrilaEnglishTranslation(grila, lang) {
  const grilaRef = useRef(grila);
  grilaRef.current = grila;

  const [displayGrila, setDisplayGrila] = useState(grila);
  const [status, setStatus] = useState(() => (lang === 'en' ? 'loading' : 'ready'));

  const grilaId = grila?.id ?? null;

  useEffect(() => {
    setDisplayGrila(grila);
  }, [grila]);

  useEffect(() => {
    const latest = grilaRef.current;

    if (!latest) {
      setStatus('ready');
      return;
    }

    if (lang !== 'en') {
      setStatus('ready');
      setDisplayGrila(latest);
      return;
    }

    if (!grilaId) {
      setDisplayGrila(latest);
      setStatus('ready');
      return;
    }

    let cancelled = false;

    (async () => {
      setStatus('loading');
      setDisplayGrila(latest);

      try {
        const enRef = doc(db, TRADUCERI_COLLECTION, grilaId, TRADUCERI_EN_SUBCOLLECTION, TRADUCERI_EN_DOC_ID);
        const snap = await getDoc(enRef);

        if (cancelled) return;

        const current = grilaRef.current;
        if (!current || current.id !== grilaId) {
          if (!cancelled) setStatus('ready');
          return;
        }

        const cached = snap.exists() ? snap.data() : null;
        const cacheOk =
          cached &&
          cached.grilaId === grilaId &&
          Number(cached.translationVersion) === GRILA_TRANSLATION_VERSION &&
          cached.intrebare;
        if (cacheOk) {
          setDisplayGrila(mergeGrilaWithEnDoc(current, cached));
          setStatus('ready');
          return;
        }

        const enPayload = await translateGrilaToEnPayload(current);
        if (cancelled) return;

        const afterTranslate = grilaRef.current;
        if (!afterTranslate || afterTranslate.id !== grilaId) {
          if (!cancelled) setStatus('ready');
          return;
        }

        await setDoc(
          enRef,
          {
            grilaId,
            grilaIndex: afterTranslate.index ?? null,
            sourceLang: 'ro',
            translationVersion: GRILA_TRANSLATION_VERSION,
            updatedAt: serverTimestamp(),
            ...enPayload,
          },
          { merge: true },
        );

        if (cancelled) return;
        setDisplayGrila(mergeGrilaWithEn(afterTranslate, enPayload));
        setStatus('ready');
      } catch (e) {
        console.error('[useGrilaEnglishTranslation]', e);
        if (!cancelled) {
          const cur = grilaRef.current;
          setDisplayGrila(cur);
          setStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, grilaId]);

  return { displayGrila, status };
}
