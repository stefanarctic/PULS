import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  TRADUCERI_COLLECTION,
  TRADUCERI_EN_DOC_ID,
  TRADUCERI_EN_SUBCOLLECTION,
} from '../lib/deeplProblemTranslate';

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/** Traduceri din `traduceri/{id}/en/main` pentru listă / carduri (fără apel DeepL). */
export function useProblemEnById(problemIds, lang, translationVersion) {
  const [enById, setEnById] = useState({});

  const idsKey = [...new Set((problemIds || []).filter(Boolean))].sort().join(',');

  useEffect(() => {
    if (lang !== 'en' || !idsKey) {
      setEnById({});
      return;
    }

    const ids = idsKey.split(',').filter(Boolean);
    let cancelled = false;

    (async () => {
      const next = {};
      const parts = chunk(ids, 30);
      try {
        for (const part of parts) {
          if (part.length === 0) continue;
          const snaps = await Promise.all(
            part.map((id) =>
              getDoc(doc(db, TRADUCERI_COLLECTION, id, TRADUCERI_EN_SUBCOLLECTION, TRADUCERI_EN_DOC_ID)),
            ),
          );
          snaps.forEach((snap, i) => {
            if (!snap.exists()) return;
            const data = snap.data();
            if (Number(data.translationVersion) === Number(translationVersion)) {
              next[part[i]] = data;
            }
          });
        }
      } catch (e) {
        console.error('[useProblemEnById]', e);
      }
      if (!cancelled) setEnById(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, idsKey, translationVersion]);

  return enById;
}
