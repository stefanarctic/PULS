import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const useSolvedProblems = () => {
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Monitorizează starea de autentificare
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  // Încarcă problemele rezolvate din Firebase
  const loadSolvedProblems = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      
      if (snap.exists() && snap.data().solvedProblems) {
        setSolvedProblems(snap.data().solvedProblems);
      } else {
        setSolvedProblems([]);
      }
    } catch (error) {
      console.error('Error loading solved problems:', error);
      setSolvedProblems([]);
    } finally {
      setLoading(false);
    }
  };

  // Salvează o problemă rezolvată
  const saveSolvedProblem = async (problemId, scoreObtained, maxScore, customTitle = null) => {
    console.log('🔍 Hook received:', { problemId, scoreObtained, maxScore, customTitle });
    
    if (!user?.uid) {
      throw new Error('User must be authenticated to save solved problems');
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      
      let currentSolvedProblems = [];
      if (snap.exists() && snap.data().solvedProblems) {
        currentSolvedProblems = snap.data().solvedProblems;
      }
      
      // Verifică dacă problema a fost deja rezolvată
      const existingIndex = currentSolvedProblems.findIndex(p => p.problemId === problemId);
      const solvedProblem = {
        problemId,
        scoreObtained,
        maxScore,
        solvedAt: new Date().toISOString(),
        customTitle
      };
      
      console.log('💾 Saving problem:', solvedProblem);
      
      if (existingIndex >= 0) {
        // Actualizează scorul dacă este mai bun
        if (scoreObtained > currentSolvedProblems[existingIndex].scoreObtained) {
          currentSolvedProblems[existingIndex] = solvedProblem;
          console.log('🔄 Updated existing problem with better score');
        } else {
          console.log('⚠️ Existing problem has better score, keeping old one');
        }
      } else {
        // Adaugă problema nouă rezolvată
        currentSolvedProblems.push(solvedProblem);
        console.log('➕ Added new solved problem');
      }
      
      // Salvează în Firebase
      await updateDoc(userRef, { solvedProblems: currentSolvedProblems });
      console.log('✅ Saved to Firebase successfully');
      
      // Actualizează state-ul local
      setSolvedProblems(currentSolvedProblems);
      
      return true;
    } catch (error) {
      console.error('❌ Error saving solved problem:', error);
      throw error;
    }
  };

  // Șterge problemele de test
  const clearTestProblems = async () => {
    if (!user?.uid) {
      throw new Error('User must be authenticated to clear test problems');
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      
      if (snap.exists() && snap.data().solvedProblems) {
        let currentSolvedProblems = snap.data().solvedProblems;
        
        // Filtrează problemele de test (ID-urile 1, 2, 3)
        const filteredProblems = currentSolvedProblems.filter(problem => 
          ![1, 2, 3].includes(Number(problem.problemId))
        );
        
        // Salvează lista filtrată
        await updateDoc(userRef, { solvedProblems: filteredProblems });
        
        // Actualizează state-ul local
        setSolvedProblems(filteredProblems);
        
        return currentSolvedProblems.length - filteredProblems.length;
      }
      return 0;
    } catch (error) {
      console.error('Error clearing test problems:', error);
      throw error;
    }
  };

  // Șterge toate problemele rezolvate
  const clearAllSolvedProblems = async () => {
    if (!user?.uid) {
      throw new Error('User must be authenticated to clear all solved problems');
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { solvedProblems: [] });
      
      // Actualizează state-ul local
      setSolvedProblems([]);
      
      return true;
    } catch (error) {
      console.error('Error clearing all solved problems:', error);
      throw error;
    }
  };

  // Încarcă problemele când se schimbă utilizatorul
  useEffect(() => {
    if (user?.uid) {
      loadSolvedProblems();
    } else {
      setSolvedProblems([]);
    }
  }, [user?.uid]);

  return {
    solvedProblems,
    loading,
    user,
    isAuthenticated: !!user,
    saveSolvedProblem,
    clearTestProblems,
    clearAllSolvedProblems,
    loadSolvedProblems
  };
}; 