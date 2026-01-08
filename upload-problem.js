import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROBLEM_FILE = 'problem-template.json';

// Initialize Firebase Admin SDK
let serviceAccount;
let initialized = false;

// Method 1: Try to load from .env variable FIREBASE_SERVICE_ACCOUNT_KEY_JSON
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON);
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
  console.error('\n📝 Configurează service account key în .env sau salvează-l ca firebase-service-account-key.json');
  process.exit(1);
}

const db = admin.firestore();

/**
 * Get next available index for normal problems (< 1000)
 */
async function getNextIndex() {
  try {
    const problemsSnapshot = await db.collection('problems').get();
    const existingIndexes = new Set();
    
    problemsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.index !== undefined && data.index !== null && data.index < 1000) {
        existingIndexes.add(data.index);
      }
    });
    
    let nextIndex = 1;
    while (existingIndexes.has(nextIndex)) {
      nextIndex++;
    }
    
    return nextIndex;
  } catch (error) {
    console.error('❌ Eroare la obținerea index-ului:', error);
    throw error;
  }
}

/**
 * Upload problem from problem-template.json to Firestore
 */
async function uploadProblem() {
  try {
    console.log('\n🚀 Încep upload-ul problemei...\n');
    
    // Check if problem file exists
    if (!fs.existsSync(PROBLEM_FILE)) {
      console.error(`❌ Eroare: Fișierul ${PROBLEM_FILE} nu există!`);
      process.exit(1);
    }
    
    // Read problem data from file
    console.log(`📖 Citesc datele problemei din ${PROBLEM_FILE}...`);
    const problemData = JSON.parse(fs.readFileSync(PROBLEM_FILE, 'utf8'));
    
    // Validate required fields
    if (!problemData.titlu) {
      console.error('❌ Eroare: Problema trebuie să aibă un titlu!');
      process.exit(1);
    }
    
    // Get next available index
    const nextIndex = await getNextIndex();
    console.log(`✓ Index disponibil găsit: ${nextIndex}\n`);
    
    // Prepare problem data with index and metadata
    const problemToUpload = {
      ...problemData,
      index: nextIndex,
      creator: '',
      createdAt: new Date().toISOString()
    };
    
    // Ensure subpuncte have IDs
    if (problemToUpload.subpuncte && problemToUpload.subpuncte.length > 0) {
      problemToUpload.subpuncte = problemToUpload.subpuncte.map((subpunct, index) => ({
        id: subpunct.id || `${index + 1}${String.fromCharCode(97 + index)}`,
        cerinta: subpunct.cerinta,
        punctaj: subpunct.punctaj
      }));
    }
    
    // Display problem info
    console.log('📝 Problema de încărcat:');
    console.log(`   Titlu: ${problemToUpload.titlu}`);
    console.log(`   Categorie: ${problemToUpload.categorie || 'N/A'}`);
    console.log(`   Dificultate: ${problemToUpload.dificultate || 'N/A'}`);
    console.log(`   Punctaj total: ${problemToUpload.punctajTotal || 0} puncte`);
    console.log(`   Număr subpuncte: ${problemToUpload.subpuncte?.length || 0}`);
    console.log(`   Număr formule: ${problemToUpload.formule?.length || 0}`);
    console.log(`   Număr date: ${problemToUpload.date ? Object.keys(problemToUpload.date).length : 0}`);
    console.log(`   Index: ${problemToUpload.index}\n`);
    
    // Upload to Firestore
    console.log('📤 Adaug problema în Firestore...');
    const docRef = await db.collection('problems').add(problemToUpload);
    
    console.log(`\n✅ Problema a fost adăugată cu succes!`);
    console.log(`   Firestore Document ID: ${docRef.id}`);
    console.log(`   Index: ${problemToUpload.index}`);
    console.log(`   Titlu: ${problemToUpload.titlu}\n`);
    
    return { success: true, docId: docRef.id, problem: problemToUpload };
  } catch (error) {
    console.error('\n❌ Eroare la upload-ul problemei:', error);
    if (error instanceof SyntaxError) {
      console.error('   Verifică că fișierul JSON este valid!');
    }
    throw error;
  }
}

// Run the script
uploadProblem()
  .then(() => {
    console.log('✅ Script finalizat cu succes!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script finalizat cu eroare:', error);
    process.exit(1);
  });

