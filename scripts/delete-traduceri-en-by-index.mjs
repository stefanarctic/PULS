/**
 * Șterge documentele traduceri/{problemsDocId}/en/main pentru indici UI / ID-uri date.
 * Înainte de ștergere salvează snapshot JSON în scripts/backups/.
 *
 * Utilizare:
 *   node scripts/delete-traduceri-en-by-index.mjs
 *   node scripts/delete-traduceri-en-by-index.mjs --dry-run
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './firebase-admin-db.mjs';
import {
  TRADUCERI_COLLECTION,
  TRADUCERI_EN_SUBCOLLECTION,
  TRADUCERI_EN_DOC_ID,
} from '../src/lib/deeplProblemTranslate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const BACKUPS_DIR = path.join(__dirname, 'backups');

/** Indici din todo (probleme) — numeric = problems.index sau ID Firestore direct. */
const ONLY_IDS = [
  '1193', '1218', '1219', '1222', '1223', '1230', '1231', '1233', '1234', '1236', '1238',
  '1239', '1244', '1245', '1246', '1255', '1256', '1285', '1286', '1289', '1301', '1302',
  '1303', '1304', '1305', '1306', '1308', '1309', '1310', '1313', '1314', '1315', '1316',
  '1317', '1318', '1319', '1320', '1321', '1323', '1325', '1326', '1328', '1330', '1331',
  '1344', '1345', '1348', '1349', '1001', '1007', '1009', '1013', '1018', '1020', '1021',
  '1025', '1026', '1030', '1031', '1037', '1038', '1041', '1045', '1048', '1057', '1059',
  '1060', '1062', '1067', '1069', '1088', '1110', '1163', '1165', '1169', '1170', '1174',
  '1175',
];

const dryRun = process.argv.includes('--dry-run');
const verbose = process.argv.includes('--verbose');

const PROBLEMS_COLLECTION = 'problems';

async function fetchEnMainByTraduceriDocId(traduceriDocId) {
  const enRef = db
    .collection(TRADUCERI_COLLECTION)
    .doc(traduceriDocId)
    .collection(TRADUCERI_EN_SUBCOLLECTION)
    .doc(TRADUCERI_EN_DOC_ID);
  const enSnap = await enRef.get();
  return enSnap.exists ? { enRef, enSnap, traduceriDocId } : null;
}

async function resolveOnlyId(raw) {
  const token = String(raw).trim();

  const direct = await fetchEnMainByTraduceriDocId(token);
  if (direct) {
    return { ...direct, inputLabel: token, resolvedVia: 'traduceri doc id direct' };
  }

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

function main() {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

main();

async function run() {
  const createdAt = new Date().toISOString();
  const timestamp = createdAt.replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUPS_DIR, `traduceri-en-deleted-${timestamp}.json`);

  const backup = {
    createdAt,
    dryRun,
    entries: [],
    missing: [],
    deleteErrors: [],
  };

  for (const raw of ONLY_IDS) {
    const resolved = await resolveOnlyId(raw);
    if (!resolved) {
      backup.missing.push({ inputLabel: String(raw).trim(), reason: 'Nu există traduceri/.../en/main sau problems.index' });
      if (verbose) console.log(`⊘ ${raw}: nu s-a găsit en/main`);
      continue;
    }

    if (verbose) {
      console.log(`→ ${resolved.inputLabel} → traduceri/${resolved.traduceriDocId}/en/main (${resolved.resolvedVia})`);
    }

    const data = resolved.enSnap.data();
    backup.entries.push({
      inputLabel: resolved.inputLabel,
      traduceriDocId: resolved.traduceriDocId,
      resolvedVia: resolved.resolvedVia,
      path: resolved.enRef.path,
      data,
    });

    if (!dryRun) {
      try {
        await resolved.enRef.delete();
        console.log(`✓ Șters: traduceri/${resolved.traduceriDocId}/en/main`);
      } catch (e) {
        backup.deleteErrors.push({
          path: resolved.enRef.path,
          message: e.message,
        });
        console.error(`✗ Eroare la ștergere ${resolved.enRef.path}:`, e.message);
      }
    } else {
      console.log(`[dry-run] ar șterge: traduceri/${resolved.traduceriDocId}/en/main`);
    }
  }

  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
  console.log(`\nBackup salvat: ${backupPath}`);
  console.log(
    `Rezumat: ${backup.entries.length} documente în backup, ${backup.missing.length} lipsă, ${backup.deleteErrors.length} erori la ștergere.`,
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
