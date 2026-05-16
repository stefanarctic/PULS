import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Pure helpers — kept outside the hook so useCallback deps stay stable
const calculateAchievements = (solvedProblems, simulationsVisited, userProblems, alias) => {
  const ach = [];

  const solvedCount = solvedProblems.length;
  const perfectScores = solvedProblems.filter(
    (p) => p.scoreObtained === p.maxScore && p.maxScore > 0
  ).length;

  const totalScore = solvedProblems.reduce((total, p) => total + (p.scoreObtained || 0), 0);
  const maxPossibleScore = solvedProblems.reduce((total, p) => total + (p.maxScore || 0), 0);
  const averageScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

  if (solvedCount >= 1) {
    ach.push({
      type: 'milestone',
      key: 'solved_first',
      title: 'Prima problemă rezolvată',
      description: 'Ai rezolvat prima ta problemă!',
      color: '#10b981',
    });
  }
  if (solvedCount >= 5) {
    ach.push({
      type: 'milestone',
      key: 'solved_5',
      title: 'Rezolvător dedicat',
      description: 'Ai rezolvat 5 probleme!',
      color: '#3b82f6',
    });
  }
  if (solvedCount >= 10) {
    ach.push({
      type: 'milestone',
      key: 'solved_10',
      title: 'Maestru al rezolvării',
      description: 'Ai rezolvat 10 probleme!',
      color: '#ffd700',
    });
  }
  if (solvedCount >= 25) {
    ach.push({
      type: 'milestone',
      key: 'solved_25',
      title: 'Expert în rezolvări',
      description: 'Ai rezolvat 25 de probleme!',
      color: '#8b5cf6',
    });
  }
  if (solvedCount >= 50) {
    ach.push({
      type: 'milestone',
      key: 'solved_50',
      title: 'Legenda rezolvărilor',
      description: 'Ai rezolvat 50 de probleme!',
      color: '#ec4899',
    });
  }
  if (solvedCount >= 100) {
    ach.push({
      type: 'milestone',
      key: 'solved_100',
      title: 'Maestru suprem',
      description: 'Ai rezolvat 100 de probleme!',
      color: '#f59e0b',
    });
  }

  const addedCount = userProblems.filter((p) => p.createdByAlias === alias).length;
  if (addedCount >= 1) {
    ach.push({
      type: 'milestone',
      key: 'added_first',
      title: 'Începător în fizică',
      description: 'Ai adăugat prima ta problemă!',
      color: '#b0b0b0',
    });
  }
  if (addedCount >= 5) {
    ach.push({
      type: 'milestone',
      key: 'added_5',
      title: 'Avansat',
      description: 'Ai adăugat 5 probleme!',
      color: '#4a90e2',
    });
  }
  if (addedCount >= 10) {
    ach.push({
      type: 'milestone',
      key: 'added_10',
      title: 'Maestru',
      description: 'Ai adăugat 10 probleme!',
      color: '#ffd700',
    });
  }
  if (addedCount >= 25) {
    ach.push({
      type: 'milestone',
      key: 'added_25',
      title: 'Creator prolific',
      description: 'Ai adăugat 25 de probleme!',
      color: '#8b5cf6',
    });
  }
  if (addedCount >= 50) {
    ach.push({
      type: 'milestone',
      key: 'added_50',
      title: 'Arhitect al problemelor',
      description: 'Ai adăugat 50 de probleme!',
      color: '#ec4899',
    });
  }

  if (perfectScores >= 1) {
    ach.push({
      type: 'milestone',
      key: 'perfect_1',
      title: 'Scor perfect',
      description: 'Ai obținut scor maxim la o problemă!',
      color: '#10b981',
    });
  }
  if (perfectScores >= 5) {
    ach.push({
      type: 'milestone',
      key: 'perfect_5',
      title: 'Perfecționist',
      description: 'Ai obținut scor maxim la 5 probleme!',
      color: '#3b82f6',
    });
  }
  if (perfectScores >= 10) {
    ach.push({
      type: 'milestone',
      key: 'perfect_10',
      title: 'Maestru al perfecțiunii',
      description: 'Ai obținut scor maxim la 10 probleme!',
      color: '#ffd700',
    });
  }
  if (averageScore >= 90 && solvedCount >= 5) {
    ach.push({
      type: 'milestone',
      key: 'avg_90',
      title: 'Excelență academică',
      description: 'Ai un scor mediu de peste 90%!',
      color: '#8b5cf6',
    });
  }
  if (averageScore >= 95 && solvedCount >= 10) {
    ach.push({
      type: 'milestone',
      key: 'avg_95',
      title: 'Geniu al fizicii',
      description: 'Ai un scor mediu de peste 95%!',
      color: '#ec4899',
    });
  }
  if (averageScore === 100 && solvedCount >= 5) {
    ach.push({
      type: 'milestone',
      key: 'avg_100',
      title: 'Perfecțiune absolută',
      description: 'Ai un scor mediu de 100%!',
      color: '#f59e0b',
    });
  }

  if (simulationsVisited.length >= 1) {
    ach.push({
      type: 'milestone',
      key: 'sim_first',
      title: 'Prima simulare',
      description: 'Ai accesat prima simulare!',
      color: '#14b8a6',
      icon: '🧪',
    });
  }
  if (simulationsVisited.length >= 5) {
    ach.push({
      type: 'milestone',
      key: 'sim_5',
      title: 'Explorator de simulări',
      description: 'Ai accesat 5 simulări!',
      color: '#0d9488',
    });
  }
  if (simulationsVisited.length >= 10) {
    ach.push({
      type: 'milestone',
      key: 'sim_10',
      title: 'Maestru al simulărilor',
      description: 'Ai accesat 10 simulări!',
      color: '#0f766e',
    });
  }

  return ach;
};

const achievementExists = (newAchievement, existingAchievements) => {
  return existingAchievements.some((existing) => {
    if (existing.type !== newAchievement.type) return false;
    if (newAchievement.key && existing.key) return existing.key === newAchievement.key;
    return existing.title === newAchievement.title;
  });
};

// Shared across all useAchievements() instances so solve/simulation/profile share one cache per uid
let userProblemsModuleCache = { uid: null, problems: null };

export const useAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      userProblemsModuleCache = { uid: null, problems: null };
    }
  }, [user?.uid]);

  const loadAchievements = useCallback(async () => {
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
  }, [user?.uid]);

  const checkAchievements = useCallback(
    async (userData = {}) => {
      if (!user?.uid) return { saved: [], new: [] };

      try {
        const userRef = doc(db, 'users', user.uid);
        let userDoc;

        if (userData.preloadedUserData != null) {
          userDoc = userData.preloadedUserData;
        } else {
          const snap = await getDoc(userRef);

          if (!snap.exists()) {
            return { saved: [], new: [] };
          }

          userDoc = snap.data();
        }

        const existingAchievements = userDoc.achievements || [];

        const solvedProblems = userData.solvedProblems || userDoc.solvedProblems || [];
        const simulationsVisited = userData.simulationsVisited || userDoc.simulationsVisited || [];
        const alias = userData.alias || userDoc.alias || '';

        let userProblems = userData.userProblems;
        if (userProblems != null) {
          userProblemsModuleCache = { uid: user.uid, problems: userProblems };
        } else {
          const cache = userProblemsModuleCache;
          if (cache.uid === user.uid && cache.problems != null) {
            userProblems = cache.problems;
          } else {
            try {
              const userProblemsRef = collection(db, 'users', user.uid, 'userProblems');
              const querySnapshot = await getDocs(userProblemsRef);
              userProblems = querySnapshot.docs.map((d) => d.data());
              userProblemsModuleCache = { uid: user.uid, problems: userProblems };
            } catch (error) {
              console.error('Error loading user problems:', error);
              userProblems = [];
            }
          }
        }

        const calculatedAchievements = calculateAchievements(
          solvedProblems,
          simulationsVisited,
          userProblems,
          alias
        );

        const newAchievementsList = calculatedAchievements.filter(
          (newAch) => !achievementExists(newAch, existingAchievements)
        );

        const milestoneTitles = new Set(
          calculatedAchievements.filter((a) => a.type === 'milestone').map((a) => a.title)
        );
        const milestoneKeys = new Set(
          calculatedAchievements.filter((a) => a.type === 'milestone' && a.key).map((a) => a.key)
        );

        const finalAchievements = [
          ...existingAchievements.filter(
            (existing) =>
              existing.type !== 'milestone' ||
              milestoneTitles.has(existing.title) ||
              (existing.key && milestoneKeys.has(existing.key))
          ),
          ...calculatedAchievements
        ];

        const uniqueAchievements = [];
        const seen = new Set();
        for (let i = finalAchievements.length - 1; i >= 0; i--) {
          const a = finalAchievements[i];
          const dedupeKey =
            a.type === 'milestone' ? `milestone:${a.key || a.title}` : `${a.type}-${a.title}`;
          if (!seen.has(dedupeKey)) {
            seen.add(dedupeKey);
            uniqueAchievements.unshift(a);
          }
        }

        if (newAchievementsList.length > 0) {
          await updateDoc(userRef, { achievements: uniqueAchievements });
          setAchievements(uniqueAchievements);
          setNewAchievements(newAchievementsList);

          setTimeout(() => {
            setNewAchievements([]);
          }, 5000);
        }

        return { saved: uniqueAchievements, new: newAchievementsList };
      } catch (error) {
        console.error('Error checking achievements:', error);
        throw error;
      }
    },
    [user?.uid]
  );

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
