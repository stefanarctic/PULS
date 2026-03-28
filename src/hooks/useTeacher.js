import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export const useTeacher = () => {
  const [teacherStatus, setTeacherStatus] = useState('none');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          const status = userSnap.exists() ? (userSnap.data().teacherStatus || 'none') : 'none';
          setTeacherStatus(status);

          if (userSnap.exists() && status === 'approved') {
            const d = userSnap.data();
            if (!Array.isArray(d.ownedClasses)) {
              await updateDoc(userRef, { ownedClasses: [] });
            }
          }
        } catch (error) {
          console.error('Error checking teacher status:', error);
          setTeacherStatus('none');
        }
      } else {
        setTeacherStatus('none');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isApprovedTeacher = teacherStatus === 'approved';

  return { teacherStatus, isApprovedTeacher, loading, user };
};
