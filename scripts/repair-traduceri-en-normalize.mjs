/**
 * Rescrie documentele `traduceri/{id}/en/main` aplicând `normalizeEnPayloadStrings`
 * (inclusiv reparații ext / LaTeX — aceleași ca la afișare).
 *
 * Utilizare:
 *   node scripts/repair-traduceri-en-normalize.mjs
 *   node scripts/repair-traduceri-en-normalize.mjs --dry-run
 *
 * Test doar pe câteva probleme: setează ONLY_IDS (rămâne gol = toate documentele).
 */
import { isDeepStrictEqual } from 'node:util';
import { db, admin } from './firebase-admin-db.mjs';
import {
  normalizeEnPayloadStrings,
  TRADUCERI_COLLECTION,
  TRADUCERI_EN_SUBCOLLECTION,
  TRADUCERI_EN_DOC_ID,
} from '../src/lib/deeplProblemTranslate.js';

/** Lasă gol [] ca să rulezi pe tot `traduceri`. Ex.: const ONLY_IDS = ['1219', '1349', '1001']; */
const ONLY_IDS = ['1219', '1349', '1001'];

const dryRun = process.argv.includes('--dry-run');

async function main() {
  const parents = await db.collection(TRADUCERI_COLLECTION).get();
  let scanned = 0;
  let updated = 0;
  let skipped = 0;
  let skippedNotInAllowlist = 0;

  for (const parentDoc of parents.docs) {
    const problemId = parentDoc.id;
    if (ONLY_IDS.length && !ONLY_IDS.includes(problemId)) {
      skippedNotInAllowlist++;
      continue;
    }

    const enRef = parentDoc.ref.collection(TRADUCERI_EN_SUBCOLLECTION).doc(TRADUCERI_EN_DOC_ID);
    const enSnap = await enRef.get();
    if (!enSnap.exists) {
      skipped++;
      continue;
    }

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

  const allowMsg =
    ONLY_IDS.length > 0
      ? `${skippedNotInAllowlist} ignorate (în afara ONLY_IDS), `
      : '';
  console.log(
    `\nGata: ${scanned} documente en/main scanate, ${updated} modificate, ${allowMsg}${skipped} probleme fără en/main.`,
  );
  if (dryRun && updated > 0) {
    console.log('Rulează fără --dry-run pentru a scrie în Firestore.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
