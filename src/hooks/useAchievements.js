import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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

  // Verifică dacă un achievement există deja
  const achievementExists = (newAchievement, existingAchievements) => {
    return existingAchievements.some(
      existing => existing.title === newAchievement.title && existing.type === newAchievement.type
    );
  };

  // Salvează achievement-uri noi în Firebase
  const saveAchievements = async (newAchievementsList) => {
    if (!user?.uid || !newAchievementsList || newAchievementsList.length === 0) {
      return { saved: [], new: [] };
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      
      let existingAchievements = [];
      if (snap.exists() && snap.data().achievements) {
        existingAchievements = snap.data().achievements;
      }

      // Filtrează achievement-urile noi (care nu există deja)
      const trulyNewAchievements = newAchievementsList.filter(
        newAch => !achievementExists(newAch, existingAchievements)
      );

      if (trulyNewAchievements.length === 0) {
        // Nu sunt achievement-uri noi, dar actualizează lista completă
        const allAchievements = [...existingAchievements];
        // Adaugă achievement-urile care nu sunt încă în listă (pentru sincronizare)
        newAchievementsList.forEach(newAch => {
          if (!achievementExists(newAch, allAchievements)) {
            allAchievements.push(newAch);
          }
        });
        
        if (allAchievements.length !== existingAchievements.length) {
          await updateDoc(userRef, { achievements: allAchievements });
          setAchievements(allAchievements);
        }
        return { saved: allAchievements, new: [] };
      }

      // Adaugă achievement-urile noi
      const updatedAchievements = [...existingAchievements, ...trulyNewAchievements];
      
      // Salvează în Firebase
      await updateDoc(userRef, { achievements: updatedAchievements });
      
      // Actualizează state-ul local
      setAchievements(updatedAchievements);
      
      // Setează achievement-urile noi pentru notificare
      setNewAchievements(trulyNewAchievements);
      
      // Șterge notificările după 5 secunde
      setTimeout(() => {
        setNewAchievements([]);
      }, 5000);

      return { saved: updatedAchievements, new: trulyNewAchievements };
    } catch (error) {
      console.error('Error saving achievements:', error);
      throw error;
    }
  };

  // Actualizează achievement-urile (recalculează și salvează)
  const updateAchievements = async (calculatedAchievements) => {
    if (!user?.uid) return { saved: [], new: [] };

    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      
      let existingAchievements = [];
      if (snap.exists() && snap.data().achievements) {
        existingAchievements = snap.data().achievements;
      }

      // Identifică achievement-urile noi
      const newAchievementsList = calculatedAchievements.filter(
        newAch => !achievementExists(newAch, existingAchievements)
      );

      // Creează lista finală (păstrează achievement-urile existente și adaugă pe cele noi)
      // Pentru milestone-uri, înlocuim pe cele vechi cu cele noi (pentru a actualiza descrierile)
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

      // Salvează în Firebase
      await updateDoc(userRef, { achievements: uniqueAchievements });
      
      // Actualizează state-ul local
      setAchievements(uniqueAchievements);
      
      // Setează achievement-urile noi pentru notificare
      if (newAchievementsList.length > 0) {
        setNewAchievements(newAchievementsList);
        
        // Șterge notificările după 5 secunde
        setTimeout(() => {
          setNewAchievements([]);
        }, 5000);
      }

      return { saved: uniqueAchievements, new: newAchievementsList };
    } catch (error) {
      console.error('Error updating achievements:', error);
      throw error;
    }
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

  // Încarcă achievement-urile când se schimbă utilizatorul
  useEffect(() => {
    if (user?.uid) {
      loadAchievements();
    } else {
      setAchievements([]);
      setNewAchievements([]);
    }
  }, [user?.uid]);

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
    saveAchievements,
    updateAchievements,
    loadAchievements,
    clearAllAchievements,
    clearNewAchievements
  };
};

