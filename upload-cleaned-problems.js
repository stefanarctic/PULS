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

// Initialize Firebase Admin SDK (exact same as upload-bac-problems.js)
let serviceAccount;
let initialized = false;

// Method 1: Try to load from .env variable FIREBASE_SERVICE_ACCOUNT_KEY_JSON
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
  try {
    const jsonString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
    // Handle case where JSON might be wrapped in quotes in .env
    const cleanedJson = jsonString.trim().replace(/^['"]|['"]$/g, '');
    serviceAccount = JSON.parse(cleanedJson);
    console.log('✓ Service Account Key încărcat din variabila de mediu FIREBASE_SERVICE_ACCOUNT_KEY_JSON');
    console.log(`  Project ID: ${serviceAccount.project_id || 'N/A'}`);
    console.log(`  Client Email: ${serviceAccount.client_email || 'N/A'}`);
  } catch (error) {
    console.error('❌ Eroare la parsarea FIREBASE_SERVICE_ACCOUNT_KEY_JSON:', error.message);
    console.error('  JSON length:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON?.length || 0);
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

// Method 4: Try Application Default Credentials (for Google Cloud)
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
    console.error('  Stack:', error.stack);
    process.exit(1);
  }
}

// If still not initialized, show error
if (!initialized) {
  console.error('\n❌ Eroare: Nu s-a putut inițializa Firebase Admin SDK!');
  console.error('\n📝 Pentru a configura service account key în .env:');
  console.error('\n   1. Mergi la Firebase Console:');
  console.error('      https://console.firebase.google.com/');
  console.error('   2. Selectează proiectul tău');
  console.error('   3. Mergi la Project Settings > Service Accounts');
  console.error('   4. Click "Generate New Private Key"');
  console.error('   5. Copiază conținutul JSON al fișierului');
  console.error('\n   6. Adaugă în fișierul .env:');
  console.error('      FIREBASE_SERVICE_ACCOUNT_KEY_JSON=\'{"type":"service_account",...}\'');
  console.error('\n   SAU salvează fișierul ca firebase-service-account-key.json în root-ul proiectului');
  console.error('\n   SAU setează în .env:');
  console.error('      FIREBASE_SERVICE_ACCOUNT_KEY=/path/to/service-account-key.json');
  process.exit(1);
}

const db = admin.firestore();

// Debug: Verify Firebase is initialized
console.log('✓ Firebase Admin SDK inițializat');
console.log('✓ Firestore database conectat');
console.log(`✓ Project ID: ${admin.app().options.projectId || 'N/A'}\n`);

// Configuration
const INPUT_FILE = path.join(__dirname, 'database-backup.json'); // Folosim backup-ul original
const BATCH_SIZE = 50; // Firestore allows max 500 operations per batch

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Upload problems to Firestore
 */
async function uploadCleanedProblems() {
  console.log('\n🚀 Pornesc upload-ul problemelor din backup-ul original...\n');
  
  try {
    // Read backup file (original, before cleaning)
    console.log(`📖 Citesc fișierul: ${INPUT_FILE}`);
    if (!fs.existsSync(INPUT_FILE)) {
      console.error(`❌ Fișierul nu există: ${INPUT_FILE}`);
      console.error('   Rulează mai întâi: npm run backup-db');
      process.exit(1);
    }
    
    const fileContent = fs.readFileSync(INPUT_FILE, 'utf-8');
    const problems = JSON.parse(fileContent);
    
    console.log(`✓ Găsite ${problems.length} probleme în backup-ul original\n`);
    
    // Filter problems that have an ID (some might not have one)
    const problemsWithId = problems.filter(problem => {
      return problem.id !== undefined && problem.id !== null;
    });
    
    const problemsWithoutId = problems.length - problemsWithId.length;
    if (problemsWithoutId > 0) {
      console.log(`⚠️  ${problemsWithoutId} probleme fără ID au fost filtrate\n`);
    }
    
    // Remove duplicates based on ID (keep first occurrence)
    // Also check for duplicates by index if ID is missing
    const seenIds = new Set();
    const seenIndexes = new Set();
    const uniqueProblems = [];
    let duplicateByIdCount = 0;
    let duplicateByIndexCount = 0;
    
    for (const problem of problemsWithId) {
      const problemId = String(problem.id);
      const problemIndex = problem.index;
      
      // Check for duplicate by ID
      if (seenIds.has(problemId)) {
        duplicateByIdCount++;
        console.log(`⚠️  Duplicat găsit și eliminat (ID): ID ${problemId} - "${problem.titlu || 'N/A'}"`);
        continue;
      }
      
      // Check for duplicate by index (if index exists and is valid)
      if (problemIndex !== undefined && problemIndex !== null) {
        if (seenIndexes.has(problemIndex)) {
          duplicateByIndexCount++;
          console.log(`⚠️  Duplicat găsit și eliminat (Index): Index ${problemIndex}, ID ${problemId} - "${problem.titlu || 'N/A'}"`);
          continue;
        }
        seenIndexes.add(problemIndex);
      }
      
      // Problem is unique, add it
      seenIds.add(problemId);
      uniqueProblems.push(problem);
    }
    
    const totalDuplicates = duplicateByIdCount + duplicateByIndexCount;
    if (totalDuplicates > 0) {
      console.log(`\n⚠️  Duplicate eliminate:`);
      console.log(`   - Duplicate pe ID: ${duplicateByIdCount}`);
      console.log(`   - Duplicate pe Index: ${duplicateByIndexCount}`);
      console.log(`   - Total duplicate: ${totalDuplicates}\n`);
    }
    
    console.log(`📤 Procesez ${uniqueProblems.length} probleme unice...\n`);
    
    // Use same method as upload-bac-problems.js
    const problemsRef = db.collection('problems');
    const WRITE_BATCH_SIZE = 50; // Operations per Firestore batch
    let successCount = 0;
    let errorCount = 0;
    
    // Process in chunks (same as upload-bac-problems.js)
    for (let i = 0; i < uniqueProblems.length; i += WRITE_BATCH_SIZE) {
      const chunk = uniqueProblems.slice(i, i + WRITE_BATCH_SIZE);
      const batch = db.batch();
      
      try {
        // Add all problems in chunk to batch
        chunk.forEach(problem => {
          // Use the original ID from backup (Firestore document ID)
          const problemId = String(problem.id);
          
          // Remove the id field before saving (Firestore uses document ID, not a field)
          const { id, ...problemData } = problem;
          
          // Replace document completely - use set without merge to restore exact state
          // This will replace existing documents or create them if they don't exist
          const docRef = problemsRef.doc(problemId);
          batch.set(docRef, problemData, { merge: false });
        });
        
        // Commit the batch
        await batch.commit();
        successCount += chunk.length;
        
        // Show progress
        const processed = Math.min(i + WRITE_BATCH_SIZE, uniqueProblems.length);
        process.stdout.write(`  ✓ ${processed}/${uniqueProblems.length} probleme procesate...\r`);
        
        // Small delay between batch commits to avoid rate limits
        if (i + WRITE_BATCH_SIZE < uniqueProblems.length) {
          await sleep(100); // 100ms delay between batch commits
        }
      } catch (error) {
        errorCount += chunk.length;
        console.error(`\n❌ Eroare la chunk ${Math.floor(i / WRITE_BATCH_SIZE) + 1}:`, error.message);
        
        // If rate limited, wait longer and retry
        if (error.code === 'resource-exhausted' || error.code === 'unavailable' || 
            error.code === 8 || error.message.includes('quota') || error.message.includes('rate')) {
          console.log('⚠️ Rate limit detectat, aștept 2 secunde...');
          await sleep(2000);
          // Retry this chunk
          i -= WRITE_BATCH_SIZE;
          errorCount -= chunk.length;
        }
      }
    }
    
    // Clear progress line
    process.stdout.write(' '.repeat(50) + '\r');
    
    console.log(`\n✅ Upload completat!`);
    console.log(`\n📊 Statistici:`);
    console.log(`   - Total probleme în backup: ${problems.length}`);
    console.log(`   - Probleme cu ID: ${problemsWithId.length}`);
    console.log(`   - Probleme fără ID (filtrate): ${problemsWithoutId}`);
    console.log(`   - Duplicate eliminate: ${totalDuplicates} (${duplicateByIdCount} pe ID, ${duplicateByIndexCount} pe Index)`);
    console.log(`   - Probleme unice procesate: ${uniqueProblems.length}`);
    console.log(`   - Probleme restaurate cu succes: ${successCount}`);
    console.log(`   - Erori: ${errorCount}`);
    
  } catch (error) {
    console.error('\n❌ Eroare la upload:', error);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    process.exit(1);
  }
}

// Run upload
uploadCleanedProblems().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

