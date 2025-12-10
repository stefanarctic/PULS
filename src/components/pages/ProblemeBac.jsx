import { useEffect, useState, useMemo, Fragment } from 'react';
import Layout from '../Layout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ProblemCard } from './Probleme';
import { useSolvedProblems } from '../../hooks/useSolvedProblems';
import { normalizeString } from '../../lib/normalizeString';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { addProblem, clearAddStatus } from '../../features/problems/problemsSlice';
import { sendProblemSuggestion } from '../../lib/emailService';
import '../../scss/components/_probleme-bac.scss';

// Icon components
const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </svg>
);

const ProblemeBac = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { value: problemeData, status } = useSelector(state => state.problems);
    const { addStatus, addError } = useSelector(state => state.problems);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [expandedVariants, setExpandedVariants] = useState({});
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("Toate");
    const [sortBy, setSortBy] = useState("newest");
    const [showAddModal, setShowAddModal] = useState(false);
    const [pendingUrlData, setPendingUrlData] = useState(null);
    const { solvedProblems } = useSolvedProblems();

    // Filter only Bac problems
    const bacProblems = useMemo(() => {
        return problemeData.filter(problem => 
            problem.categorie === 'Bac' || 
            (problem.categorie && normalizeString(problem.categorie).includes('bac'))
        );
    }, [problemeData]);

    // Filter problems by search and difficulty
    const filteredBacProblems = useMemo(() => {
        return bacProblems.filter((problem) => {
            if (searchQuery) {
                const query = normalizeString(searchQuery);
                const matchesTitle = normalizeString(problem.titlu).includes(query);
                const matchesId = problem.id?.toString().includes(query);
                const matchesIndex = problem.index?.toString().includes(query);
                
                if (!matchesTitle && !matchesId && !matchesIndex) {
                    return false;
                }
            }

            if (selectedDifficulty !== "Toate" && normalizeString(problem.dificultate) !== normalizeString(selectedDifficulty)) {
                return false;
            }

            return true;
        });
    }, [bacProblems, searchQuery, selectedDifficulty]);

    // Helper functions for variant sorting
    const extractYear = (variant) => {
        const match = variant.match(/(\d{4})/);
        return match ? parseInt(match[1]) : 0;
    };

    const getVariantType = (variant) => {
        const lower = variant.toLowerCase();
        if (lower.includes('simulare')) return 'simulare';
        if (lower.includes('vara')) return 'vara';
        if (lower.includes('toamna')) return 'toamna';
        return 'other';
    };

    // Sort problems
    const difficultyOrder = { "ușor": 1, "mediu": 2, "dificil": 3, "concurs": 4 };
    const sortedProblems = useMemo(() => {
        const problems = [...filteredBacProblems];
        switch (sortBy) {
            case "newest":
                return problems.sort((a, b) => b.index - a.index);
            case "oldest":
                return problems.sort((a, b) => a.index - b.index);
            case "difficulty-asc":
                return problems.sort((a, b) => {
                    const orderA = difficultyOrder[a.dificultate] || 0;
                    const orderB = difficultyOrder[b.dificultate] || 0;
                    return orderA === orderB ? a.index - b.index : orderA - orderB;
                });
            case "difficulty-desc":
                return problems.sort((a, b) => {
                    const orderA = difficultyOrder[a.dificultate] || 0;
                    const orderB = difficultyOrder[b.dificultate] || 0;
                    return orderA === orderB ? a.index - b.index : orderB - orderA;
                });
            default:
                return problems.sort((a, b) => a.index - b.index);
        }
    }, [filteredBacProblems, sortBy]);

    // Group problems by variant
    const problemsByVariant = useMemo(() => {
        const grouped = {};
        sortedProblems.forEach(problem => {
            const variant = problem.varianta || 'Altele';
            if (!grouped[variant]) {
                grouped[variant] = [];
            }
            grouped[variant].push(problem);
        });
        
        // Sort variants by year (newest first)
        const sortedVariants = Object.keys(grouped).sort((a, b) => {
            const yearA = extractYear(a);
            const yearB = extractYear(b);
            if (yearA !== yearB) {
                return yearB - yearA;
            }
            const typeOrder = { 'simulare': 0, 'vara': 1, 'toamna': 2 };
            const typeA = getVariantType(a);
            const typeB = getVariantType(b);
            return (typeOrder[typeA] || 99) - (typeOrder[typeB] || 99);
        });
        
        const sorted = {};
        sortedVariants.forEach(variant => {
            sorted[variant] = grouped[variant];
        });
        
        return sorted;
    }, [sortedProblems]);

    const solvedProblemsMap = useMemo(() => {
        return solvedProblems.reduce((acc, entry) => {
            if (!entry) return acc;
            const { problemId, scoreObtained, maxScore } = entry;
            if (!problemId || maxScore === 0 || maxScore === undefined || maxScore === null) {
                return acc;
            }
            const numericScore = Number(scoreObtained);
            const numericMax = Number(maxScore);
            if (!Number.isFinite(numericScore) || !Number.isFinite(numericMax) || numericMax <= 0) {
                return acc;
            }
            const percent = Math.min(100, Math.round((numericScore / numericMax) * 100));
            if (!Number.isFinite(percent)) {
                return acc;
            }
            const key = String(problemId);
            const current = acc[key] ?? 0;
            acc[key] = percent > current ? percent : current;
            return acc;
        }, {});
    }, [solvedProblems]);

    const getProblemCompletion = (problem) => {
        if (!problem) return null;
        const keysToCheck = [problem.id, problem.index];
        for (const key of keysToCheck) {
            if (key === undefined || key === null) continue;
            const percent = solvedProblemsMap[String(key)];
            if (typeof percent === 'number') {
                return percent;
            }
        }
        return null;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                const userRef = doc(db, 'users', firebaseUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setIsAdmin(userSnap.data().isAdmin === true);
                    setFavorites(userSnap.data().favorites || []);
                } else {
                    setIsAdmin(false);
                    setFavorites([]);
                }
            } else {
                setUser(null);
                setIsAdmin(false);
                setFavorites([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const toggleFavorite = async (problem) => {
        if (!user?.uid) {
            alert('Autentifică-te pentru a salva probleme la favorite.');
            return;
        }
        try {
            const userRef = doc(db, 'users', user.uid);
            const snap = await getDoc(userRef);
            const currentFavs = (snap.exists() && snap.data().favorites) ? snap.data().favorites : [];
            const problemId = problem.id;
            let newFavs;
            if (currentFavs.includes(problemId)) {
                newFavs = currentFavs.filter(id => id !== problemId);
            } else {
                newFavs = [...currentFavs, problemId];
            }
            await setDoc(userRef, { favorites: newFavs }, { merge: true });
            setFavorites(newFavs);
        } catch (e) {
            console.error('Favorite toggle failed:', e);
        }
    };

    const toggleVariant = (variant) => {
        setExpandedVariants(prev => ({
            ...prev,
            [variant]: !prev[variant]
        }));
    };

    const formatVariantName = (variant) => {
        return variant
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const query = searchQuery.trim();
            const problemIndex = parseInt(query);
            if (!isNaN(problemIndex)) {
                const problem = bacProblems.find(p => p.index === problemIndex);
                if (problem) {
                    navigate(`/probleme/${problemIndex}`);
                    return;
                }
            }
        }
    };

    // Check for addProblem parameter in URL and populate form
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const addProblem = urlParams.get('addProblem');
        
        if (addProblem === '1') {
            console.log('📝 [URL] Detected addProblem parameter in URL for Bac page');
            
            // Parse problem data from URL immediately
            const problemData = {
                titlu: decodeURIComponent(urlParams.get('titlu') || ''),
                descriere: decodeURIComponent(urlParams.get('descriere') || ''),
                varianta: decodeURIComponent(urlParams.get('varianta') || ''),
                categorie: 'Bac',
                dificultate: decodeURIComponent(urlParams.get('dificultate') || 'mediu'),
                continut: decodeURIComponent(urlParams.get('continut') || ''),
                punctajTotal: parseInt(urlParams.get('punctajTotal')) || 0,
            };
            
            // Decode base64 JSON data
            try {
                const formuleParam = urlParams.get('formule');
                if (formuleParam) {
                    problemData.formule = JSON.parse(atob(formuleParam));
                }
                
                const dateParam = urlParams.get('date');
                if (dateParam) {
                    problemData.date = JSON.parse(atob(dateParam));
                }
                
                const subpuncteParam = urlParams.get('subpuncte');
                if (subpuncteParam) {
                    problemData.subpuncte = JSON.parse(atob(subpuncteParam));
                }
            } catch (error) {
                console.error('Error decoding URL parameters:', error);
            }
            
            console.log('📝 [URL] Parsed problem data:', problemData);
            
            // Store data for later use
            setPendingUrlData(problemData);
        }
    }, [location.search]);

    // Handle opening modal when user and admin status are ready
    useEffect(() => {
        if (!pendingUrlData) return;
        
        console.log('📝 [URL] Checking user status:', { 
            hasUser: !!user, 
            isAdmin, 
            userEmail: user?.email,
            hasPendingData: !!pendingUrlData,
            userId: user?.uid
        });
        
        // Wait for user to be loaded
        if (!user) {
            console.log('📝 [URL] User not logged in yet, waiting...');
            return;
        }
        
        // Wait a bit for isAdmin to be set (it's async)
        // Check if user document exists and has isAdmin field
        const checkAdminStatus = async () => {
            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                const userIsAdmin = userSnap.exists() && userSnap.data().isAdmin === true;
                
                console.log('📝 [URL] Admin check result:', {
                    userExists: userSnap.exists(),
                    isAdmin: userIsAdmin,
                    userData: userSnap.exists() ? userSnap.data() : null
                });
                
                if (userIsAdmin) {
                    console.log('📝 [URL] User is admin, opening modal with URL data...');
                    
                    // Store problem data to populate form when modal opens
                    window.__prefillProblemData = pendingUrlData;
                    
                    // Open modal
                    setShowAddModal(true);
                    
                    // Clear pending data
                    setPendingUrlData(null);
                } else {
                    console.log('📝 [URL] User is not admin, clearing pending data');
                    setPendingUrlData(null);
                }
            } catch (error) {
                console.error('📝 [URL] Error checking admin status:', error);
                setPendingUrlData(null);
            }
        };
        
        // Small delay to ensure isAdmin state is updated
        const timer = setTimeout(() => {
            checkAdminStatus();
        }, 100);
        
        return () => clearTimeout(timer);
    }, [pendingUrlData, user]);

    // Open modal when user and admin status are ready and we have prefill data
    useEffect(() => {
        if (window.__prefillProblemData && isAdmin && user) {
            console.log('📝 [URL] User and admin status ready, opening modal with prefill data');
            setShowAddModal(true);
        } else if (window.__prefillProblemData && user && !isAdmin) {
            console.log('⚠️ [URL] User is not admin, cannot open modal');
            // Clear prefill data if user is not admin
            delete window.__prefillProblemData;
        }
    }, [isAdmin, user]);

    const difficulties = ["Toate", "ușor", "mediu", "dificil", "concurs"];

    // AddProblemModal for Bac page
    const AddProblemModal = ({ isOpen, onClose }) => {
        const [formData, setFormData] = useState({
            titlu: '',
            descriere: '',
            categorie: 'Bac',
            varianta: '',
            dificultate: 'mediu',
            continut: '',
            formule: [''],
            date: {},
            poze: [],
            punctajTotal: 0,
            subpuncte: [{ cerinta: '', punctaj: 1 }]
        });

        const [datePairs, setDatePairs] = useState([{ key: '', value: '' }]);
        const [emailStatus, setEmailStatus] = useState('idle');
        const [emailError, setEmailError] = useState(null);
        const [emailLogs, setEmailLogs] = useState([]);

        const handleInputChange = (field, value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        };

        const handleSubpunctChange = (index, field, value) => {
            setFormData(prev => ({
                ...prev,
                subpuncte: prev.subpuncte.map((subpunct, i) => 
                    i === index ? { ...subpunct, [field]: value } : subpunct
                )
            }));
        };

        const addSubpunct = () => {
            setFormData(prev => ({
                ...prev,
                subpuncte: [...prev.subpuncte, { cerinta: '', punctaj: 1 }]
            }));
        };

        const removeSubpunct = (index) => {
            if (formData.subpuncte.length > 1) {
                setFormData(prev => ({
                    ...prev,
                    subpuncte: prev.subpuncte.filter((_, i) => i !== index)
                }));
            }
        };

        const handleImageUpload = (e) => {
            const files = Array.from(e.target.files);
            const imagePromises = files.map(file => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(imagePromises).then(images => {
                setFormData(prev => ({
                    ...prev,
                    poze: [...prev.poze, ...images]
                }));
            });
        };

        const handlePaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;

            const imagePromises = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    const promise = new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });
                    imagePromises.push(promise);
                }
            }

            if (imagePromises.length > 0) {
                Promise.all(imagePromises).then(images => {
                    setFormData(prev => ({
                        ...prev,
                        poze: [...prev.poze, ...images]
                    }));
                });
            }
        };

        const handleDragOver = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const handleDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
            if (files.length > 0) {
                const imagePromises = files.map(file => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });
                });

                Promise.all(imagePromises).then(images => {
                    setFormData(prev => ({
                        ...prev,
                        poze: [...prev.poze, ...images]
                    }));
                });
            }
        };

        const removeImage = (index) => {
            setFormData(prev => ({
                ...prev,
                poze: prev.poze.filter((_, i) => i !== index)
            }));
        };

        const handleDatePairChange = (index, field, value) => {
            setDatePairs(prev => 
                prev.map((pair, i) => 
                    i === index ? { ...pair, [field]: value } : pair
                )
            );
        };

        const addDatePair = () => {
            setDatePairs(prev => [...prev, { key: '', value: '' }]);
        };

        const removeDatePair = (index) => {
            if (datePairs.length > 1) {
                setDatePairs(prev => prev.filter((_, i) => i !== index));
            }
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            
            const dateObject = {};
            datePairs.forEach(pair => {
                if (pair.key.trim() && pair.value.trim()) {
                    dateObject[pair.key.trim()] = pair.value.trim();
                }
            });
            
            const problemData = {
                titlu: formData.titlu,
                descriere: formData.descriere,
                categorie: 'Bac',
                varianta: formData.varianta,
                dificultate: formData.dificultate,
                continut: formData.continut,
                formule: formData.formule,
                date: dateObject,
                subpuncte: formData.subpuncte.map((subpunct, index) => ({
                    id: `${index + 1}${String.fromCharCode(97 + index)}`,
                    cerinta: subpunct.cerinta,
                    punctaj: subpunct.punctaj
                })),
                index: problemeData.length + 1,
                creator: '',
                punctajTotal: formData.punctajTotal,
                createdAt: new Date().toISOString(),
                poze: formData.poze,
            };
            
            if (isAdmin) {
                try {
                    await dispatch(addProblem(problemData)).unwrap();
                    setFormData({
                        titlu: '',
                        descriere: '',
                        categorie: 'Bac',
                        varianta: '',
                        dificultate: 'mediu',
                        continut: '',
                        formule: [''],
                        date: {},
                        poze: [],
                        punctajTotal: 0,
                        subpuncte: [{ cerinta: '', punctaj: 1 }]
                    });
                    setDatePairs([{ key: '', value: '' }]);
                    onClose();
                    setTimeout(() => dispatch(clearAddStatus()), 2000);
                } catch (error) {
                    console.error('Error saving problem:', error);
                }
            } else {
                setEmailStatus('loading');
                setEmailError(null);
                setEmailLogs([{ type: 'info', message: 'Pregătire sugestie problemă...', timestamp: new Date() }]);
                try {
                    setEmailLogs(prev => [...prev, { type: 'info', message: 'Se inițializează serviciul de email...', timestamp: new Date() }]);
                    const result = await sendProblemSuggestion(problemData, user);
                    setEmailLogs(prev => [...prev, { 
                        type: 'success', 
                        message: `Sugestia a fost trimisă cu succes! Durata: ${result.duration || 'N/A'}ms`, 
                        timestamp: new Date() 
                    }]);
                    setEmailStatus('success');
                    setFormData({
                        titlu: '',
                        descriere: '',
                        categorie: 'Bac',
                        varianta: '',
                        dificultate: 'mediu',
                        continut: '',
                        formule: [''],
                        date: {},
                        poze: [],
                        punctajTotal: 0,
                        subpuncte: [{ cerinta: '', punctaj: 1 }]
                    });
                    setDatePairs([{ key: '', value: '' }]);
                    setTimeout(() => {
                        onClose();
                        setEmailStatus('idle');
                        setEmailLogs([]);
                    }, 2000);
                } catch (error) {
                    setEmailLogs(prev => [...prev, { 
                        type: 'error', 
                        message: `Eroare: ${error.message}`, 
                        timestamp: new Date() 
                    }]);
                    setEmailStatus('error');
                    setEmailError(error.message || 'A apărut o eroare la trimiterea sugestiei. Te rugăm să încerci din nou.');
                }
            }
        };

        useEffect(() => {
            if (isOpen) {
                // Check if there's prefill data from URL
                if (window.__prefillProblemData) {
                    const prefillData = window.__prefillProblemData;
                    console.log('📝 [Modal] Populating form with URL data:', prefillData);
                    
                    // Set form data
                    setFormData({
                        titlu: prefillData.titlu || '',
                        descriere: prefillData.descriere || '',
                        categorie: 'Bac',
                        varianta: prefillData.varianta || '',
                        dificultate: prefillData.dificultate || 'mediu',
                        continut: prefillData.continut || '',
                        formule: prefillData.formule && prefillData.formule.length > 0 
                            ? prefillData.formule 
                            : [''],
                        date: {},
                        poze: [],
                        punctajTotal: prefillData.punctajTotal || 0,
                        subpuncte: prefillData.subpuncte && prefillData.subpuncte.length > 0 
                            ? prefillData.subpuncte.map(sub => ({
                                cerinta: sub.cerinta || '',
                                punctaj: sub.punctaj || 1
                            }))
                            : [{ cerinta: '', punctaj: 1 }]
                    });
                    
                    // Set date pairs
                    if (prefillData.date && Object.keys(prefillData.date).length > 0) {
                        const pairs = Object.entries(prefillData.date).map(([key, value]) => ({ 
                            key: String(key), 
                            value: String(value) 
                        }));
                        setDatePairs(pairs.length > 0 ? pairs : [{ key: '', value: '' }]);
                    } else {
                        setDatePairs([{ key: '', value: '' }]);
                    }
                    
                    // Clear prefill data after a short delay to ensure state is set
                    setTimeout(() => {
                        delete window.__prefillProblemData;
                    }, 100);
                } else {
                    // Reset form if no prefill data
                    setFormData({
                        titlu: '',
                        descriere: '',
                        categorie: 'Bac',
                        varianta: '',
                        dificultate: 'mediu',
                        continut: '',
                        formule: [''],
                        date: {},
                        poze: [],
                        punctajTotal: 0,
                        subpuncte: [{ cerinta: '', punctaj: 1 }]
                    });
                    setDatePairs([{ key: '', value: '' }]);
                }
            } else {
                // Reset form when modal closes
                setFormData({
                    titlu: '',
                    descriere: '',
                    categorie: 'Bac',
                    varianta: '',
                    dificultate: 'mediu',
                    continut: '',
                    formule: [''],
                    date: {},
                    poze: [],
                    punctajTotal: 0,
                    subpuncte: [{ cerinta: '', punctaj: 1 }]
                });
                setDatePairs([{ key: '', value: '' }]);
                dispatch(clearAddStatus());
                setEmailStatus('idle');
                setEmailError(null);
                setEmailLogs([]);
            }
        }, [isOpen, dispatch]);

        // Prevent body scroll when modal is open
        useEffect(() => {
            if (isOpen) {
                const scrollY = window.scrollY;
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollY}px`;
                document.body.style.width = '100%';
                document.body.style.overflow = 'hidden';
                
                return () => {
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.width = '';
                    document.body.style.overflow = '';
                    window.scrollTo(0, scrollY);
                };
            }
        }, [isOpen]);

        if (!isOpen || !user) return null;

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>{isAdmin ? 'Adaugă problemă de bac' : 'Sugerează o problemă de bac'}</h2>
                        <button className="modal-close" onClick={onClose}>×</button>
                    </div>
                    
                    {!isAdmin && (
                        <div className="info-message" style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#e3f2fd', borderRadius: '4px', color: '#1976d2', fontSize: '14px' }}>
                            <strong>Notă:</strong> Ca utilizator non-admin, poți doar să sugerezi probleme. Sugestiile tale vor fi trimise prin email administratorilor.
                        </div>
                    )}
                    
                    {!isAdmin && (
                        <div className="info-message" style={{ 
                            padding: '12px', 
                            marginBottom: '16px', 
                            backgroundColor: '#e3f2fd', 
                            borderRadius: '4px',
                            color: '#1976d2',
                            fontSize: '14px'
                        }}>
                            <strong>Notă:</strong> Ca utilizator non-admin, poți doar să sugerezi probleme. Sugestiile tale vor fi trimise prin email administratorilor pentru revizuire și adăugare în baza de date.
                        </div>
                    )}
                    
                    {addError && (
                        <div className="error-message">
                            Eroare la salvarea problemei: {addError}
                        </div>
                    )}
                    
                    {/* Email Status Logs */}
                    {emailLogs.length > 0 && (
                        <div style={{ 
                            marginBottom: '16px',
                            maxHeight: '200px',
                            overflowY: 'auto',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            backgroundColor: '#fafafa'
                        }}>
                            {emailLogs.map((log, index) => (
                                <div 
                                    key={index}
                                    style={{ 
                                        padding: '8px 12px',
                                        borderBottom: index < emailLogs.length - 1 ? '1px solid #e0e0e0' : 'none',
                                        fontSize: '12px',
                                        color: log.type === 'success' ? '#2e7d32' : 
                                               log.type === 'error' ? '#c62828' : '#424242',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span style={{ 
                                        fontWeight: 'bold',
                                        fontSize: '14px'
                                    }}>
                                        {log.type === 'success' ? '✓' : log.type === 'error' ? '✗' : '⟳'}
                                    </span>
                                    <span>{log.message}</span>
                                    <span style={{ 
                                        marginLeft: 'auto',
                                        color: '#9e9e9e',
                                        fontSize: '11px'
                                    }}>
                                        {log.timestamp.toLocaleTimeString('ro-RO')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {emailStatus === 'success' && (
                        <div className="success-message" style={{ 
                            padding: '12px', 
                            marginBottom: '16px', 
                            backgroundColor: '#e8f5e9', 
                            borderRadius: '4px',
                            color: '#2e7d32',
                            fontSize: '14px'
                        }}>
                            ✓ Sugestia ta a fost trimisă cu succes! Administratorii vor revizui problema și o vor adăuga în baza de date dacă este aprobată.
                        </div>
                    )}
                    
                    {emailStatus === 'error' && emailError && (
                        <div className="error-message" style={{ 
                            padding: '12px', 
                            marginBottom: '16px', 
                            backgroundColor: '#ffebee', 
                            borderRadius: '4px',
                            color: '#c62828',
                            fontSize: '14px'
                        }}>
                            Eroare la trimiterea sugestiei: {emailError}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Titlu *</label>
                                <input
                                    type="text"
                                    value={formData.titlu}
                                    onChange={(e) => handleInputChange('titlu', e.target.value)}
                                    required
                                    placeholder="Titlul problemei"
                                    disabled={addStatus === 'loading'}
                                />
                            </div>

                            <div className="form-group">
                                <label>Varianta *</label>
                                <input
                                    type="text"
                                    value={formData.varianta}
                                    onChange={(e) => handleInputChange('varianta', e.target.value)}
                                    placeholder="ex: simulare 2024, vara 2023, sesiune toamna 2022"
                                    required
                                    disabled={addStatus === 'loading'}
                                />
                            </div>

                            <div className="form-group">
                                <label>Descriere</label>
                                <textarea
                                    value={formData.descriere}
                                    onChange={(e) => handleInputChange('descriere', e.target.value)}
                                    placeholder="O scurtă descriere a problemei"
                                    rows={3}
                                    disabled={addStatus === 'loading'}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Dificultate *</label>
                                    <select
                                        value={formData.dificultate}
                                        onChange={(e) => handleInputChange('dificultate', e.target.value)}
                                        required
                                        disabled={addStatus === 'loading'}
                                    >
                                        <option value="ușor">Ușor</option>
                                        <option value="mediu">Mediu</option>
                                        <option value="dificil">Dificil</option>
                                        <option value="concurs">Concurs</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Punctaj total</label>
                                    <input
                                        type="number"
                                        value={formData.punctajTotal}
                                        onChange={(e) => handleInputChange('punctajTotal', parseInt(e.target.value) || 0)}
                                        min="0"
                                        placeholder="Punctaj total"
                                        disabled={addStatus === 'loading'}
                                    />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Conținut/Enunț *</label>
                                <textarea
                                    value={formData.continut}
                                    onChange={(e) => handleInputChange('continut', e.target.value)}
                                    required
                                    placeholder="Enunțul problemei cu formule LaTeX (folosește $...$ pentru formule)"
                                    rows={6}
                                    disabled={addStatus === 'loading'}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Formule</label>
                                <textarea
                                    value={formData.formule.join('\n')}
                                    onChange={(e) => handleInputChange('formule', e.target.value.split('\n'))}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.stopPropagation();
                                        }
                                    }}
                                    placeholder="Formulele necesare (câte una pe rând)"
                                    rows={3}
                                    disabled={addStatus === 'loading'}
                                    style={{ whiteSpace: 'pre-wrap' }}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Date/Variabile</label>
                                <div className="date-pairs-container">
                                    {datePairs.map((pair, index) => (
                                        <div key={index} className="date-pair-row">
                                            <input
                                                type="text"
                                                value={pair.key}
                                                onChange={(e) => handleDatePairChange(index, 'key', e.target.value)}
                                                placeholder="Nume variabilă (ex: m, v, t)"
                                                disabled={addStatus === 'loading'}
                                            />
                                            <span className="date-pair-separator">=</span>
                                            <input
                                                type="text"
                                                value={pair.value}
                                                onChange={(e) => handleDatePairChange(index, 'value', e.target.value)}
                                                placeholder="Valoare (ex: 5 kg, 10 m/s)"
                                                disabled={addStatus === 'loading'}
                                            />
                                            <button
                                                type="button"
                                                className="remove-date-pair-btn"
                                                onClick={() => removeDatePair(index)}
                                                disabled={datePairs.length === 1 || addStatus === 'loading'}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="add-date-pair-btn"
                                        onClick={addDatePair}
                                        disabled={addStatus === 'loading'}
                                    >
                                        Adaugă variabilă
                                    </button>
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Poze</label>
                                <div 
                                    className="image-upload-area"
                                    onPaste={handlePaste}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        id="image-upload-bac"
                                        style={{ display: 'none' }}
                                        disabled={addStatus === 'loading'}
                                    />
                                    <label htmlFor="image-upload-bac" className="image-upload-label">
                                        <div className="upload-placeholder">
                                            <span>Click, trage sau folosește Ctrl+V pentru a adăuga poze</span>
                                        </div>
                                    </label>
                                    
                                    {formData.poze.length > 0 && (
                                        <div className="uploaded-images">
                                            {formData.poze.map((image, index) => (
                                                <div key={index} className="image-preview">
                                                    <img src={image} alt={`Preview ${index + 1}`} />
                                                    <button
                                                        type="button"
                                                        className="remove-image"
                                                        onClick={() => removeImage(index)}
                                                        disabled={addStatus === 'loading'}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Cerințe (subpuncte)</label>
                                <div className="subpuncte-container">
                                    {formData.subpuncte.map((subpunct, index) => (
                                        <div key={index} className="subpunct-row">
                                            <div className="subpunct-inputs">
                                                <input
                                                    type="text"
                                                    value={subpunct.cerinta}
                                                    onChange={(e) => handleSubpunctChange(index, 'cerinta', e.target.value)}
                                                    placeholder="Cerință"
                                                    disabled={addStatus === 'loading'}
                                                />
                                                <input
                                                    type="number"
                                                    value={subpunct.punctaj}
                                                    onChange={(e) => handleSubpunctChange(index, 'punctaj', parseInt(e.target.value) || 0)}
                                                    min="1"
                                                    max="10"
                                                    placeholder="Punctaj"
                                                    disabled={addStatus === 'loading'}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="remove-subpunct-btn"
                                                onClick={() => removeSubpunct(index)}
                                                disabled={formData.subpuncte.length === 1 || addStatus === 'loading'}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="add-subpunct-btn"
                                        onClick={addSubpunct}
                                        disabled={addStatus === 'loading'}
                                    >
                                        Adaugă subpunct
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button type="submit" className="btn-primary" disabled={addStatus === 'loading' || emailStatus === 'loading'}>
                                {isAdmin ? (addStatus === 'loading' ? 'Se salvează...' : 'Salvează') : (emailStatus === 'loading' ? 'Se trimite...' : 'Trimite sugestie')}
                            </button>
                            <button type="button" className="btn-secondary" onClick={onClose} disabled={addStatus === 'loading' || emailStatus === 'loading'}>Anulează</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <div className="problems-bac-page">
                <div className="problems-bac-page-inner">
                    <h1 className="problems-bac-page-title">Probleme de Bacalaureat</h1>
                    <p className="problems-bac-page-subtitle">
                        Probleme organizate pe variante de examen din diferiți ani
                    </p>

                    {/* Search and Filters */}
                    <div className="problems-page-filters">
                        <div className="filters-row">
                            <form onSubmit={handleSearchSubmit} className="search-container">
                                <span className="search-icon"><SearchIcon /></span>
                                <input
                                    type="text"
                                    placeholder="Caută după titlu, ID sau număr..."
                                    className="search-input"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </form>
                            <div className="select-container">
                                <select
                                    className="filter-select"
                                    value={selectedDifficulty}
                                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                                >
                                    {difficulties.map((difficulty) => (
                                        <option key={difficulty} value={difficulty}>
                                            {difficulty === "Toate" ? "Toate dificultățile" : `Dificultate: ${difficulty}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Results Header */}
                    <div className="results-header">
                        <p className="results-count">
                            {sortedProblems.length} {sortedProblems.length === 1 ? 'problemă găsită' : 'probleme găsite'}
                        </p>
                        <select
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Cele mai noi</option>
                            <option value="oldest">Cele mai vechi</option>
                            <option value="difficulty-asc">Dificultate (crescător)</option>
                            <option value="difficulty-desc">Dificultate (descrescător)</option>
                        </select>
                    </div>

                    {status === 'loading' && (
                        <div className="problems-loading">Se încarcă problemele...</div>
                    )}

                    {status === 'succeeded' && Object.keys(problemsByVariant).length === 0 && (
                        <div className="no-results">
                            <h3>Nu există probleme de bac disponibile</h3>
                            <p>Problemele vor fi adăugate în curând.</p>
                        </div>
                    )}

                    {status === 'succeeded' && Object.keys(problemsByVariant).length > 0 && (
                        <div className="variants-container">
                            {Object.entries(problemsByVariant).map(([variant, problems]) => {
                                const isExpanded = expandedVariants[variant] !== false;
                                return (
                                    <div key={variant} className="variant-section">
                                        <button
                                            className="variant-header"
                                            onClick={() => toggleVariant(variant)}
                                            aria-expanded={isExpanded}
                                        >
                                            <div className="variant-header-content">
                                                <h2 className="variant-title">{formatVariantName(variant)}</h2>
                                                <span className="variant-count">
                                                    {problems.length} {problems.length === 1 ? 'problemă' : 'probleme'}
                                                </span>
                                            </div>
                                            <div className="variant-toggle">
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </button>
                                        
                                        {isExpanded && (
                                            <div className="variant-problems">
                                                <div className="problems-grid">
                                                    {problems.map((problem) => (
                                                        <ProblemCard
                                                            key={problem.id}
                                                            problem={problem}
                                                            isFavorite={favorites.includes(problem.id)}
                                                            onToggleFavorite={toggleFavorite}
                                                            completionPercent={getProblemCompletion(problem)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {user && (
                        <button 
                            className="fab-add-problem"
                            onClick={() => setShowAddModal(true)}
                            title={isAdmin ? "Adaugă o problemă nouă" : "Sugerează o problemă"}
                        >
                            <Plus size={24} />
                        </button>
                    )}

                    <AddProblemModal 
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default ProblemeBac;
