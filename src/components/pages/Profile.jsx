import React, { useState, useEffect } from 'react';
import Layout from '../Layout';
import { auth, provider, db, storage } from '../../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { setFavorites } from '../../problemeSlice';
import { problemeData } from '../problemedata';
import { ProblemCard } from './Probleme.jsx';
import ProblemaDetaliata from '../Problemadetaliata';
import { Link } from 'react-router-dom';
import '../../scss/components/_probleme.scss';
import RecentActivity from '../RecentActivity';
import Achievements from '../Achievements';
import Statistics from '../Statistics';

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

const Profile = () => {
    const [user, setUser] = useState(null);
    const [alias, setAlias] = useState('');
    const [aliasInput, setAliasInput] = useState('');
    const [aliasError, setAliasError] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingAlias, setEditingAlias] = useState(false);
    const [activeTab, setActiveTab] = useState('activitate');
    const [showEditModal, setShowEditModal] = useState(false);
    const [profilePic, setProfilePic] = useState('');
    const [profilePicInput, setProfilePicInput] = useState('');
    const [desc, setDesc] = useState('');
    const [descInput, setDescInput] = useState('');
    const [descError, setDescError] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [profilePicPreview, setProfilePicPreview] = useState('');
    const fileInputRef = React.useRef();
    const dispatch = useDispatch();
    const [selectedFavorite, setSelectedFavorite] = useState(null);
    const [activityLog, setActivityLog] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [statistics, setStatistics] = useState({});

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
                        desc: '',
                        isAdmin: ADMIN_EMAILS.includes(firebaseUser.email),
                    });
                    setAlias('');
                    setProfilePic(firebaseUser.photoURL || '');
                    setDesc('');
                    setIsAdmin(ADMIN_EMAILS.includes(firebaseUser.email));
                } else {
                    setAlias(userSnap.data().alias || '');
                    setProfilePic(userSnap.data().profilePic || '');
                    setDesc(userSnap.data().desc || '');
                    setIsAdmin(userSnap.data().isAdmin || ADMIN_EMAILS.includes(firebaseUser.email));
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
                setProfilePic('');
                setDesc('');
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
      if (user && user.uid) {
        const fetchFavorites = async () => {
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists() && snap.data().favorites) {
            dispatch(setFavorites(snap.data().favorites));
          }
        };
        fetchFavorites();
      }
    }, [user, dispatch]);
    const favorites = useSelector(state => state.problems.favorites);
    const userProblems = useSelector(state => state.problems.userProblems);
    const allProblems = [...problemeData, ...userProblems];
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

    const checkAliasUnique = async (aliasToCheck) => {
        const q = query(collection(db, 'users'), where('alias', '==', aliasToCheck));
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty || (querySnapshot.docs.length === 1 && querySnapshot.docs[0].id === user.uid);
    };

    const handleProfileSave = async () => {
        console.log("user in handleProfileSave", user);
        console.log("user.uid", user?.uid);
        console.log("aliasInput", aliasInput);
        console.log("profilePicInput", profilePicInput);
        console.log("descInput", descInput);
        setAliasError('');
        setDescError('');
        const trimmedAlias = aliasInput.trim();
        const trimmedDesc = descInput.trim();
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
        if (trimmedDesc.length > 200) {
            setDescError('Descrierea nu poate avea mai mult de 200 de caractere.');
            return;
        }
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { alias: trimmedAlias, profilePic: profilePicInput || profilePic, desc: trimmedDesc }, { merge: true });
        setAlias(trimmedAlias);
        setProfilePic(profilePicInput || profilePic);
        setDesc(trimmedDesc);
        setShowEditModal(false);
    };

    const IMAGEKIT_PUBLIC_KEY = 'public_6rkxL+q+51xT8d2+GHpJeNSzOTE=';
    const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';

    const handleProfilePicUpload = async (file) => {
        if (!file) return;

        // 1. Ia semnătura de la backend
        const authRes = await fetch('/api/assistant/imagekit-auth');
        const { signature, expire, token } = await authRes.json();

        // 2. Upload la ImageKit cu semnătură
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);
        formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
        formData.append('signature', signature);
        formData.append('expire', expire);
        formData.append('token', token);

        try {
            const res = await fetch(IMAGEKIT_UPLOAD_URL, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data && data.url) {
                setProfilePicInput(data.url);
                setProfilePicPreview(data.url);
            } else {
                alert('Eroare la upload poză!');
            }
        } catch (err) {
            alert('Eroare la upload poză!');
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
        // Forțez încărcarea userProblems și a favoritelor
        const fetchUserProblems = async () => {
            const userProblemsRef = collection(db, 'users', user.uid, 'userProblems');
            const querySnapshot = await getDocs(userProblemsRef);
            const userProblemsList = querySnapshot.docs.map(doc => doc.data());
            dispatch({ type: 'problems/setUserProblems', payload: userProblemsList });
        };
        const fetchFavorites = async () => {
            const userRef = doc(db, 'users', user.uid);
            const snap = await getDoc(userRef);
            if (snap.exists() && snap.data().favorites) {
                dispatch(setFavorites(snap.data().favorites));
            }
        };
        fetchUserProblems();
        fetchFavorites();
    }, [user, dispatch]);

    useEffect(() => {
        if (!user || !user.uid) return;
        // Probleme adăugate de utilizator
        const addedProblems = userProblems.filter(p => p.createdByAlias === alias);
        // Probleme rezolvate
        const solvedProblems = [...problemeData, ...userProblems].filter(p => p.solved && p.solvedBy === user.uid);
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
            // Debug: afișează problemele din activitate
            console.log('Probleme rezolvate:', solvedProblems.map(p => ({ id: p.id, titlu: p.titlu })));
            console.log('Probleme adăugate:', addedProblems.map(p => ({ id: p.id, titlu: p.titlu })));
            console.log('Toate problemele din userProblems:', userProblems.map(p => ({ id: p.id, titlu: p.titlu })));
            
            // Construim activityLog - filtrează problemele care nu există
            const allAvailableProblems = [...problemeData, ...userProblems];
            const solvedProblemsFiltered = solvedProblems.filter(p => 
                allAvailableProblems.some(ap => String(ap.id) === String(p.id))
            );
            const addedProblemsFiltered = addedProblems.filter(p => 
                allAvailableProblems.some(ap => String(ap.id) === String(p.id))
            );
            
            const activity = [
                ...solvedProblemsFiltered.map(p => ({ type: 'problem_solved', title: p.titlu, date: p.solvedAt || '', link: p.id ? `/probleme/${p.id}` : undefined })),
                ...addedProblemsFiltered.map(p => ({ type: 'problem_added', title: p.titlu, date: p.createdAt || '', link: p.id ? `/probleme/${p.id}` : undefined })),
                ...simulationsVisited.map(s => ({ type: 'simulation_visited', title: s.title, date: s.date, link: s.id ? `/simulari/${s.id}` : undefined })),
            ].sort((a, b) => new Date(b.date) - new Date(a.date));
            setActivityLog(activity);
            // Achievements cumulative pentru probleme adăugate
            const ach = [];
            if (addedProblems.length >= 1) ach.push({ type: 'milestone', title: 'Începător în fizică', description: 'Ai adăugat prima ta problemă!', color: '#b0b0b0' });
            if (addedProblems.length >= 5) ach.push({ type: 'milestone', title: 'Avansat', description: 'Ai adăugat 5 probleme!', color: '#4a90e2' });
            if (addedProblems.length >= 10) ach.push({ type: 'milestone', title: 'Maestru', description: 'Ai adăugat 10 probleme!', color: '#ffd700' });
            // Realizări pentru simulări accesate și probleme rezolvate
            solvedProblems.forEach(p => ach.push({ type: 'problem_solved', title: p.titlu, date: p.solvedAt || '' }));
            addedProblems.forEach(p => ach.push({ type: 'problem_added', title: p.titlu, date: p.createdAt || '' }));
            simulationsVisited.forEach(s => ach.push({ type: 'simulation_visited', title: s.title, date: s.date }));
            setAchievements(ach);
            // Statistici pe dificultate și categorie DOAR pentru probleme adăugate
            const stats = { dificultate: {}, categorie: {} };
            addedProblems.forEach(p => {
                if (p.dificultate) stats.dificultate[p.dificultate] = (stats.dificultate[p.dificultate] || 0) + 1;
                if (p.categorie) stats.categorie[p.categorie] = (stats.categorie[p.categorie] || 0) + 1;
            });
            setStatistics(stats);
        };
        fetchSimulations();
    }, [user, userProblems, alias]);

    if (loading) {
        return <Layout><div className="profile-container"><p>Se încarcă...</p></div></Layout>;
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
                            {profilePic ? (
                                <img src={profilePic} alt="avatar" className="profile-avatar-img" />
                            ) : (
                                user.name.charAt(0)
                            )}
                        </div>
                        <div className="profile-info">
                            <h1 className="profile-name">{user.name}</h1>
                            <p className="profile-email">{user.email}</p>
                            <div className="profile-alias">
                                <span>Alias: </span>
                                <b>{alias || <span style={{ color: '#aaa' }}>[nesetat]</span>}</b>
                            </div>
                            <div className="profile-desc">
                                <span>Descriere: </span>
                                <span>{desc || <span style={{ color: '#aaa' }}>[nesetată]</span>}</span>
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
                                setAliasInput(alias);
                                setProfilePicInput(profilePic);
                                setDescInput(desc);
                                setProfilePicPreview(profilePic); // Set preview on modal open
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
                            <label>Alias:</label>
                            <input
                                type="text"
                                value={aliasInput}
                                onChange={e => setAliasInput(e.target.value)}
                                placeholder="Alege un alias unic"
                            />
                            {aliasError && <div className="alias-error">{aliasError}</div>}
                            <label>Poza de profil (URL):</label>
                            <div
                                className="profile-pic-dropzone"
                                onDrop={handleDrop}
                                onDragOver={e => e.preventDefault()}
                                onPaste={handlePaste}
                                onClick={handleDropzoneClick}
                                style={{ border: '2px dashed #aaa', borderRadius: 8, padding: 16, textAlign: 'center', cursor: 'pointer', marginBottom: 12 }}
                            >
                                {profilePicPreview || profilePicInput ? (
                                    <img src={profilePicPreview || profilePicInput} alt="preview" style={{ maxWidth: 120, maxHeight: 120, borderRadius: '50%', marginBottom: 8 }} />
                                ) : (
                                    <span>Trage o poză aici, dă click sau folosește Ctrl+V</span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />
                            </div>
                            <label>Descriere:</label>
                            <textarea
                                value={descInput}
                                onChange={e => setDescInput(e.target.value)}
                                placeholder="Scrie câteva cuvinte despre tine (max 200 caractere)"
                                maxLength={200}
                            />
                            {descError && <div className="desc-error">{descError}</div>}
                            <div className="profile-edit-actions">
                                <button className="profile-btn profile-btn-blue" onClick={handleProfileSave}>Salvează</button>
                                <button className="profile-btn profile-btn-red" onClick={() => setShowEditModal(false)}>Anulează</button>
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
                            <div className="activity-content">
                                <RecentActivity activityLog={activityLog} />
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
                                                            dispatch(setFavorites(newFavs));
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
                            <div className="achievements-content">
                                <Achievements achievements={achievements} />
                            </div>
                        )}
                        {activeTab === 'statistici' && (
                            <div className="statistics-content">
                                <Statistics statistics={statistics} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
