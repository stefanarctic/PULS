import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const useAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);

  // Monitorizează starea de autentificare
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  // Încarcă achievement-urile din Firebase
  const loadAchievements = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      
      if (snap.exists() && snap.data().achievements) {
        setAchievements(snap.data().achievements);
      } else {
        setAchievements([]);
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  // Verifică și adaugă achievements noi bazate pe datele utilizatorului
  const checkAchievements = async (userData = {}) => {
    if (!user?.uid) return { saved: [], new: [] };

    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      
      if (!snap.exists()) {
        return { saved: [], new: [] };
      }

      const userDoc = snap.data();
      const existingAchievements = userDoc.achievements || [];
      
      // Extrage datele necesare pentru calcularea achievements
      const solvedProblems = userData.solvedProblems || userDoc.solvedProblems || [];
      const simulationsVisited = userData.simulationsVisited || userDoc.simulationsVisited || [];
      const alias = userData.alias || userDoc.alias || '';
      
      // Citește userProblems din subcollection dacă nu sunt pasate
      let userProblems = userData.userProblems;
      if (!userProblems) {
        try {
          const userProblemsRef = collection(db, 'users', user.uid, 'userProblems');
          const querySnapshot = await getDocs(userProblemsRef);
          userProblems = querySnapshot.docs.map(doc => doc.data());
        } catch (error) {
          console.error('Error loading user problems:', error);
          userProblems = [];
        }
      }
      
      // Calculează achievements noi
      const calculatedAchievements = calculateAchievements(
        solvedProblems,
        simulationsVisited,
        userProblems,
        alias
      );

      // Identifică achievement-urile noi
      const newAchievementsList = calculatedAchievements.filter(
        newAch => !achievementExists(newAch, existingAchievements)
      );

      // Creează lista finală (păstrează achievement-urile existente și adaugă pe cele noi)
      const milestoneTitles = new Set(
        calculatedAchievements
          .filter(a => a.type === 'milestone')
          .map(a => a.title)
      );

      const finalAchievements = [
        // Păstrează achievement-urile non-milestone existente care nu sunt în lista calculată
        ...existingAchievements.filter(
          existing => existing.type !== 'milestone' || milestoneTitles.has(existing.title)
        ),
        // Adaugă toate achievement-urile calculate (vor înlocui pe cele vechi dacă există)
        ...calculatedAchievements
      ];

      // Elimină duplicatele (păstrând ultima versiune)
      const uniqueAchievements = [];
      const seen = new Set();
      for (let i = finalAchievements.length - 1; i >= 0; i--) {
        const key = `${finalAchievements[i].type}-${finalAchievements[i].title}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueAchievements.unshift(finalAchievements[i]);
        }
      }

      // Salvează în Firebase doar dacă există achievements noi
      if (newAchievementsList.length > 0) {
        await updateDoc(userRef, { achievements: uniqueAchievements });
        setAchievements(uniqueAchievements);
        setNewAchievements(newAchievementsList);
        
        // Șterge notificările după 5 secunde
        setTimeout(() => {
          setNewAchievements([]);
        }, 5000);
      }

      return { saved: uniqueAchievements, new: newAchievementsList };
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  };

  // Calculează achievements bazate pe datele utilizatorului
  const calculateAchievements = (solvedProblems, simulationsVisited, userProblems, alias) => {
    const ach = [];
    
    // Calculează statistici pentru achievements
    const solvedCount = solvedProblems.length;
    const perfectScores = solvedProblems.filter(
      p => p.scoreObtained === p.maxScore && p.maxScore > 0
    ).length;
    
    const totalScore = solvedProblems.reduce((total, p) => total + (p.scoreObtained || 0), 0);
    const maxPossibleScore = solvedProblems.reduce((total, p) => total + (p.maxScore || 0), 0);
    const averageScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    
    // Analizează dificultățile și categoriile problemelor rezolvate
    const solvedDifficulties = {};
    const solvedCategories = {};
    // Notă: Pentru a analiza dificultățile și categoriile, ar trebui să avem acces la problemele originale
    // Pentru moment, le omitem
    
    // Achievements pentru probleme rezolvate - Milestones
    if (solvedCount >= 1) ach.push({ type: 'milestone', title: 'Prima problemă rezolvată', description: 'Ai rezolvat prima ta problemă!', color: '#10b981' });
    if (solvedCount >= 5) ach.push({ type: 'milestone', title: 'Rezolvător dedicat', description: 'Ai rezolvat 5 probleme!', color: '#3b82f6' });
    if (solvedCount >= 10) ach.push({ type: 'milestone', title: 'Maestru al rezolvării', description: 'Ai rezolvat 10 probleme!', color: '#ffd700' });
    if (solvedCount >= 25) ach.push({ type: 'milestone', title: 'Expert în rezolvări', description: 'Ai rezolvat 25 de probleme!', color: '#8b5cf6' });
    if (solvedCount >= 50) ach.push({ type: 'milestone', title: 'Legenda rezolvărilor', description: 'Ai rezolvat 50 de probleme!', color: '#ec4899' });
    if (solvedCount >= 100) ach.push({ type: 'milestone', title: 'Maestru suprem', description: 'Ai rezolvat 100 de probleme!', color: '#f59e0b' });
    
    // Achievements pentru probleme adăugate - Milestones
    const addedCount = userProblems.filter(p => p.createdByAlias === alias).length;
    if (addedCount >= 1) ach.push({ type: 'milestone', title: 'Începător în fizică', description: 'Ai adăugat prima ta problemă!', color: '#b0b0b0' });
    if (addedCount >= 5) ach.push({ type: 'milestone', title: 'Avansat', description: 'Ai adăugat 5 probleme!', color: '#4a90e2' });
    if (addedCount >= 10) ach.push({ type: 'milestone', title: 'Maestru', description: 'Ai adăugat 10 probleme!', color: '#ffd700' });
    if (addedCount >= 25) ach.push({ type: 'milestone', title: 'Creator prolific', description: 'Ai adăugat 25 de probleme!', color: '#8b5cf6' });
    if (addedCount >= 50) ach.push({ type: 'milestone', title: 'Arhitect al problemelor', description: 'Ai adăugat 50 de probleme!', color: '#ec4899' });
    
    // Achievements bazate pe scor
    if (perfectScores >= 1) ach.push({ type: 'milestone', title: 'Scor perfect', description: 'Ai obținut scor maxim la o problemă!', color: '#10b981' });
    if (perfectScores >= 5) ach.push({ type: 'milestone', title: 'Perfecționist', description: 'Ai obținut scor maxim la 5 probleme!', color: '#3b82f6' });
    if (perfectScores >= 10) ach.push({ type: 'milestone', title: 'Maestru al perfecțiunii', description: 'Ai obținut scor maxim la 10 probleme!', color: '#ffd700' });
    if (averageScore >= 90 && solvedCount >= 5) ach.push({ type: 'milestone', title: 'Excelență academică', description: 'Ai un scor mediu de peste 90%!', color: '#8b5cf6' });
    if (averageScore >= 95 && solvedCount >= 10) ach.push({ type: 'milestone', title: 'Geniu al fizicii', description: 'Ai un scor mediu de peste 95%!', color: '#ec4899' });
    if (averageScore === 100 && solvedCount >= 5) ach.push({ type: 'milestone', title: 'Perfecțiune absolută', description: 'Ai un scor mediu de 100%!', color: '#f59e0b' });
    
    // Achievements pentru simulări
    if (simulationsVisited.length >= 1) ach.push({ type: 'milestone', title: 'Prima simulare', description: 'Ai accesat prima simulare!', color: '#14b8a6', icon: '🧪' });
    if (simulationsVisited.length >= 5) ach.push({ type: 'milestone', title: 'Explorator de simulări', description: 'Ai accesat 5 simulări!', color: '#0d9488' });
    if (simulationsVisited.length >= 10) ach.push({ type: 'milestone', title: 'Maestru al simulărilor', description: 'Ai accesat 10 simulări!', color: '#0f766e' });
    
    return ach;
  };

  // Verifică dacă un achievement există deja
  const achievementExists = (newAchievement, existingAchievements) => {
    return existingAchievements.some(
      existing => existing.title === newAchievement.title && existing.type === newAchievement.type
    );
  };

  // Șterge toate achievement-urile
  const clearAllAchievements = async () => {
    if (!user?.uid) {
      throw new Error('User must be authenticated to clear achievements');
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { achievements: [] });
      
      setAchievements([]);
      setNewAchievements([]);
      
      return true;
    } catch (error) {
      console.error('Error clearing achievements:', error);
      throw error;
    }
  };

  // Șterge notificările de achievement-uri noi
  const clearNewAchievements = () => {
    setNewAchievements([]);
  };

  return {
    achievements,
    loading,
    user,
    isAuthenticated: !!user,
    newAchievements,
    checkAchievements,
    loadAchievements,
    clearAllAchievements,
    clearNewAchievements
  };
};

