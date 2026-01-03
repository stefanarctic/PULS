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
let serviceAccount;
let initialized = false;

// Method 1: Try to load from .env variable FIREBASE_SERVICE_ACCOUNT_KEY_JSON
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
  try {
    const jsonString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON;
    const cleanedJson = jsonString.trim().replace(/^['"]|['"]$/g, '');
    serviceAccount = JSON.parse(cleanedJson);
    console.log('✓ Service Account Key încărcat din variabila de mediu');
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
      throw new Error('Project ID nu a fost găsit');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId
    });
    initialized = true;
    console.log('✓ Firebase Admin SDK inițializat cu Service Account Key');
  } catch (error) {
    console.error('❌ Eroare la inițializarea Firebase Admin SDK:', error.message);
    process.exit(1);
  }
}

if (!initialized) {
  console.error('\n❌ Eroare: Nu s-a putut inițializa Firebase Admin SDK!');
  process.exit(1);
}

const db = admin.firestore();

// Configuration
const INPUT_FILE = path.join(__dirname, 'bac-problems-only.json');
const BATCH_SIZE = 50;
const DELAY_BETWEEN_BATCHES = 1000;

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a unique identifier for a problem
 */
function getProblemUniqueId(problem) {
  const source = problem.metadata?.source || '';
  const subjectNumber = problem.metadata?.subjectNumber || '';
  const subjectArea = problem.metadata?.subjectArea || '';
  
  if (source) {
    return `${source}_sub${subjectNumber}_${subjectArea}`.toLowerCase().trim();
  }
  
  return (problem.titlu || '').toLowerCase().trim();
}

/**
 * Get all existing BAC problems from Firestore with their document IDs
 */
async function getExistingBacProblems() {
  console.log('📋 Verific probleme existente de BAC în baza de date...');
  const existingProblemsMap = new Map(); // uniqueId -> { docId, data }
  let totalProblemsInDb = 0;
  let bacProblemsCount = 0;
  
  try {
    const problemsSnapshot = await db.collection('problems').get();
    totalProblemsInDb = problemsSnapshot.size;
    
    problemsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Check if it's a BAC problem
      const isBac = (data.categorie || '').toLowerCase() === 'bac' ||
                    (data.metadata?.source || '').toLowerCase().includes('bac') ||
                    (data.metadata?.source || '').toLowerCase().includes('fizica_tehnologic') ||
                    (data.metadata?.source || '').toLowerCase().includes('fizica_real') ||
                    (data.metadata?.session === 'bac');
      
      if (isBac) {
        bacProblemsCount++;
        const uniqueId = getProblemUniqueId(data);
        if (uniqueId) {
          existingProblemsMap.set(uniqueId, {
            docId: doc.id,
            data: data
          });
        }
      }
    });
    
    console.log(`✓ Total probleme în baza de date: ${totalProblemsInDb}`);
    console.log(`✓ Probleme de BAC găsite: ${bacProblemsCount}`);
    console.log(`✓ Probleme de BAC cu identificator unic: ${existingProblemsMap.size}`);
    return { existingProblemsMap, totalProblemsInDb, bacProblemsCount };
  } catch (error) {
    console.error('❌ Eroare la citirea problemelor existente:', error);
    throw error;
  }
}

/**
 * Find the next available index for BAC problems (starting from 1000)
 */
function getNextBacIndex(existingIndexes, startIndex = 1000) {
  let nextIndex = startIndex;
  while (existingIndexes.has(nextIndex)) {
    nextIndex++;
  }
  return nextIndex;
}

/**
 * Update content field for existing problems
 */
async function updateBatch(updates, batchNumber, totalBatches) {
  console.log(`\n📤 Actualizez batch ${batchNumber}/${totalBatches} (${updates.length} probleme)...`);
  
  const problemsRef = db.collection('problems');
  let successCount = 0;
  let errorCount = 0;
  const WRITE_BATCH_SIZE = 50;
  
  for (let i = 0; i < updates.length; i += WRITE_BATCH_SIZE) {
    const chunk = updates.slice(i, i + WRITE_BATCH_SIZE);
    const batch = db.batch();
    
    try {
      chunk.forEach(({ docId, continut }) => {
        const docRef = problemsRef.doc(docId);
        // Update only the continut field
        batch.update(docRef, { continut: continut });
      });
      
      await batch.commit();
      successCount += chunk.length;
      
      const processed = Math.min(i + WRITE_BATCH_SIZE, updates.length);
      process.stdout.write(`  ✓ ${processed}/${updates.length} probleme actualizate...\r`);
      
      if (i + WRITE_BATCH_SIZE < updates.length) {
        await sleep(100);
      }
    } catch (error) {
      errorCount += chunk.length;
      console.error(`\n❌ Eroare la chunk ${Math.floor(i / WRITE_BATCH_SIZE) + 1}:`, error.message);
      
      if (error.code === 'resource-exhausted' || error.code === 'unavailable' || 
          error.code === 8 || error.message.includes('quota') || error.message.includes('rate')) {
        console.log('⚠️ Rate limit detectat, aștept 2 secunde...');
        await sleep(2000);
        i -= WRITE_BATCH_SIZE;
        errorCount -= chunk.length;
      }
    }
  }
  
  process.stdout.write(' '.repeat(50) + '\r');
  console.log(`✓ Batch ${batchNumber} finalizat: ${successCount} probleme actualizate, ${errorCount} erori`);
  return { success: successCount, errors: errorCount };
}

/**
 * Main upload function
 */
async function updateBacProblemsContent() {
  console.log('🚀 Pornesc actualizarea conținutului problemelor de BAC existente...\n');
  
  try {
    // Step 1: Read input file
    console.log(`📖 Citesc fișierul: ${INPUT_FILE}`);
    if (!fs.existsSync(INPUT_FILE)) {
      console.error(`❌ Fișierul nu există: ${INPUT_FILE}`);
      console.error('   Rulează mai întâi: node extract-bac-only.js');
      process.exit(1);
    }
    
    const fileContent = fs.readFileSync(INPUT_FILE, 'utf-8');
    const problems = JSON.parse(fileContent);
    
    console.log(`✓ Găsite ${problems.length} probleme de BAC în fișier\n`);
    
    // Step 2: Get existing BAC problems from database
    const { existingProblemsMap, totalProblemsInDb, bacProblemsCount } = await getExistingBacProblems();
    
    // Step 3: Match problems from file with existing ones and prepare updates
    console.log('\n📖 Pregătesc actualizările pentru problemele existente...');
    const updatesToApply = [];
    let notFoundCount = 0;
    let alreadyUpToDateCount = 0;
    
    for (const problem of problems) {
      const uniqueId = getProblemUniqueId(problem);
      
      if (!uniqueId) {
        notFoundCount++;
        continue;
      }
      
      const existingProblem = existingProblemsMap.get(uniqueId);
      
      if (!existingProblem) {
        notFoundCount++;
        continue;
      }
      
      // Check if content is different
      const newContent = problem.continut || '';
      const existingContent = existingProblem.data.continut || '';
      
      if (newContent === existingContent) {
        alreadyUpToDateCount++;
        continue;
      }
      
      // Prepare update
      updatesToApply.push({
        docId: existingProblem.docId,
        continut: newContent,
        titlu: problem.titlu || existingProblem.data.titlu
      });
    }
    
    console.log(`✓ Probleme pregătite pentru actualizare:`);
    console.log(`  - De actualizat: ${updatesToApply.length}`);
    console.log(`  - Deja actualizate (conținut identic): ${alreadyUpToDateCount}`);
    console.log(`  - Nu găsite în baza de date: ${notFoundCount}`);
    
    if (updatesToApply.length === 0) {
      console.log('\n✅ Toate problemele sunt deja actualizate!');
      return;
    }
    
    // Step 4: Update in batches
    console.log(`\n📤 Încep actualizarea în batch-uri de ${BATCH_SIZE} probleme...`);
    const totalBatches = Math.ceil(updatesToApply.length / BATCH_SIZE);
    let totalSuccess = 0;
    let totalErrors = 0;
    
    for (let i = 0; i < updatesToApply.length; i += BATCH_SIZE) {
      const batch = updatesToApply.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      
      const result = await updateBatch(batch, batchNumber, totalBatches);
      totalSuccess += result.success;
      totalErrors += result.errors;
      
      if (i + BATCH_SIZE < updatesToApply.length) {
        console.log(`⏳ Aștept ${DELAY_BETWEEN_BATCHES}ms înainte de următorul batch...`);
        await sleep(DELAY_BETWEEN_BATCHES);
      }
    }
    
    // Step 5: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 REZUMAT FINAL');
    console.log('='.repeat(60));
    console.log(`Total probleme în baza de date: ${totalProblemsInDb}`);
    console.log(`Probleme de BAC în baza de date: ${bacProblemsCount}`);
    console.log(`Total probleme în fișier: ${problems.length}`);
    console.log(`Probleme actualizate: ${totalSuccess}`);
    console.log(`Probleme deja actualizate (conținut identic): ${alreadyUpToDateCount}`);
    console.log(`Probleme nu găsite în baza de date: ${notFoundCount}`);
    console.log(`Erori: ${totalErrors}`);
    console.log('='.repeat(60));
    
    if (totalSuccess > 0) {
      console.log(`\n✅ Actualizare finalizată cu succes! ${totalSuccess} probleme au fost actualizate în baza de date.`);
    }
    
  } catch (error) {
    console.error('\n❌ Eroare fatală:', error);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

// Run the update
updateBacProblemsContent()
  .then(() => {
    console.log('\n✨ Script finalizat!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Eroare:', error);
    process.exit(1);
  });

