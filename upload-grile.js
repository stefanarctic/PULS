import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Configurează VITE_FIREBASE_API_KEY și VITE_FIREBASE_PROJECT_ID în .env');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getNextGrileIndex() {
  const snap = await getDocs(collection(db, 'grile'));
  const indexes = new Set();
  snap.forEach(doc => {
    const idx = doc.data().index;
    if (idx != null) indexes.add(idx);
  });
  let next = 1;
  while (indexes.has(next)) next++;
  return next;
}

const grilaDemo = {
  index: null,
  intrebare: "Care este unitatea de măsură a forței în Sistemul Internațional (SI)?",
  variante: {
    a: "Newton (N)",
    b: "Joule (J)",
    c: "Watt (W)",
    d: "Pascal (Pa)"
  },
  raspunsCorect: "a",
  categorie: "Mecanică",
  dificultate: "ușor",
  explicatie: "Forța se măsoară în newtoni (N) în SI. 1 N = 1 kg·m/s². Joule este pentru energie, Watt pentru putere, Pascal pentru presiune."
};

async function uploadGrile() {
  console.log('\n🚀 Adaug grila de exemplu în Firestore (client SDK)...\n');
  const nextIndex = await getNextGrileIndex();
  grilaDemo.index = nextIndex;
  const docRef = await addDoc(collection(db, 'grile'), grilaDemo);
  console.log('✅ Grila a fost adăugată cu succes!');
  console.log(`   Document ID: ${docRef.id}`);
  console.log(`   Index: ${nextIndex}`);
  console.log(`   Întrebare: ${grilaDemo.intrebare.substring(0, 50)}...\n`);
}

uploadGrile()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Eroare:', err.message || err);
    if (err.code === 'permission-denied') {
      console.error('   Regulile Firestore permit doar adminilor să adauge grile.');
      console.error('   Adaugă grila manual din Firebase Console sau autentifică-te ca admin.');
    }
    process.exit(1);
  });
