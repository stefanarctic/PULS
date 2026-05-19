/**
 * Rescrie documentele traduceri/{problemId}/en/main aplicând normalizeEnPayloadStrings
 * (inclusiv reparații ext / LaTeX — aceleași ca la afișare).
 *
 * Utilizare:
 *   node scripts/repair-traduceri-en-normalize.mjs
 *   node scripts/repair-traduceri-en-normalize.mjs --dry-run
 *
 * - ONLY_IDS nevid → doar acele en/main (fără list pe traduceri). Poți da:
 *   - ID-ul documentului din colecția problems (ex. după Console), SAU
 *   - indexul numeric din UI / URL (/probleme/1219 → "1219") — rezolvăm prin query problems.index.
 * - ONLY_IDS gol → query collectionGroup(en) (*fără* filtru pe documentId=câmp simplu —
 *     Firestore cere path complet pentru __name__), apoi în client filtrăm id === main
 *     și calea traduceri/... Atentie la reads (toată subcolectia en din proiect).
 */
import { isDeepStrictEqual } from 'node:util';
import { db, admin } from './firebase-admin-db.mjs';
import {
  normalizeEnPayloadStrings,
  TRADUCERI_COLLECTION,
  TRADUCERI_EN_SUBCOLLECTION,
  TRADUCERI_EN_DOC_ID,
} from '../src/lib/deeplProblemTranslate.js';

/** Lasă gol [] pentru toate. Ex.: ['1219'] = index UI; sau ID Firestore complet din problems/{id}. */
const ONLY_IDS = ['1349', '1001'];

const dryRun = process.argv.includes('--dry-run');
/** Loghează cum s-a rezolvat fiecare intrare în ONLY_IDS */
const verbose = process.argv.includes('--verbose');

const PROBLEMS_COLLECTION = 'problems';

async function fetchEnMainByTraduceriDocId(traduceriDocId) {
  const enRef = db
    .collection(TRADUCERI_COLLECTION)
    .doc(traduceriDocId)
    .collection(TRADUCERI_EN_SUBCOLLECTION)
    .doc(TRADUCERI_EN_DOC_ID);
  const enSnap = await enRef.get();
  return enSnap.exists ? { enSnap, traduceriDocId } : null;
}

/**
 * ONLY_IDS poate fi fie doc id Firestore, fie strict numeric (= problems.index pentru probleme clasice).
 */
async function resolveOnlyId(raw) {
  const token = String(raw).trim();

  const direct = await fetchEnMainByTraduceriDocId(token);
  if (direct) {
    return { ...direct, inputLabel: token, resolvedVia: 'traduceri doc id direct' };
  }

  // Index UI (#1219) — nu e același lucru cu id-ul din Firestore
  if (/^\d+$/.test(token)) {
    const indexVal = Number(token);
    const qs = await db.collection(PROBLEMS_COLLECTION).where('index', '==', indexVal).limit(2).get();
    if (qs.size > 1) {
      console.warn(`⚠️ Mai multe documente problems cu index=${indexVal}; folosesc primul (id ${qs.docs[0].id}).`);
    }
    if (!qs.empty) {
      const firestoreProblemId = qs.docs[0].id;
      const viaIndex = await fetchEnMainByTraduceriDocId(firestoreProblemId);
      if (viaIndex) {
        return {
          ...viaIndex,
          inputLabel: token,
          resolvedVia: `problems.index=${indexVal} → id ${firestoreProblemId}`,
        };
      }
    }
  }

  return null;
}

/** ex. traduceri/abc123/en/main */
function parseTraduceriMainPath(fullPath) {
  const segments = fullPath.split('/');
  if (
    segments.length !== 4 ||
    segments[0] !== TRADUCERI_COLLECTION ||
    segments[2] !== TRADUCERI_EN_SUBCOLLECTION ||
    segments[3] !== TRADUCERI_EN_DOC_ID
  ) {
    return null;
  }
  return { problemId: segments[1], enRef: db.doc(fullPath) };
}

async function main() {
  let scanned = 0;
  let updated = 0;
  let skippedMissing = 0;
  /** alte grupuri cu subcolectia en + doc main (ignorate) */
  let skippedOtherPaths = 0;

  const jobs = [];

  if (ONLY_IDS.length > 0) {
    for (const rawId of ONLY_IDS) {
      const resolved = await resolveOnlyId(rawId);
      if (!resolved) {
        skippedMissing++;
        continue;
      }
      if (verbose) {
        console.log(`  intrare "${resolved.inputLabel}" → traduceri/${resolved.traduceriDocId}/en/main (${resolved.resolvedVia})`);
      }
      jobs.push({ problemId: resolved.traduceriDocId, enSnap: resolved.enSnap });
    }
  } else {
    // Pe collectionGroup, `.where(FieldPath.documentId(), '==', 'main')` dă eroare
    // („main nu e path cu număr par de segmente”). Citim grupul și filtrăm în client.
    const groupSnap = await db.collectionGroup(TRADUCERI_EN_SUBCOLLECTION).get();
    for (const enDoc of groupSnap.docs) {
      if (enDoc.id !== TRADUCERI_EN_DOC_ID) continue;
      const parsed = parseTraduceriMainPath(enDoc.ref.path);
      if (!parsed) {
        skippedOtherPaths++;
        continue;
      }
      jobs.push({ problemId: parsed.problemId, enSnap: enDoc });
    }
  }

  for (const { problemId, enSnap } of jobs) {
    const enRef = enSnap.ref;
    scanned++;
    const data = enSnap.data();
    const next = normalizeEnPayloadStrings({ ...data });

    if (isDeepStrictEqual(data, next)) {
      continue;
    }

    updated++;
    console.log(`${dryRun ? '[dry-run] ' : ''}Update ${problemId}`);

    if (!dryRun) {
      await enRef.set(
        {
          ...next,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
  }

  const scopeHint =
    ONLY_IDS.length > 0
      ? `mod ONLY_IDS (${ONLY_IDS.length} id-uri)`
      : 'mod toate (collectionGroup en + main)';
  console.log(
    `\nGata (${scopeHint}): ${scanned} en/main analizate, ${updated} modificate.` +
      (ONLY_IDS.length > 0
        ? ` Lipsă en/main (sau index inexistent în problems) pentru ${skippedMissing} intrări din listă.`
        : skippedOtherPaths > 0
          ? ` (${skippedOtherPaths} doc(uri) din alte căi cu en/main au fost ignorate)`
          : ''),
  );
  if (scanned === 0 && skippedMissing === 0 && ONLY_IDS.length === 0) {
    console.log(
      '\nNu s-a găsit niciun traduceri/*/en/main. Verifică proiectul Firebase sau dacă subtitlurile sunt încă nedepuse.',
    );
  }
  if (scanned === 0 && skippedMissing > 0) {
    console.log(
      '\nNicio potrivire: verifică că există traduceri/{problemsDocId}/en/main, sau că numărul e index din problems (nu ID grile / altă colecție). Rulează cu --verbose ca să vezi rezolvarea.',
    );
  }
  if (dryRun && updated > 0) {
    console.log('Rulează fără --dry-run pentru a scrie în Firestore.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
