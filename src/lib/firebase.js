// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBZXOL9Z3T-LLpU3UT8OYgZk3vWZjm-8fo",
  authDomain: "puls-cb0b8.firebaseapp.com",
  projectId: "puls-cb0b8",
  storageBucket: "puls-cb0b8.firebasestorage.app",
  messagingSenderId: "244543673070",
  appId: "1:244543673070:web:5f838252c7c70a7e1d59ff",
  measurementId: "G-D8W6W1QCNJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, provider, db, storage };
