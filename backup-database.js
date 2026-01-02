import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Client SDK (same as PULS frontend)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('🔍 Inițializez Firebase Client SDK (ca în PULS)...\n');
console.log(`  Project ID: ${firebaseConfig.projectId || 'N/A'}`);

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Eroare: Variabilele Firebase nu sunt configurate în .env!');
  console.error('   Asigură-te că ai VITE_FIREBASE_API_KEY și VITE_FIREBASE_PROJECT_ID în .env');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configuration
const OUTPUT_FILE = path.join(__dirname, 'database-backup.json');

/**
 * Export all problems from Firestore to JSON file
 */
async function backupDatabase() {
  console.log('\n🚀 Pornesc backup-ul bazei de date...\n');
  
  try {
    // Get all problems from Firestore (same way as PULS does it)
    console.log('📋 Citind probleme din Firestore...');
    const problemsCollection = collection(db, 'problems');
    const querySnapshot = await getDocs(problemsCollection);
    
    const problems = [];
    let totalProblems = 0;
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      problems.push({
        id: doc.id,
        ...data
      });
      totalProblems++;
    });
    
    console.log(`✓ Total probleme citite: ${totalProblems}`);
    
    // Save to JSON file - simple array of problems
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(problems, null, 2), 'utf-8');
    console.log(`\n💾 Backup salvat: ${OUTPUT_FILE}`);
    console.log(`✅ ${totalProblems} probleme exportate cu succes!`);
    
  } catch (error) {
    console.error('\n❌ Eroare la backup:', error);
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    process.exit(1);
  }
}

// Run backup
backupDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

