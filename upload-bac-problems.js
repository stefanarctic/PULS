import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
// Try to use service account key from environment variable or file
let serviceAccount;
let initialized = false;

// Method 1: Try to load from .env variable FIREBASE_SERVICE_ACCOUNT_KEY_JSON
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
  try {
    // Parse JSON from environment variable
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON);
    console.log('✓ Service Account Key încărcat din variabila de mediu FIREBASE_SERVICE_ACCOUNT_KEY_JSON');
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
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.VITE_FIREBASE_PROJECT_ID
    });
    initialized = true;
    console.log('✓ Firebase Admin SDK inițializat cu Service Account Key');
  } catch (error) {
    console.error('❌ Eroare la inițializarea Firebase Admin SDK:', error.message);
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

// Configuration
const BATCH_SIZE = 50; // Number of problems per batch (Firestore allows up to 500, but we're conservative)
const DELAY_BETWEEN_BATCHES = 1000; // 1 second delay between batches (in milliseconds)
const PROBLEMS_DIR = path.join(__dirname, 'extracted_problems', 'individual');

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a unique identifier for a problem (combines source + subjectNumber + subjectArea)
 */
function getProblemUniqueId(problem) {
  const source = problem.metadata?.source || '';
  const subjectNumber = problem.metadata?.subjectNumber || '';
  const subjectArea = problem.metadata?.subjectArea || '';
  const titlu = problem.titlu || '';
  
  // For BAC problems, we need to distinguish between subproblems
  // Use combination of source + subjectNumber + subjectArea
  if (source) {
    return `${source}_sub${subjectNumber}_${subjectArea}`.toLowerCase().trim();
  }
  
  // Fallback: use title if no source
  return titlu.toLowerCase().trim();
}

/**
 * Get all existing problems from Firestore to check for duplicates and get existing indexes
 */
async function getExistingProblems() {
  console.log('📋 Verific probleme existente în baza de date...');
  const existingProblems = new Set();
  const existingIndexes = new Set();
  let totalProblemsInDb = 0;
  let problemsWithSource = 0;
  let problemsWithoutSource = 0;
  
  try {
    const problemsSnapshot = await db.collection('problems').get();
    totalProblemsInDb = problemsSnapshot.size;
    
    problemsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Create unique identifier combining source + subjectNumber + subjectArea
      const uniqueId = getProblemUniqueId(data);
      if (uniqueId) {
        existingProblems.add(uniqueId);
        if (data.metadata?.source) {
          problemsWithSource++;
        } else {
          problemsWithoutSource++;
        }
      }
      // Collect all existing indexes
      if (data.index !== undefined && data.index !== null) {
        existingIndexes.add(data.index);
      }
    });
    
    console.log(`✓ Total probleme în baza de date: ${totalProblemsInDb}`);
    console.log(`✓ Probleme cu metadata.source: ${problemsWithSource}`);
    console.log(`✓ Probleme fără metadata.source: ${problemsWithoutSource}`);
    console.log(`✓ Identificatori unici găsiți: ${existingProblems.size}`);
    console.log(`✓ Index-uri unice găsite: ${existingIndexes.size}`);
    return { existingProblems, existingIndexes, totalProblemsInDb };
  } catch (error) {
    console.error('❌ Eroare la citirea problemelor existente:', error);
    throw error;
  }
}

/**
 * Read all problem JSON files
 */
function readProblemFiles() {
  console.log(`📂 Citind fișiere din ${PROBLEMS_DIR}...`);
  
  if (!fs.existsSync(PROBLEMS_DIR)) {
    throw new Error(`Directorul ${PROBLEMS_DIR} nu există!`);
  }
  
  const files = fs.readdirSync(PROBLEMS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(PROBLEMS_DIR, f));
  
  console.log(`✓ Găsite ${files.length} fișiere JSON`);
  return files;
}

/**
 * Load and parse a problem file
 */
function loadProblem(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const problem = JSON.parse(content);
    return problem;
  } catch (error) {
    console.error(`❌ Eroare la citirea ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Upload a batch of problems to Firestore using batch writes with rate limiting
 */
async function uploadBatch(problems, batchNumber, totalBatches) {
  console.log(`\n📤 Upload batch ${batchNumber}/${totalBatches} (${problems.length} probleme)...`);
  
  const problemsRef = db.collection('problems');
  let successCount = 0;
  let errorCount = 0;
  
  // Use Firestore batch writes (max 500 operations per batch)
  // We'll process in smaller chunks to be safe
  const WRITE_BATCH_SIZE = 50; // Operations per Firestore batch
  
  for (let i = 0; i < problems.length; i += WRITE_BATCH_SIZE) {
    const chunk = problems.slice(i, i + WRITE_BATCH_SIZE);
    const batch = db.batch();
    
    try {
      // Add all problems in chunk to batch
      chunk.forEach(problem => {
        const docRef = problemsRef.doc(); // Auto-generate document ID
        batch.set(docRef, problem);
      });
      
      // Commit the batch
      await batch.commit();
      successCount += chunk.length;
      
      // Show progress
      const processed = Math.min(i + WRITE_BATCH_SIZE, problems.length);
      process.stdout.write(`  ✓ ${processed}/${problems.length} probleme procesate...\r`);
      
      // Small delay between batch commits to avoid rate limits
      if (i + WRITE_BATCH_SIZE < problems.length) {
        await sleep(100); // 100ms delay between batch commits
      }
    } catch (error) {
      errorCount += chunk.length;
      const source = chunk[0]?.metadata?.source || 'unknown';
      console.error(`\n❌ Eroare la chunk ${Math.floor(i / WRITE_BATCH_SIZE) + 1} (${source}):`, error.message);
      
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
  
  console.log(`✓ Batch ${batchNumber} finalizat: ${successCount} probleme încărcate, ${errorCount} erori`);
  return { success: successCount, errors: errorCount };
}

/**
 * Find the next available index for BAC problems (starting from 1000)
 */
function getNextBacIndex(existingIndexes, startIndex = 1000) {
  let nextIndex = startIndex;
  
  // Find the smallest available index >= 1000
  while (existingIndexes.has(nextIndex)) {
    nextIndex++;
  }
  
  return nextIndex;
}

/**
 * Check if a problem is a BAC problem
 */
function isBacProblem(problem) {
  const categorie = problem.categorie || '';
  const normalizedCategorie = categorie.toLowerCase().trim();
  
  // Check category first (most reliable)
  if (normalizedCategorie === 'bac') {
    return true;
  }
  
  // Check metadata.source for BAC indicators
  const source = problem.metadata?.source || '';
  if (source.toLowerCase().includes('bac') || 
      source.toLowerCase().includes('fizica_tehnologic') ||
      source.toLowerCase().includes('fizica_real')) {
    return true;
  }
  
  // Check if it has BAC-specific metadata fields
  if (problem.metadata?.year && 
      (problem.metadata?.subjectNumber !== undefined || 
       problem.metadata?.variant !== undefined ||
       problem.metadata?.session === 'bac')) {
    return true;
  }
  
  return false;
}

/**
 * Update existing BAC problems that have incorrect indexes (< 1000 or missing)
 */
async function updateExistingBacProblems(existingIndexes) {
  console.log('\n🔄 Verific și actualizez problemele existente de BAC...');
  
  try {
    const problemsSnapshot = await db.collection('problems').get();
    const problemsToUpdate = [];
    
    // Find all BAC problems that need index update
    problemsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Check if it's a BAC problem
      if (isBacProblem(data)) {
        const currentIndex = data.index;
        
        // Need update if: no index, or index < 1000
        if (currentIndex === undefined || currentIndex === null || currentIndex < 1000) {
          problemsToUpdate.push({
            docId: doc.id,
            currentIndex: currentIndex,
            data: data
          });
        }
      }
    });
    
    if (problemsToUpdate.length === 0) {
      console.log('✓ Toate problemele de BAC au deja index-uri corecte (>= 1000)');
      return existingIndexes;
    }
    
    console.log(`📝 Găsite ${problemsToUpdate.length} probleme de BAC care necesită actualizare index`);
    
    // Assign new indexes first
    const problemsWithNewIndexes = [];
    let currentBacIndex = getNextBacIndex(existingIndexes);
    
    for (const problemInfo of problemsToUpdate) {
      const newIndex = currentBacIndex;
      existingIndexes.add(newIndex); // Mark as used
      currentBacIndex = getNextBacIndex(existingIndexes, currentBacIndex + 1);
      
      problemsWithNewIndexes.push({
        docId: problemInfo.docId,
        newIndex: newIndex,
        oldIndex: problemInfo.currentIndex
      });
    }
    
    // Update in batches
    const UPDATE_BATCH_SIZE = 50; // Firestore allows max 500, we use 50 to be safe
    let updatedCount = 0;
    
    for (let i = 0; i < problemsWithNewIndexes.length; i += UPDATE_BATCH_SIZE) {
      const batch = db.batch();
      const chunk = problemsWithNewIndexes.slice(i, i + UPDATE_BATCH_SIZE);
      
      chunk.forEach(problemUpdate => {
        const docRef = db.collection('problems').doc(problemUpdate.docId);
        batch.update(docRef, { index: problemUpdate.newIndex });
      });
      
      try {
        await batch.commit();
        updatedCount += chunk.length;
        const processed = Math.min(i + UPDATE_BATCH_SIZE, problemsWithNewIndexes.length);
        console.log(`  ✓ Actualizat: ${processed}/${problemsWithNewIndexes.length} probleme...`);
        
        // Small delay between batches to avoid rate limits
        if (i + UPDATE_BATCH_SIZE < problemsWithNewIndexes.length) {
          await sleep(100);
        }
      } catch (error) {
        console.error(`  ❌ Eroare la actualizarea batch-ului (${i / UPDATE_BATCH_SIZE + 1}):`, error.message);
        
        // If rate limited, wait longer and retry
        if (error.code === 'resource-exhausted' || error.code === 'unavailable' || 
            error.code === 8 || error.message.includes('quota') || error.message.includes('rate')) {
          console.log('  ⏳ Rate limit detectat, aștept 2 secunde...');
          await sleep(2000);
          // Retry this batch
          i -= UPDATE_BATCH_SIZE;
        }
      }
    }
    
    console.log(`✅ Actualizare finalizată: ${updatedCount} probleme de BAC au primit index-uri corecte (>= 1000)`);
    
    return existingIndexes;
  } catch (error) {
    console.error('❌ Eroare la actualizarea problemelor existente:', error);
    throw error;
  }
}

/**
 * Main upload function
 */
async function uploadProblems() {
  console.log('🚀 Pornesc upload-ul problemelor BAC...\n');
  
  try {
    // Step 1: Get existing problems and indexes
    const { existingProblems, existingIndexes, totalProblemsInDb } = await getExistingProblems();
    
    // Step 1.5: Update existing BAC problems with correct indexes
    const updatedIndexes = await updateExistingBacProblems(new Set(existingIndexes));
    
    // Merge updated indexes back
    updatedIndexes.forEach(idx => existingIndexes.add(idx));
    
    // Step 2: Read all problem files
    const files = readProblemFiles();
    
    // Step 3: Load and filter problems, assign indexes
    console.log('\n📖 Încărc problemele și atribui index-uri...');
    const problemsToUpload = [];
    let skippedCount = 0;
    let skippedNoSource = 0;
    let errorCount = 0;
    let currentBacIndex = getNextBacIndex(existingIndexes);
    
    for (const file of files) {
      const problem = loadProblem(file);
      if (!problem) {
        errorCount++;
        continue;
      }
      
      // Check if problem already exists using unique identifier
      const uniqueId = getProblemUniqueId(problem);
      if (uniqueId && existingProblems.has(uniqueId)) {
        skippedCount++;
        continue;
      }
      
      // If problem doesn't have enough metadata, log it
      if (!problem.metadata?.source) {
        skippedNoSource++;
        console.log(`  ⚠️ Problemă fără metadata.source: ${problem.titlu || 'N/A'}`);
      }
      
      // Assign unique index for BAC problems (>= 1000)
      problem.index = currentBacIndex;
      existingIndexes.add(currentBacIndex); // Mark as used
      currentBacIndex = getNextBacIndex(existingIndexes, currentBacIndex + 1);
      
      // Ensure category is set to 'Bac'
      if (!problem.categorie || problem.categorie !== 'Bac') {
        problem.categorie = 'Bac';
      }
      
      // Add to upload queue
      problemsToUpload.push(problem);
      
      // Add to existing set to avoid duplicates in the same run
      if (uniqueId) {
        existingProblems.add(uniqueId);
      }
    }
    
    if (problemsToUpload.length > 0) {
      console.log(`✓ Index-uri atribuite: ${problemsToUpload[0].index} - ${problemsToUpload[problemsToUpload.length - 1].index}`);
    }
    
    console.log(`✓ Probleme procesate:`);
    console.log(`  - De încărcat: ${problemsToUpload.length}`);
    console.log(`  - Deja existente (după source): ${skippedCount}`);
    console.log(`  - Fără metadata.source: ${skippedNoSource}`);
    console.log(`  - Erori: ${errorCount}`);
    
    if (problemsToUpload.length === 0) {
      console.log('\n✅ Toate problemele sunt deja în baza de date!');
      return;
    }
    
    // Step 4: Upload in batches
    console.log(`\n📤 Încep upload-ul în batch-uri de ${BATCH_SIZE} probleme...`);
    const totalBatches = Math.ceil(problemsToUpload.length / BATCH_SIZE);
    let totalSuccess = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < problemsToUpload.length; i += BATCH_SIZE) {
      const batch = problemsToUpload.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      
      const result = await uploadBatch(batch, batchNumber, totalBatches);
      totalSuccess += result.success;
      totalErrors += result.errors;
      
      // Add delay between batches (except for the last one)
      if (i + BATCH_SIZE < problemsToUpload.length) {
        console.log(`⏳ Aștept ${DELAY_BETWEEN_BATCHES}ms înainte de următorul batch...`);
        await sleep(DELAY_BETWEEN_BATCHES);
      }
    }
    
    // Step 5: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 REZUMAT FINAL');
    console.log('='.repeat(60));
    console.log(`Total probleme în baza de date (înainte): ${totalProblemsInDb}`);
    console.log(`Total fișiere procesate: ${files.length}`);
    console.log(`Probleme încărcate: ${totalSuccess}`);
    console.log(`Probleme deja existente (după source): ${skippedCount}`);
    console.log(`Probleme fără metadata.source: ${skippedNoSource}`);
    console.log(`Erori: ${totalErrors + errorCount}`);
    console.log(`Total probleme în baza de date (după): ${totalProblemsInDb + totalSuccess}`);
    console.log('='.repeat(60));
    
    if (totalSuccess > 0) {
      console.log(`\n✅ Upload finalizat cu succes! ${totalSuccess} probleme au fost adăugate în baza de date.`);
    }
    
  } catch (error) {
    console.error('\n❌ Eroare fatală:', error);
    process.exit(1);
  }
}

// Run the upload
uploadProblems()
  .then(() => {
    console.log('\n✨ Script finalizat!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Eroare:', error);
    process.exit(1);
  });

