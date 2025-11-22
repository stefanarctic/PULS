import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../Layout';
import { auth, provider, db, storage, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { problemeData } from '../problemedata';
import { ProblemCard } from './Probleme.jsx';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import '../../scss/components/_probleme.scss';
import { Check } from 'lucide-react';
import RecentActivity from '../RecentActivity';
import Achievements from '../Achievements';
import Statistics from '../Statistics';
import AchievementNotification from '../AchievementNotification';
import { useSolvedProblems } from '../../hooks/useSolvedProblems';
import { useAchievements } from '../../hooks/useAchievements';
import { uploadToCloudinary } from '../../lib/cloudinary';

// FavoriteProblemCard definit aici
const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15,3 21,3 21,9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// FavoriteProblemCard cu stiluri îmbunătățite
const FavoriteProblemCard = ({ problem, onUnstar, onResolveClick, completionPercent }) => {
  const { index, titlu, dificultate, categorie, solved, createdByAlias } = problem;
  const isPerfectScore = completionPercent === 100;
  const getDifficultyColorClass = (diff) => {
    switch (diff) {
      case 'ușor':
      case 'usoare':
        return 'difficulty--usor';
      case 'mediu':
      case 'medii':
        return 'difficulty--mediu';
      case 'dificil':
      case 'dificile':
        return 'difficulty--dificil';
      case 'concurs':
      case 'concursuri':
        return 'difficulty--concurs';
      default:
        return '';
    }
  };
  return (
    <div className={`problem-card favorite-problem-card${(solved || isPerfectScore) ? ' solved' : ''}`} style={{ position: 'relative' }}>
      <div className="problem-card-actions">
        <button
          onClick={onUnstar}
          title="Elimină din favorite"
          className="problem-card-favorite-btn is-active"
          aria-label="Elimină din favorite"
        >
          ★
        </button>
        {isPerfectScore && (
          <div className="problem-card-perfect-badge" title="Ai obținut scorul maxim la această problemă">
            <span className="problem-card-perfect-icon" aria-hidden="true">
              <Check size={14} strokeWidth={3} />
            </span>
            <span className="problem-card-perfect-text">100%</span>
          </div>
        )}
      </div>
      {/* Autorul, ca la ProblemCard */}
      {createdByAlias && (
        <span style={{ 
          position: 'absolute', 
          top: 12, 
          right: 44, 
          fontSize: 12, 
          fontStyle: 'italic', 
          color: '#888', 
          zIndex: 2 
        }} title="Autor problemă">{createdByAlias}</span>
      )}
      <div className="problem-card-header">
        <div className="problem-card-info">
          <span className="problem-card-id">#{index}</span>
          <h3 className="problem-card-title">{titlu}</h3>
          <p className="problem-card-topic">{categorie}</p>
        </div>
        {solved && <div className="problem-card-solved-badge">Rezolvată</div>}
      </div>
      <div className="problem-card-footer">
        <div className={`problem-card-difficulty ${getDifficultyColorClass(dificultate)}`}>{dificultate}</div>
        <button
          className="problem-card-link"
          onClick={() => onResolveClick(problem)}
        >
          <span>Rezolvă</span>
          <ExternalLinkIcon />
        </button>
      </div>
    </div>
  );
};

const ADMIN_EMAILS = [
  'matbajean@gmail.com',
  'aleluianu09@gmail.com',
  'pulsphysics@gmail.com',
];

// Function to fix Google profile image URLs
const fixGoogleProfileImageUrl = (url) => {
    if (!url || !url.includes('googleusercontent.com')) {
        return url;
    }
    
    // For Google images, try the original URL first, then clean it up if needed
    // Remove any query parameters that might cause issues
    let cleanUrl = url.split('?')[0];
    
    // Remove existing size parameters
    cleanUrl = cleanUrl.replace(/=s\d+-c$/, '');
    
    // Add a reliable size parameter
    cleanUrl = cleanUrl + '=s96-c';
    
    return cleanUrl;
};

// Function to create a data URL fallback for Google images
const createFallbackAvatar = (name) => {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 96, 96);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    // Draw circle background
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(48, 48, 48, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.charAt(0).toUpperCase(), 48, 48);
    
    return canvas.toDataURL();
};

const normalizeFavoriteIds = (ids = []) => Array.from(new Set((ids || []).filter(id => id !== null && id !== undefined)));

const Profile = () => {
    const navigate = useNavigate();
    
    // Helper function to scroll to top
    const scrollToTop = () => {
        window.scrollTo({ top: 0 });
    };
    
    const [user, setUser] = useState(null);
    const [alias, setAlias] = useState('');
    const [aliasInput, setAliasInput] = useState('');
    const [aliasError, setAliasError] = useState('');
    const [name, setName] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [nameError, setNameError] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingAlias, setEditingAlias] = useState(false);
    const [activeTab, setActiveTab] = useState('activitate');
    const [showEditModal, setShowEditModal] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [profilePic, setProfilePic] = useState('');
    const [profilePicInput, setProfilePicInput] = useState('');
    const [description, setDescription] = useState('');
    const [descriptionInput, setDescriptionInput] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);

    const fileInputRef = React.useRef();
    const dispatch = useDispatch();
    const [selectedFavorite, setSelectedFavorite] = useState(null);
    const [activityLog, setActivityLog] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [favorites, setFavorites] = useState([]);
    const [userProblems, setUserProblems] = useState([]);
    const { solvedProblems, saveSolvedProblem, clearTestProblems, clearAllSolvedProblems } = useSolvedProblems();
    const { achievements, checkAchievements, loadAchievements, newAchievements, clearNewAchievements } = useAchievements();

    const solvedProblemsMap = useMemo(() => {
        return solvedProblems.reduce((acc, entry) => {
            if (!entry) return acc;
            const { problemId, scoreObtained, maxScore } = entry;
            if (!problemId || maxScore === 0 || maxScore === undefined || maxScore === null) return acc;
            const numericScore = Number(scoreObtained);
            const numericMax = Number(maxScore);
            if (!Number.isFinite(numericScore) || !Number.isFinite(numericMax) || numericMax <= 0) return acc;
            const percent = Math.min(100, Math.round((numericScore / numericMax) * 100));
            if (!Number.isFinite(percent)) return acc;
            const key = String(problemId);
            const current = acc[key] ?? 0;
            acc[key] = percent > current ? percent : current;
            return acc;
        }, {});
    }, [solvedProblems]);

    const getProblemCompletion = (problem) => {
        if (!problem) return null;
        const keys = [problem.id, problem.index];
        for (const key of keys) {
            if (key === undefined || key === null) continue;
            const percent = solvedProblemsMap[String(key)];
            if (typeof percent === 'number') {
                return percent;
            }
        }
        return null;
    };
    
    // Loading states for different operations
    const [userProblemsLoading, setUserProblemsLoading] = useState(false);
    const [profileSaveLoading, setProfileSaveLoading] = useState(false);
    const [profilePicUploadLoading, setProfilePicUploadLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [selectedImagePreview, setSelectedImagePreview] = useState(null);
    
    // Email/Password authentication states
    const [showEmailAuth, setShowEmailAuth] = useState(false);
    const [isSignUp, setIsSignUp] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [nameSignUp, setNameSignUp] = useState('');
    const [aliasSignUp, setAliasSignUp] = useState('');
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) {
                    // Extract name from email if displayName is not available
                    const defaultName = firebaseUser.displayName || 
                        (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Utilizator');
                    
                    await setDoc(userRef, {
                        name: defaultName,
                        email: firebaseUser.email,
                        alias: '',
                        joinedDate: new Date().toISOString(),
                        profilePic: firebaseUser.photoURL || '',
                        description: '',
                        isAdmin: ADMIN_EMAILS.includes(firebaseUser.email),
                    });
                    setAlias('');
                    setName(defaultName);
                    const profilePicUrl = firebaseUser.photoURL || '';
                    setProfilePic(fixGoogleProfileImageUrl(profilePicUrl));
                    setDescription('');
                    setIsAdmin(ADMIN_EMAILS.includes(firebaseUser.email));
                } else {
                    const userData = userSnap.data();
                    
                    setAlias(userData.alias || '');
                    setName(userData.name || firebaseUser.displayName || '');
                    const profilePicUrl = userData.profilePic || firebaseUser.photoURL || '';
                    setProfilePic(fixGoogleProfileImageUrl(profilePicUrl));
                    setDescription(userData.description || '');
                    setIsAdmin(userData.isAdmin || ADMIN_EMAILS.includes(firebaseUser.email));
                    setFavorites(normalizeFavoriteIds(userData.favorites || []));
                }
                setUser({
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Utilizator'),
                    email: firebaseUser.email,
                    joinedDate: userSnap.exists() ? userSnap.data().joinedDate : new Date().toISOString(),
                });
            } else {
                setUser(null);
                setAlias('');
                setName('');
                setProfilePic('');
                setDescription('');
                setIsAdmin(false);
                setFavorites([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user && user.uid) {
            const fetchUserProblems = async () => {
                setUserProblemsLoading(true);
                try {
                    const userProblemsRef = collection(db, 'users', user.uid, 'userProblems');
                    const querySnapshot = await getDocs(userProblemsRef);
                    const userProblemsList = querySnapshot.docs.map(doc => doc.data());
                    setUserProblems(userProblemsList);
                } catch (error) {
                    console.error('Error fetching user problems:', error);
                    setUserProblems([]);
                } finally {
                    setUserProblemsLoading(false);
                }
            };
            fetchUserProblems();
        }
    }, [user]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showEditModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            
            // Cleanup selected image when modal closes
            if (selectedImagePreview) {
                URL.revokeObjectURL(selectedImagePreview);
                setSelectedImagePreview(null);
            }
            setSelectedImageFile(null);
            setProfilePicInput('');
        }

        // Cleanup function to restore scroll when component unmounts
        return () => {
            document.body.style.overflow = 'unset';
            if (selectedImagePreview) {
                URL.revokeObjectURL(selectedImagePreview);
            }
        };
    }, [showEditModal, selectedImagePreview]);

    // Get problems from Redux store
    const problemsFromStore = useSelector(state => state.problems.value);

    const combinedProblemsMap = useMemo(() => {
        const map = new Map();
        const addProblems = (list = []) => {
            list.forEach(problem => {
                if (!problem || !problem.id) return;
                const existing = map.get(problem.id) || {};
                map.set(problem.id, { ...existing, ...problem });
            });
        };
        addProblems(problemeData);
        addProblems(problemsFromStore);
        addProblems(userProblems);
        return map;
    }, [problemsFromStore, userProblems]);

    const allProblems = useMemo(() => Array.from(combinedProblemsMap.values()), [combinedProblemsMap]);

    const favoriteIds = useMemo(() => normalizeFavoriteIds(favorites || []), [favorites]);

    const favoriteProblems = useMemo(() => (
        favoriteIds
            .map(id => combinedProblemsMap.get(id))
            .filter(problem => Boolean(problem && problem.id))
    ), [favoriteIds, combinedProblemsMap]);

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
            
            // Verifică dacă utilizatorul este deja autentificat cu email/password
            if (user && user.providerData && user.providerData.length > 0) {
                const hasEmailProvider = user.providerData.some(provider => provider.providerId === 'password');
                if (hasEmailProvider) {
                    // Utilizatorul are deja un cont cu email/password
                    // Nu afișăm alertă pentru că utilizatorul este deja autentificat
                    return;
                }
            }
            
            // Gestionăm erorile specifice Firebase
            switch (error.code) {
                case 'auth/account-exists-with-different-credential':
                    // Există deja un cont cu acest email creat cu email/password
                    // Nu afișăm alertă pentru utilizatorii care au deja conturi email/password
                    // Acest caz este gestionat automat de Firebase
                    return;
                case 'auth/popup-closed-by-user':
                case 'auth/cancelled-popup-request':
                    // Utilizatorul a închis popup-ul - nu afișăm eroare
                    return;
                case 'auth/popup-blocked':
                    alert('Popup-ul a fost blocat de browser. Te rugăm să permiți popup-urile pentru acest site.');
                    return;
                case 'auth/network-request-failed':
                    alert('Eroare de rețea. Te rugăm să verifici conexiunea la internet.');
                    return;
                default:
                    // Pentru alte erori, afișăm mesajul generic doar dacă nu este o eroare de anulare
                    if (error.code && !error.code.includes('cancelled') && !error.code.includes('popup-closed')) {
                        alert('Eroare la autentificare cu Google. Te rugăm să încerci din nou.');
                    }
                    return;
            }
        }
    };

    const handleEmailSignUp = async (e) => {
        e?.preventDefault();
        setAuthError('');
        setAuthLoading(true);

        // Validation
        if (isSignUp) {
            if (!email || !password || !nameSignUp || !aliasSignUp) {
                setAuthError('Te rog completează toate câmpurile.');
                setAuthLoading(false);
                return;
            }

            // Validate name
            const trimmedName = nameSignUp.trim();
            if (trimmedName.length < 2) {
                setAuthError('Numele trebuie să aibă cel puțin 2 caractere.');
                setAuthLoading(false);
                return;
            }
            if (trimmedName.length > 50) {
                setAuthError('Numele nu poate avea mai mult de 50 de caractere.');
                setAuthLoading(false);
                return;
            }

            // Validate alias
            const trimmedAlias = aliasSignUp.trim();
            if (trimmedAlias.length < 3) {
                setAuthError('Aliasul trebuie să aibă cel puțin 3 caractere.');
                setAuthLoading(false);
                return;
            }

            // Check if alias is unique
            try {
                const q = query(collection(db, 'users'), where('alias', '==', trimmedAlias));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    setAuthError('Aliasul este deja folosit. Te rog alege altul.');
                    setAuthLoading(false);
                    return;
                }
            } catch (error) {
                console.error('Error checking alias uniqueness:', error);
                // Continue with signup even if check fails
            }
        } else {
            if (!email || !password) {
                setAuthError('Te rog completează toate câmpurile.');
                setAuthLoading(false);
                return;
            }
        }

        if (password.length < 6) {
            setAuthError('Parola trebuie să aibă cel puțin 6 caractere.');
            setAuthLoading(false);
            return;
        }

        if (isSignUp && password !== confirmPassword) {
            setAuthError('Parolele nu se potrivesc.');
            setAuthLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                // Sign up
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Create user document with name and alias
                const userRef = doc(db, 'users', userCredential.user.uid);
                await setDoc(userRef, {
                    name: nameSignUp.trim(),
                    email: userCredential.user.email,
                    alias: aliasSignUp.trim(),
                    joinedDate: new Date().toISOString(),
                    profilePic: '',
                    description: '',
                    isAdmin: ADMIN_EMAILS.includes(userCredential.user.email),
                });
            } else {
                // Sign in
                await signInWithEmailAndPassword(auth, email, password);
            }
            // Reset form
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setNameSignUp('');
            setAliasSignUp('');
            setShowEmailAuth(false);
            scrollToTop();
        } catch (error) {
            let errorMessage = 'Eroare la autentificare.';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Acest email este deja înregistrat.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Adresa de email nu este validă.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Parola este prea slabă.';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Nu există un cont cu acest email.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Parolă incorectă.';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Email sau parolă incorectă.';
                    break;
                default:
                    errorMessage = error.message || 'Eroare la autentificare.';
            }
            setAuthError(errorMessage);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    // Funcția saveSolvedProblem este acum din hook-ul useSolvedProblems

    // Expune funcțiile de test pentru dezvoltare
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Funcție de test pentru a adăuga probleme rezolvate (doar pentru dezvoltare)
            window.addTestSolvedProblems = async () => {
                const testProblems = [
                    { problemId: 1, scoreObtained: 8, maxScore: 10 },
                    { problemId: 2, scoreObtained: 7, maxScore: 10 },
                    { problemId: 3, scoreObtained: 9, maxScore: 10 },
                ];
                
                for (const problem of testProblems) {
                    await saveSolvedProblem(problem.problemId, problem.scoreObtained, problem.maxScore);
                }
                
                alert('Probleme de test adăugate!');
            };

            // Funcție pentru a șterge problemele de test din database
            window.clearTestSolvedProblems = async () => {
                try {
                    const deletedCount = await clearTestProblems();
                    alert(`Șterse ${deletedCount} probleme de test!`);
                } catch (error) {
                    console.error('Error clearing test problems:', error);
                    alert('Eroare la ștergerea problemelor de test!');
                }
            };

            // Funcție pentru a șterge toate problemele rezolvate
            window.clearAllSolvedProblems = async () => {
                const confirmed = confirm('Ești sigur că vrei să ștergi TOATE problemele rezolvate? Această acțiune nu poate fi anulată!');
                if (!confirmed) return;

                try {
                    await clearAllSolvedProblems();
                    alert('Toate problemele rezolvate au fost șterse!');
                } catch (error) {
                    console.error('Error clearing all solved problems:', error);
                    alert('Eroare la ștergerea problemelor!');
                }
            };
        }
    }, [saveSolvedProblem, clearTestProblems, clearAllSolvedProblems]);

    const checkAliasUnique = async (aliasToCheck) => {
        const q = query(collection(db, 'users'), where('alias', '==', aliasToCheck));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty || (querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === user.uid);
    };

    const handleProfileSave = async () => {
        console.log("user in handleProfileSave", user);
        console.log("user.uid", user?.uid);
        console.log("nameInput", nameInput);
        console.log("aliasInput", aliasInput);
        console.log("profilePicInput", profilePicInput);
        console.log("descriptionInput", descriptionInput);
        setAliasError('');
        setNameError('');
        setDescriptionError('');
        setSaveError('');
        setProfileSaveLoading(true);
        
        try {
            const trimmedName = nameInput.trim();
            const trimmedAlias = aliasInput.trim();
            const trimmedDescription = descriptionInput.trim();
            
            // Validate name
            if (!trimmedName) {
                setNameError('Numele nu poate fi gol.');
                return;
            }
            if (trimmedName.length < 2) {
                setNameError('Numele trebuie să aibă cel puțin 2 caractere.');
                return;
            }
            if (trimmedName.length > 50) {
                setNameError('Numele nu poate avea mai mult de 50 de caractere.');
                return;
            }
            
            // Validate alias
            if (!trimmedAlias) {
                setAliasError('Aliasul nu poate fi gol.');
                return;
            }
            if (trimmedAlias.length < 3) {
                setAliasError('Aliasul trebuie să aibă cel puțin 3 caractere.');
                return;
            }
            const isUnique = await checkAliasUnique(trimmedAlias);
            if (!isUnique) {
                setAliasError('Aliasul este deja folosit.');
                return;
            }
            
            // Validate description
            if (trimmedDescription.length > 200) {
                setDescriptionError('Descrierea nu poate avea mai mult de 200 de caractere.');
                return;
            }
            
            let finalProfilePicUrl = profilePic; // Folosește imaginea existentă implicit
            
            // Dacă există o imagine nouă selectată, uploadează-o la Cloudinary
            if (selectedImageFile) {
                console.log('Uploading image to Cloudinary...');
                setProfilePicUploadLoading(true);
                
                try {
                    // Upload la Cloudinary
                    const cloudinaryUrl = await uploadToCloudinary(selectedImageFile);
                    finalProfilePicUrl = cloudinaryUrl;
                    console.log('Imagine încărcată cu succes la Cloudinary:', cloudinaryUrl);
                } catch (uploadError) {
                    console.error('Eroare la upload imagine:', uploadError);
                    alert('Eroare la încărcarea imaginii. Profilul va fi salvat fără imaginea nouă.');
                    // Continuă cu salvarea profilului fără imaginea nouă
                } finally {
                    setProfilePicUploadLoading(false);
                }
            }
            
            // Salvează profilul în Firebase
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, { 
                name: trimmedName,
                alias: trimmedAlias, 
                profilePic: finalProfilePicUrl, 
                description: trimmedDescription 
            }, { merge: true });
            
            // Actualizează state-ul local
            setName(trimmedName);
            setAlias(trimmedAlias);
            setProfilePic(finalProfilePicUrl);
            setDescription(trimmedDescription);
            
            // Curăță state-urile pentru imagine
            if (selectedImageFile) {
                setSelectedImageFile(null);
                setSelectedImagePreview(null);
                setProfilePicInput('');
            }
            
            setShowEditModal(false);
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 3000);
            
        } catch (error) {
            console.error('Error saving profile:', error);
            setSaveError('Eroare la salvarea profilului. Te rugăm să încerci din nou.');
        } finally {
            setProfileSaveLoading(false);
        }
    };



    const handleProfilePicUpload = async (file) => {
        if (!file) return;

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            alert('Fișierul este prea mare! Dimensiunea maximă permisă este 5MB.');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Te rog selectează doar fișiere de tip imagine (JPG, PNG, GIF, etc.).');
            return;
        }

        try {
            // Salvează imaginea local și creează preview
            setSelectedImageFile(file);
            
            // Creează URL pentru preview
            const previewUrl = URL.createObjectURL(file);
            setSelectedImagePreview(previewUrl);
            
            // Actualizează input-ul cu numele fișierului (pentru referință)
            setProfilePicInput(file.name);
            
            console.log('Imagine selectată local:', file.name, 'Size:', file.size);
            
        } catch (err) {
            console.error('Eroare la procesarea imaginii:', err);
            alert('Eroare la procesarea imaginii. Te rog încearcă din nou.');
        }
    };

    // Drag & drop, click și paste handlers
    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleProfilePicUpload(file);
        }
    };
    const handlePaste = (e) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                handleProfilePicUpload(file);
                break;
            }
        }
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            handleProfilePicUpload(file);
        }
    };
    const handleDropzoneClick = () => {
        fileInputRef.current.click();
    };

    // UI helpers
    const getDifficultyClass = (difficulty) => {
        switch (difficulty) {
            case 'ușor': return 'difficulty-easy';
            case 'mediu': return 'difficulty-medium';
            case 'dificil': return 'difficulty-hard';
            default: return '';
        }
    };
    const getResultClass = (result) => {
        if (result === 'Corect') return 'result-correct';
        if (result === 'Parțial corect') return 'result-partial';
        return 'result-incorrect';
    };
    const getActivityIcon = (type) => {
        switch (type) {
            case 'problem': return '📚';
            case 'simulation': return '⚙️';
            case 'resource': return '📄';
            default: return '📝';
        }
    };

    // Construiește activityLog și statisticile (fără achievements)
    useEffect(() => {
        if (!user || !user.uid) return;
        
        // Probleme adăugate de utilizator
        const addedProblems = userProblems.filter(p => p.createdByAlias === alias);
        
        // Construim activityLog - filtrează problemele care nu există
        const allAvailableProblems = allProblems;
        const addedProblemsFiltered = addedProblems.filter(p => 
            allAvailableProblems.some(ap => String(ap.id) === String(p.id))
        );
        
        // Procesăm problemele rezolvate cu scorurile lor (din hook)
        const solvedActivities = solvedProblems.map(solvedProblem => {
            const originalProblem = allAvailableProblems.find(p => String(p.id) === String(solvedProblem.problemId));
            
            // Folosește titlul personalizat dacă există, altfel caută în problemele existente
            let problemTitle = solvedProblem.customTitle;
            if (!problemTitle) {
                problemTitle = originalProblem ? originalProblem.titlu : `Problema ${solvedProblem.problemId}`;
            }
            
            // Extragem index-ul problemei pentru navigare (ruta folosește index-ul)
            const problemIndex = originalProblem ? originalProblem.index : null;
            
            return {
                type: 'problem_solved',
                title: problemTitle,
                date: solvedProblem.solvedAt,
                link: solvedProblem.problemId.startsWith('submitted_') ? null : `/probleme/${problemIndex || solvedProblem.problemId}`,
                problemIndex: problemIndex,
                score: {
                    scoreObtained: solvedProblem.scoreObtained,
                    maxScore: solvedProblem.maxScore
                }
            };
        });
        
        const activity = [
            ...solvedActivities,
            ...addedProblemsFiltered.map(p => {
                const originalProblem = allAvailableProblems.find(ap => String(ap.id) === String(p.id));
                const problemIndex = originalProblem ? originalProblem.index : null;
                return { 
                    type: 'problem_added', 
                    title: p.titlu, 
                    date: p.createdAt || '', 
                    link: p.id ? `/probleme/${problemIndex || p.id}` : undefined,
                    problemIndex: problemIndex
                };
            }),
        ].sort((a, b) => new Date(b.date) - new Date(a.date));
        setActivityLog(activity);
        
        // Statistici pentru probleme rezolvate și adăugate
        const stats = { 
            dificultate: {}, 
            categorie: {},
            solvedProblems: solvedActivities.length,
            totalScore: solvedActivities.reduce((total, activity) => total + activity.score.scoreObtained, 0),
            maxPossibleScore: solvedActivities.reduce((total, activity) => total + activity.score.maxScore, 0)
        };
        
        // Statistici pentru probleme adăugate
        addedProblems.forEach(p => {
            if (p.dificultate) stats.dificultate[p.dificultate] = (stats.dificultate[p.dificultate] || 0) + 1;
            if (p.categorie) stats.categorie[p.categorie] = (stats.categorie[p.categorie] || 0) + 1;
        });
        setStatistics(stats);
    }, [user, userProblems, alias, allProblems, solvedProblems]);

    // Încarcă achievements când se deschide tab-ul de realizări
    useEffect(() => {
        if (activeTab === 'realizari' && user?.uid) {
            loadAchievements();
        }
    }, [activeTab, user?.uid, loadAchievements]);

    if (loading) {
        return (
            <Layout>
                <div className="profile-container">
                    <div className="loading-container">
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <h3>Se încarcă profilul...</h3>
                            <p>Te rugăm să aștepți în timp ce se procesează datele.</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout>
                <div className={`profile-container profile-login-center ${showEmailAuth && isSignUp ? 'profile-login-center-signup' : ''}`}>
                    <h2 className="profile-title">Profil</h2>
                    
                    {!showEmailAuth ? (
                        <div className="profile-auth-container">
                            <div className="profile-login-btns">
                                <button className="profile-btn-big profile-btn-google" onClick={handleGoogleLogin}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '10px' }}>
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Autentifică-te cu Google
                                </button>
                                <div className="profile-auth-divider">
                                    <span>sau</span>
                                </div>
                                <div className="profile-email-options">
                                    <button 
                                        className="profile-btn-big profile-btn-blue" 
                                        onClick={() => {
                                            setShowEmailAuth(true);
                                            setIsSignUp(true);
                                            setAuthError('');
                                            setEmail('');
                                            setPassword('');
                                            setConfirmPassword('');
                                            setNameSignUp('');
                                            setAliasSignUp('');
                                            scrollToTop();
                                        }}
                                    >
                                        Creează cont cu email
                                    </button>
                                    <button 
                                        className="profile-btn-big profile-btn-outline" 
                                        onClick={() => {
                                            setShowEmailAuth(true);
                                            setIsSignUp(false);
                                            setAuthError('');
                                            setEmail('');
                                            setPassword('');
                                            setConfirmPassword('');
                                            setNameSignUp('');
                                            setAliasSignUp('');
                                            scrollToTop();
                                        }}
                                    >
                                        Autentifică-te cu email
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={`profile-email-auth-form ${isSignUp ? 'profile-email-auth-form--signup' : ''}`}>
                            <h3 className="profile-email-auth-title">
                                {isSignUp ? 'Creează un cont nou' : 'Autentifică-te'}
                            </h3>
                            
                            <form onSubmit={handleEmailSignUp}>
                                <div className="profile-email-auth-field">
                                    <label htmlFor="email">Email:</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setAuthError('');
                                        }}
                                        placeholder="introdu@email.com"
                                        required
                                        disabled={authLoading}
                                    />
                                </div>
                                
                                {isSignUp && (
                                    <>
                                        <div className="profile-email-auth-field">
                                            <label htmlFor="nameSignUp">Nume:</label>
                                            <input
                                                id="nameSignUp"
                                                type="text"
                                                value={nameSignUp}
                                                onChange={(e) => {
                                                    setNameSignUp(e.target.value);
                                                    setAuthError('');
                                                }}
                                                placeholder="Introdu numele tău"
                                                required
                                                disabled={authLoading}
                                                minLength={2}
                                                maxLength={50}
                                            />
                                        </div>
                                        
                                        <div className="profile-email-auth-field">
                                            <label htmlFor="aliasSignUp">Alias:</label>
                                            <input
                                                id="aliasSignUp"
                                                type="text"
                                                value={aliasSignUp}
                                                onChange={(e) => {
                                                    setAliasSignUp(e.target.value);
                                                    setAuthError('');
                                                }}
                                                placeholder="Alege un alias unic"
                                                required
                                                disabled={authLoading}
                                                minLength={3}
                                            />
                                        </div>
                                    </>
                                )}
                                
                                <div className="profile-email-auth-field">
                                    <label htmlFor="password">Parolă:</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setAuthError('');
                                        }}
                                        placeholder="Minim 6 caractere"
                                        required
                                        disabled={authLoading}
                                        minLength={6}
                                    />
                                </div>
                                
                                {isSignUp && (
                                    <div className="profile-email-auth-field">
                                        <label htmlFor="confirmPassword">Confirmă parola:</label>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setAuthError('');
                                            }}
                                            placeholder="Repetă parola"
                                            required
                                            disabled={authLoading}
                                            minLength={6}
                                        />
                                    </div>
                                )}
                                
                                {authError && (
                                    <div className="profile-auth-error">
                                        {authError}
                                    </div>
                                )}
                                
                                <div className="profile-email-auth-actions">
                                    <button 
                                        type="submit" 
                                        className="profile-btn profile-btn-blue"
                                        disabled={authLoading}
                                    >
                                        {authLoading ? 'Se procesează...' : (isSignUp ? 'Creează cont' : 'Autentifică-te')}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="profile-btn profile-btn-red"
                                        onClick={() => {
                                            setShowEmailAuth(false);
                                            setEmail('');
                                            setPassword('');
                                            setConfirmPassword('');
                                            setAuthError('');
                                            scrollToTop();
                                        }}
                                        disabled={authLoading}
                                    >
                                        Anulează
                                    </button>
                                </div>
                                
                                <div className="profile-email-auth-switch">
                                    {isSignUp ? (
                                        <span>
                                            Ai deja cont?{' '}
                                            <button 
                                                type="button"
                                                className="profile-auth-link"
                                                onClick={() => {
                                                    setIsSignUp(false);
                                                    setAuthError('');
                                                    setNameSignUp('');
                                                    setAliasSignUp('');
                                                    setConfirmPassword('');
                                                    scrollToTop();
                                                }}
                                            >
                                                Autentifică-te
                                            </button>
                                        </span>
                                    ) : (
                                        <span>
                                            Nu ai cont?{' '}
                                            <button 
                                                type="button"
                                                className="profile-auth-link"
                                                onClick={() => {
                                                    setIsSignUp(true);
                                                    setAuthError('');
                                                    scrollToTop();
                                                }}
                                            >
                                                Creează unul
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </Layout>
        );
    }


    return (
        <Layout>
            <AchievementNotification 
                achievements={newAchievements} 
                onClose={clearNewAchievements} 
            />
            <div className="page-section profile-container">
                <div className="profile-header">
                    <div className="profile-header-content">
                        <div className="profile-avatar">
                            {profilePic && profilePic.trim() !== '' ? (
                                <img 
                                    src={profilePic} 
                                    alt="avatar" 
                                    className="profile-avatar-img"
                                    {...(profilePic.includes('googleusercontent.com') && { crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' })}
                                    onError={(e) => {
                                        console.error('Avatar image failed to load:', profilePic);
                                        
                                        // Create fallback avatar immediately
                                        const fallbackDataUrl = createFallbackAvatar(user?.name || 'User');
                                        e.target.src = fallbackDataUrl;
                                        e.target.style.display = 'block';
                                        // Remove crossOrigin after setting fallback to avoid CORS issues with data URLs
                                        e.target.removeAttribute('crossOrigin');
                                        e.target.removeAttribute('referrerPolicy');
                                    }}
                                    onLoad={() => {
                                        console.log('Avatar image loaded successfully');
                                    }}
                                />
                            ) : (
                                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                                    {user?.name?.charAt(0) || 'A'}
                                </div>
                            )}
                        </div>
                        <div className="profile-info">
                            <h1 className="profile-name">{name || user.name}</h1>
                            <p className="profile-email">{user.email}</p>
                            <div className="profile-alias">
                                <span>Alias: </span>
                                <b>{alias || <span style={{ color: '#aaa' }}>[nesetat]</span>}</b>
                            </div>
                            <div className="profile-description">
                                <span>Descriere: </span>
                                <span>{description || <span style={{ color: '#aaa' }}>[nesetată]</span>}</span>
                            </div>
                            <div className="profile-stats">
                                <div className="stat-item">
                                    <span className="stat-icon">📅</span>
                                    <span className="stat-text">Membru din {user.joinedDate?.slice(0, 10) || '-'}</span>
                                </div>
                                {isAdmin && (
                                <div className="stat-item">
                                        <span className="stat-icon">⭐</span>
                                        <span className="stat-text">Administrator</span>
                                </div>
                                )}
                            </div>
                        </div>
                        <div className="profile-actions">
                            <button className="edit-profile-btn" onClick={() => {
                                setNameInput(name || user.name);
                                setAliasInput(alias);
                                setProfilePicInput(profilePic);
                                setDescriptionInput(description);
                                // Reset selected image when opening modal
                                setSelectedImageFile(null);
                                setSelectedImagePreview(null);
                                // Reset errors
                                setAliasError('');
                                setNameError('');
                                setDescriptionError('');
                                setSaveError('');
                                setShowEditModal(true);
                            }}>
                                Editează profilul
                            </button>
                            <button className="logout-btn" onClick={handleLogout}>
                                Deconectează-te
                            </button>
                        </div>
                    </div>
                </div>
                {showEditModal && (
                    <div className="profile-edit-modal">
                        <div className="profile-edit-content">
                            <h2>Editează profilul</h2>
                            <label>Nume:</label>
                            <input
                                type="text"
                                value={nameInput}
                                onChange={e => setNameInput(e.target.value)}
                                placeholder="Introdu numele tău"
                            />
                            {nameError && <div className="name-error">{nameError}</div>}
                            <label>Alias:</label>
                            <input
                                type="text"
                                value={aliasInput}
                                onChange={e => setAliasInput(e.target.value)}
                                placeholder="Alege un alias unic"
                            />
                            {aliasError && <div className="alias-error">{aliasError}</div>}
                            <label>Poza de profil (URL):</label>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
                                Formate acceptate: JPG, PNG, GIF. Dimensiune maximă: 5MB
                            </div>
                            <div
                                className="profile-pic-dropzone"
                                onDrop={handleDrop}
                                onDragOver={e => e.preventDefault()}
                                onPaste={handlePaste}
                                onClick={handleDropzoneClick}
                                style={{ 
                                    border: '2px dashed #aaa', 
                                    borderRadius: 8, 
                                    padding: 16, 
                                    textAlign: 'center', 
                                    cursor: profilePicUploadLoading ? 'not-allowed' : 'pointer', 
                                    marginBottom: 12,
                                    opacity: profilePicUploadLoading ? 0.6 : 1
                                }}
                            >
                                {selectedImagePreview ? (
                                    <div>
                                        <img src={selectedImagePreview} alt="preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: '50%', marginBottom: 8 }} />
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '8px' }}>
                                            {selectedImageFile?.name}
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setSelectedImageFile(null);
                                                setSelectedImagePreview(null);
                                                setProfilePicInput('');
                                                if (selectedImagePreview) {
                                                    URL.revokeObjectURL(selectedImagePreview);
                                                }
                                            }}
                                            style={{
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Șterge
                                        </button>
                                    </div>
                                ) : profilePic && (profilePic.startsWith('http') || profilePic.startsWith('data:image')) ? (
                                    <img 
                                        src={profilePic} 
                                        alt="current profile" 
                                        style={{ maxWidth: 120, maxHeight: 120, borderRadius: '50%', marginBottom: 8 }}
                                        {...(profilePic.includes('googleusercontent.com') && { crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' })}
                                    />
                                ) : profilePic ? (
                                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '8px' }}>
                                        Imagine salvată
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ marginBottom: '8px' }}>📷</div>
                                        <span>Trage o poză aici, dă click sau folosește Ctrl+V</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    disabled={profilePicUploadLoading}
                                />
                            </div>
                            {uploadSuccess && (
                                <div style={{ 
                                    color: '#10b981', 
                                    fontSize: '0.875rem', 
                                    marginTop: '8px',
                                    textAlign: 'center',
                                    fontWeight: '500'
                                }}>
                                    ✅ Profil salvat cu succes! {selectedImageFile ? 'Imaginea a fost încărcată la Cloudinary.' : ''}
                                </div>
                            )}
                            <label>Descriere:</label>
                            <textarea
                                value={descriptionInput}
                                onChange={e => setDescriptionInput(e.target.value)}
                                placeholder="Scrie câteva cuvinte despre tine (max 200 caractere)"
                                maxLength={200}
                            />
                            {descriptionError && <div className="description-error">{descriptionError}</div>}
                            {saveError && <div className="profile-save-error">{saveError}</div>}
                            <div className="profile-edit-actions">
                                <button 
                                    className="profile-btn profile-btn-blue" 
                                    onClick={handleProfileSave}
                                    disabled={profileSaveLoading}
                                >
                                    {profileSaveLoading ? 'Se salvează...' : 'Salvează'}
                                </button>
                                <button 
                                    className="profile-btn profile-btn-red" 
                                    onClick={() => setShowEditModal(false)}
                                    disabled={profileSaveLoading}
                                >
                                    Anulează
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="profile-tabs">
                    <div className="tabs-list">
                        <button
                            className={`tab-trigger ${activeTab === 'activitate' ? 'active' : ''}`}
                            onClick={() => setActiveTab('activitate')}
                        >
                            Activitate recentă
                        </button>
                        <button
                            className={`tab-trigger ${activeTab === 'probleme' ? 'active' : ''}`}
                            onClick={() => setActiveTab('probleme')}
                        >
                            Probleme salvate
                        </button>
                        <button
                            className={`tab-trigger ${activeTab === 'realizari' ? 'active' : ''}`}
                            onClick={() => setActiveTab('realizari')}
                        >
                            Realizări
                        </button>
                        <button
                            className={`tab-trigger ${activeTab === 'statistici' ? 'active' : ''}`}
                            onClick={() => setActiveTab('statistici')}
                        >
                            Statistici
                        </button>
                    </div>
                    <div className="tab-content">
                        {activeTab === 'activitate' && (
                            <div className="activity-tab-content">
                                {userProblemsLoading ? (
                                    <div className="loading-container" style={{ minHeight: '200px' }}>
                                        <div className="loading-spinner">
                                            <div className="spinner"></div>
                                            <h3>Se încarcă activitatea...</h3>
                                            <p>Te rugăm să aștepți în timp ce se procesează datele.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <RecentActivity activityLog={activityLog} />
                                )}
                            </div>
                        )}
                        {activeTab === 'probleme' && (
                            <div className="profile-favorites-section" style={{ margin: '32px 0' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Probleme salvate</h2>
                                {favoriteProblems.filter(p => p && p.id).length === 0 ? (
                                    <div style={{ color: '#888' }}>Nu ai probleme favorite salvate.</div>
                                ) : (
                                    <div className="favorites-grid-container" style={{ maxHeight: '325px', overflowY: 'auto', paddingRight: 8 }}>
                                        <div className="problems-grid">
                                            {favoriteProblems.filter(p => p && p.id).map(problem => (
                                                <FavoriteProblemCard
                                                    key={problem.id}
                                                    problem={problem}
                                                    completionPercent={getProblemCompletion(problem)}
                                                    onUnstar={async (e) => {
                                                        e.preventDefault();
                                                        // elimină din favorite
                                                        const userRef = doc(db, 'users', user.uid);
                                                        const snap = await getDoc(userRef);
                                                        if (snap.exists() && snap.data().favorites) {
                                                            const newFavs = snap.data().favorites.filter(fid => fid !== problem.id);
                                                            await setDoc(userRef, { favorites: newFavs }, { merge: true });
                                                            setFavorites(normalizeFavoriteIds(newFavs));
                                                        }
                                                    }}
                                                    onResolveClick={(p) => {
                                                        // Navigare client-side (fără reload) folosind indexul problemei
                                                        navigate(`/probleme/${p.index}`);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'realizari' && (
                            <div className="achievements-tab-content">
                                {userProblemsLoading ? (
                                    <div className="loading-container" style={{ minHeight: '200px' }}>
                                        <div className="loading-spinner">
                                            <div className="spinner"></div>
                                            <h3>Se încarcă realizările...</h3>
                                            <p>Te rugăm să aștepți în timp ce se procesează datele.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <Achievements achievements={achievements} />
                                )}
                            </div>
                        )}
                        {activeTab === 'statistici' && (
                            <div className="statistics-tab-content">
                                {userProblemsLoading ? (
                                    <div className="loading-container" style={{ minHeight: '200px' }}>
                                        <div className="loading-spinner">
                                            <div className="spinner"></div>
                                            <h3>Se încarcă statisticile...</h3>
                                            <p>Te rugăm să aștepți în timp ce se procesează datele.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <Statistics statistics={statistics} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
