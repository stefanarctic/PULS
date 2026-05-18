/**
 * Inițializare unică Firebase Admin pentru scripturi Node (service account sau ADC).
 * Calea implicită la cheie: rădăcina proiectului / firebase-service-account-key.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

let serviceAccount;
let initialized = false;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON) {
  try {
    const cleanedJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_JSON.trim().replace(/^['"]|['"]$/g, '');
    serviceAccount = JSON.parse(cleanedJson);
    console.log('✓ Service Account Key încărcat din FIREBASE_SERVICE_ACCOUNT_KEY_JSON');
  } catch (error) {
    console.error('❌ Eroare la parsarea FIREBASE_SERVICE_ACCOUNT_KEY_JSON:', error.message);
  }
}

if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (fs.existsSync(serviceAccountPath)) {
    try {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      console.log('✓ Service Account Key încărcat din fișier:', serviceAccountPath);
    } catch (error) {
      console.error('❌ Eroare la citirea fișierului:', error.message);
    }
  }
}

if (!serviceAccount) {
  const defaultPath = path.join(projectRoot, 'firebase-service-account-key.json');
  if (fs.existsSync(defaultPath)) {
    try {
      serviceAccount = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
      console.log('✓ Service Account Key încărcat din fișierul implicit (rădăcină proiect)');
    } catch (error) {
      console.error('❌ Eroare la citirea fișierului implicit:', error.message);
    }
  }
}

if (!serviceAccount && !initialized) {
  try {
    admin.initializeApp({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    });
    initialized = true;
    console.log('✓ Firebase Admin SDK inițializat cu Application Default Credentials');
  } catch {
    // handled below
  }
}

if (serviceAccount && !initialized) {
  try {
    const projectId =
      serviceAccount.project_id || process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error('Project ID nu a fost găsit');
    }
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId,
    });
    initialized = true;
    console.log('✓ Firebase Admin SDK inițializat cu Service Account Key');
  } catch (error) {
    console.error('❌ Eroare la inițializarea Firebase Admin SDK:', error.message);
    process.exit(1);
  }
}

if (!initialized) {
  console.error('\n❌ Nu s-a putut inițializa Firebase Admin SDK (cheie / ADC lipsă).');
  process.exit(1);
}

export const db = admin.firestore();
export { admin };
