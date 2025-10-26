import React, { useState, useEffect } from 'react';
import Layout from '../Layout';
import { auth, provider, db, storage } from '../../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { problemeData } from '../problemedata';
import { ProblemCard } from './Probleme.jsx';
import { Link } from 'react-router-dom';
import '../../scss/components/_probleme.scss';
import RecentActivity from '../RecentActivity';
import Achievements from '../Achievements';
import Statistics from '../Statistics';
import { useSolvedProblems } from '../../hooks/useSolvedProblems';
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
const FavoriteProblemCard = ({ problem, onUnstar, onResolveClick }) => {
  const { index, titlu, dificultate, categorie, solved, createdByAlias } = problem;
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
    <div className={`problem-card favorite-problem-card${solved ? ' solved' : ''}`} style={{ position: 'relative' }}>
      {/* Steaua pentru favorite, poziționată absolut, nu afectează layout-ul */}
      <button
        onClick={onUnstar}
        title="Elimină din favorite"
        style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#f5b301', zIndex: 3 }}
        aria-label="Elimină din favorite"
      >
        ★
      </button>
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

const Profile = () => {
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
    const [achievements, setAchievements] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [favorites, setFavorites] = useState([]);
    const [userProblems, setUserProblems] = useState([]);
    const { solvedProblems, saveSolvedProblem, clearTestProblems, clearAllSolvedProblems } = useSolvedProblems();
    
    // Loading states for different operations
    const [userProblemsLoading, setUserProblemsLoading] = useState(false);
    const [profileSaveLoading, setProfileSaveLoading] = useState(false);
    const [profilePicUploadLoading, setProfilePicUploadLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [selectedImagePreview, setSelectedImagePreview] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        name: firebaseUser.displayName,
                        email: firebaseUser.email,
                        alias: '',
                        joinedDate: new Date().toISOString(),
                        profilePic: firebaseUser.photoURL || '',
                        description: '',
                        isAdmin: ADMIN_EMAILS.includes(firebaseUser.email),
                    });
                    setAlias('');
                    setName(firebaseUser.displayName || '');
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
                    setFavorites(userData.favorites || []);
                }
                setUser({
                    uid: firebaseUser.uid,
                    name: firebaseUser.displayName,
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
    const allProblems = [...problemeData, ...userProblems, ...problemsFromStore];
    const favoriteProblems = allProblems.filter(p => favorites.includes(p.id));

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            setAliasError('Eroare la autentificare.');
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
            setAliasError('Eroare la salvarea profilului.');
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

    useEffect(() => {
        if (!user || !user.uid) return;
        
        // Probleme adăugate de utilizator
        const addedProblems = userProblems.filter(p => p.createdByAlias === alias);
        
        // Simulări accesate (din Firestore, dacă există)
        let simulationsVisited = [];
        const fetchSimulations = async () => {
            try {
                const userRef = doc(db, 'users', user.uid);
                const snap = await getDoc(userRef);
                if (snap.exists() && snap.data().simulationsVisited) {
                    simulationsVisited = snap.data().simulationsVisited;
                }
            } catch (e) {}
            
            // Construim activityLog - filtrează problemele care nu există
            const allAvailableProblems = allProblems;
            const addedProblemsFiltered = addedProblems.filter(p => 
                allAvailableProblems.some(ap => String(ap.id) === String(p.id))
            );
            
            // Procesăm problemele rezolvate cu scorurile lor (din hook)
            // console.log('📊 Profile processing solvedProblems:', solvedProblems);
            
            const solvedActivities = solvedProblems.map(solvedProblem => {
                const originalProblem = allAvailableProblems.find(p => String(p.id) === String(solvedProblem.problemId));
                
                // Folosește titlul personalizat dacă există, altfel caută în problemele existente
                let problemTitle = solvedProblem.customTitle;
                if (!problemTitle) {
                    problemTitle = originalProblem ? originalProblem.titlu : `Problema ${solvedProblem.problemId}`;
                }
                
                // console.log('🎯 Processing problem:', {
                //     problemId: solvedProblem.problemId,
                //     scoreObtained: solvedProblem.scoreObtained,
                //     maxScore: solvedProblem.maxScore,
                //     title: problemTitle
                // });
                
                return {
                    type: 'problem_solved',
                    title: problemTitle,
                    date: solvedProblem.solvedAt,
                    link: solvedProblem.problemId.startsWith('submitted_') ? null : `/probleme/${solvedProblem.problemId}`,
                    score: {
                        scoreObtained: solvedProblem.scoreObtained,
                        maxScore: solvedProblem.maxScore
                    }
                };
            });
            
            const activity = [
                ...solvedActivities,
                ...addedProblemsFiltered.map(p => ({ type: 'problem_added', title: p.titlu, date: p.createdAt || '', link: p.id ? `/probleme/${p.id}` : undefined })),
                ...simulationsVisited.map(s => ({ type: 'simulation_visited', title: s.title, date: s.date, link: s.id ? `/simulari/${s.id}` : undefined })),
            ].sort((a, b) => new Date(b.date) - new Date(a.date));
            setActivityLog(activity);
            
            // Achievements cumulative pentru probleme rezolvate și adăugate
            const ach = [];
            
            // Achievements pentru probleme rezolvate
            if (solvedActivities.length >= 1) ach.push({ type: 'milestone', title: 'Prima problemă rezolvată', description: 'Ai rezolvat prima ta problemă!', color: '#10b981' });
            if (solvedActivities.length >= 5) ach.push({ type: 'milestone', title: 'Rezolvător dedicat', description: 'Ai rezolvat 5 probleme!', color: '#3b82f6' });
            if (solvedActivities.length >= 10) ach.push({ type: 'milestone', title: 'Maestru al rezolvării', description: 'Ai rezolvat 10 probleme!', color: '#ffd700' });
            
            // Achievements pentru probleme adăugate
            if (addedProblems.length >= 1) ach.push({ type: 'milestone', title: 'Începător în fizică', description: 'Ai adăugat prima ta problemă!', color: '#b0b0b0' });
            if (addedProblems.length >= 5) ach.push({ type: 'milestone', title: 'Avansat', description: 'Ai adăugat 5 probleme!', color: '#4a90e2' });
            if (addedProblems.length >= 10) ach.push({ type: 'milestone', title: 'Maestru', description: 'Ai adăugat 10 probleme!', color: '#ffd700' });
            
            // Realizări pentru simulări accesate
            simulationsVisited.forEach(s => ach.push({ type: 'simulation_visited', title: s.title, date: s.date }));
            setAchievements(ach);
            
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
        };
        fetchSimulations();
    }, [user, userProblems, alias, allProblems]);

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
                <div className="profile-container profile-login-center">
                    <h2 className="profile-title">Profil</h2>
                    <div className="profile-login-btns">
                        <button className="profile-btn-big profile-btn-red" onClick={handleGoogleLogin}>
                            Înregistrează-te cu Google
                        </button>
                        <button className="profile-btn-big profile-btn-blue" onClick={handleGoogleLogin}>
                            Autentifică-te cu Google
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }


    return (
        <Layout>
            <div className="page-section profile-container">
                <div className="profile-header">
                    <div className="profile-header-content">
                        <div className="profile-avatar">
                            {profilePic && profilePic.trim() !== '' ? (
                                <img 
                                    src={profilePic} 
                                    alt="avatar" 
                                    className="profile-avatar-img"
                                    onError={(e) => {
                                        console.error('Avatar image failed to load:', profilePic);
                                        
                                        // Create fallback avatar immediately
                                        const fallbackDataUrl = createFallbackAvatar(user?.name || 'User');
                                        e.target.src = fallbackDataUrl;
                                        e.target.style.display = 'block';
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
                                    <img src={profilePic} alt="current profile" style={{ maxWidth: 120, maxHeight: 120, borderRadius: '50%', marginBottom: 8 }} />
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
                                                    onUnstar={async (e) => {
                                                        e.preventDefault();
                                                        // elimină din favorite
                                                        const userRef = doc(db, 'users', user.uid);
                                                        const snap = await getDoc(userRef);
                                                        if (snap.exists() && snap.data().favorites) {
                                                            const newFavs = snap.data().favorites.filter(fid => fid !== problem.id);
                                                            await setDoc(userRef, { favorites: newFavs }, { merge: true });
                                                            setFavorites(newFavs);
                                                        }
                                                    }}
                                                    onResolveClick={() => window.location.href = `/probleme/${problem.id}`}
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
