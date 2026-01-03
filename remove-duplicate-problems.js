import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Debug: Script started
console.log('🔍 Script started...');

// Load environment variables
dotenv.config();
console.log('🔍 Environment variables loaded');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
let serviceAccount;
let initialized = false;

// Method 1: Try to load from .env variable FIREBASE_SERVICE_ACCOUNT_KEY_JSON
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
  try {
    const jsonString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
    const cleanedJson = jsonString.trim().replace(/^['"]|['"]$/g, '');
    serviceAccount = JSON.parse(cleanedJson);
    console.log('✓ Service Account Key încărcat din variabila de mediu FIREBASE_SERVICE_ACCOUNT_KEY_JSON');
    console.log(`  Project ID: ${serviceAccount.project_id || 'N/A'}`);
    console.log(`  Client Email: ${serviceAccount.client_email || 'N/A'}`);
  } catch (error) {
    console.error('❌ Eroare la parsarea FIREBASE_SERVICE_ACCOUNT_KEY_JSON:', error.message);
  }
}

// Method 2: Try to load from file path specified in .env
if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccountFile = fs.readFileSync(serviceAccountPath, 'utf8');
      serviceAccount = JSON.parse(serviceAccountFile);
      console.log('✓ Service Account Key încărcat din fișier:', serviceAccountPath);
    } catch (error) {
      console.error('❌ Eroare la citirea fișierului:', error.message);
    }
  }
}

// Method 3: Try default file location
if (!serviceAccount) {
  const defaultPath = path.join(__dirname, 'firebase-service-account-key.json');
  if (fs.existsSync(defaultPath)) {
    try {
      const serviceAccountFile = fs.readFileSync(defaultPath, 'utf8');
      serviceAccount = JSON.parse(serviceAccountFile);
      console.log('✓ Service Account Key încărcat din fișierul implicit');
    } catch (error) {
      console.error('❌ Eroare la citirea fișierului implicit:', error.message);
    }
  }
}

// Method 4: Try Application Default Credentials
if (!serviceAccount && !initialized) {
  try {
    admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID
    });
    initialized = true;
    console.log('✓ Firebase Admin SDK inițializat cu Application Default Credentials');
  } catch (error) {
    // Will show error message below if all methods fail
  }
}

// Initialize with service account if we have it
if (serviceAccount && !initialized) {
  try {
    const projectId = serviceAccount.project_id || process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error('Project ID nu a fost găsit în service account key sau variabilele de mediu');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId
    });
    initialized = true;
    console.log('✓ Firebase Admin SDK inițializat cu Service Account Key');
    console.log(`  Project ID: ${projectId}`);
  } catch (error) {
    console.error('❌ Eroare la inițializarea Firebase Admin SDK:', error.message);
    process.exit(1);
  }
}

// If still not initialized, show error
if (!initialized) {
  console.error('\n❌ Eroare: Nu s-a putut inițializa Firebase Admin SDK!');
  process.exit(1);
}

const db = admin.firestore();

console.log('✓ Firebase Admin SDK inițializat');
console.log('✓ Firestore database conectat');
console.log(`✓ Project ID: ${admin.app().options.projectId || 'N/A'}\n`);

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Find and remove duplicate problems from Firestore
 */
async function removeDuplicateProblems() {
  console.log('\n🔍 Pornesc căutarea și ștergerea problemelor duplicate...\n');
  
  try {
    // Get all problems from Firestore
    console.log('📋 Citind toate problemele din Firestore...');
    const problemsSnapshot = await db.collection('problems').get();
    
    console.log(`✓ Total probleme găsite: ${problemsSnapshot.size}\n`);
    
    // Group problems by Index to find duplicates
    const problemsByIndex = new Map(); // Map<index, [doc1, doc2, ...]>
    let problemsWithoutIndex = 0;
    
    problemsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const docId = doc.id;
      const problemIndex = data.index;
      
      // Only process problems that have an index
      if (problemIndex === undefined || problemIndex === null) {
        problemsWithoutIndex++;
        return;
      }
      
      // Group by Index
      if (!problemsByIndex.has(problemIndex)) {
        problemsByIndex.set(problemIndex, []);
      }
      problemsByIndex.get(problemIndex).push({ doc, data, docId, problemIndex });
    });
    
    // Find duplicates by Index
    const duplicatesByIndex = [];
    problemsByIndex.forEach((docs, index) => {
      if (docs.length > 1) {
        duplicatesByIndex.push({ index, docs, type: 'Index' });
      }
    });
    
    console.log(`📊 Probleme procesate:`);
    console.log(`   - Total probleme: ${problemsSnapshot.size}`);
    console.log(`   - Probleme cu index: ${problemsSnapshot.size - problemsWithoutIndex}`);
    console.log(`   - Probleme fără index: ${problemsWithoutIndex}`);
    console.log(`   - Duplicate pe Index: ${duplicatesByIndex.length}`);
    
    if (duplicatesByIndex.length === 0) {
      console.log('\n✅ Nu s-au găsit duplicate pe baza index-ului! Baza de date este curată.');
      return;
    }
    
    // Show details of duplicates
    console.log('\n📋 Detalii duplicate (bazate pe Index):\n');
    
    duplicatesByIndex.forEach((dup, idx) => {
      console.log(`\n${idx + 1}. Duplicate pe Index: ${dup.index} (${dup.docs.length} probleme)`);
      dup.docs.forEach((d, i) => {
        console.log(`   ${i + 1}. Doc ID: ${d.docId}, Index: ${d.problemIndex}, Titlu: "${d.data.titlu || 'N/A'}"`);
      });
    });
    
    // Prepare duplicates to delete (keep first occurrence, delete rest)
    const docsToDelete = [];
    
    // Process duplicates by Index
    duplicatesByIndex.forEach(dup => {
      // Keep first, delete rest
      for (let i = 1; i < dup.docs.length; i++) {
        docsToDelete.push({
          doc: dup.docs[i].doc,
          reason: `Duplicate Index: ${dup.index}`,
          keptDoc: dup.docs[0].docId,
          keptIndex: dup.index
        });
      }
    });
    
    console.log(`\n\n🗑️  Pregătit pentru ștergere: ${docsToDelete.length} duplicate`);
    console.log(`   (Se păstrează prima apariție, se șterg restul)\n`);
    
    if (docsToDelete.length === 0) {
      console.log('✅ Nu sunt duplicate de șters.');
      return;
    }
    
    // Ask for confirmation (in a real scenario, you might want to add a prompt)
    console.log('⚠️  ATENȚIE: Acest script va șterge duplicatele din baza de date!');
    console.log('   Continuăm cu ștergerea? (Scriptul va continua automat în 5 secunde...)');
    await sleep(5000);
    
    // Delete duplicates in batches
    const BATCH_SIZE = 50;
    let deletedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < docsToDelete.length; i += BATCH_SIZE) {
      const chunk = docsToDelete.slice(i, i + BATCH_SIZE);
      const batch = db.batch();
      
      try {
        chunk.forEach(item => {
          batch.delete(item.doc.ref);
        });
        
        await batch.commit();
        deletedCount += chunk.length;
        
        const processed = Math.min(i + BATCH_SIZE, docsToDelete.length);
        process.stdout.write(`  ✓ ${processed}/${docsToDelete.length} duplicate șterse...\r`);
        
        // Small delay between batch commits
        if (i + BATCH_SIZE < docsToDelete.length) {
          await sleep(100);
        }
      } catch (error) {
        errorCount += chunk.length;
        console.error(`\n❌ Eroare la chunk ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
        
        // If rate limited, wait longer and retry
        if (error.code === 'resource-exhausted' || error.code === 'unavailable' || 
            error.code === 8 || error.message.includes('quota') || error.message.includes('rate')) {
          console.log('⚠️ Rate limit detectat, aștept 2 secunde...');
          await sleep(2000);
          i -= BATCH_SIZE;
          errorCount -= chunk.length;
        }
      }
    }
    
    // Clear progress line
    process.stdout.write(' '.repeat(50) + '\r');
    
    console.log(`\n✅ Procesare completată!`);
    console.log(`\n📊 Statistici finale:`);
    console.log(`   - Total probleme în baza de date: ${problemsSnapshot.size}`);
    console.log(`   - Probleme cu index: ${problemsSnapshot.size - problemsWithoutIndex}`);
    console.log(`   - Probleme fără index: ${problemsWithoutIndex}`);
    console.log(`   - Duplicate găsite pe Index: ${duplicatesByIndex.length}`);
    console.log(`   - Duplicate șterse: ${deletedCount}`);
    console.log(`   - Erori: ${errorCount}`);
    
    // Verify final count
    const finalSnapshot = await db.collection('problems').get();
    console.log(`   - Probleme rămase în baza de date: ${finalSnapshot.size}`);
    
  } catch (error) {
    console.error('\n❌ Eroare la procesare:', error);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    process.exit(1);
  }
}

// Run removal
removeDuplicateProblems().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

