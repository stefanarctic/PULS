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
import { Plus } from 'lucide-react';
import { addProblem, clearAddStatus } from '../../features/problems/problemsSlice';
import { sendProblemSuggestion } from '../../lib/emailService';
import SEO from '../SEO';
import '../../scss/components/_probleme-bac.scss';
import { useI18n } from '../../i18n/LanguageContext';
import { useProblemEnById } from '../../hooks/useProblemEnById';
import { mergeProblemWithEnDoc, PROBLEM_TRANSLATION_VERSION } from '../../lib/deeplProblemTranslate';

function bacSubjectRoman(num) {
    return num === 1 ? 'I' : num === 2 ? 'II' : num === 3 ? 'III' : String(num);
}

function translateBacSession(sessionKey, t) {
    const k = (sessionKey || '').toLowerCase();
    if (k === 'simulare') return t('bacProblemsPage.sessionSimulare', 'Simulare');
    if (k === 'model') return t('bacProblemsPage.sessionModel', 'Model');
    if (k === 'bac') return t('bacProblemsPage.sessionBac', 'Bac');
    return sessionKey;
}

function translateBacSubjectArea(area, t) {
    if (!area) return '';
    return t(`bacProblemsPage.categoriesData.${area}`, area);
}

// Icon components
const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </svg>
);

// Helper functions for variant sorting
const extractYear = (variant) => {
    const match = variant.match(/(\d{4})/);
    return match ? parseInt(match[1]) : 0;
};

const getVariantType = (variant, metadata) => {
    const lower = (variant || '').toLowerCase();
    const sourceLower = (metadata?.source || '').toLowerCase();
    const combined = lower + ' ' + sourceLower;
    
    if (combined.includes('simulare')) return 'simulare';
    if (combined.includes('model')) return 'model';
    return 'bac';
};

const getSubjectNumber = (problem) => {
    // Try metadata.subjectNumber first
    if (problem.metadata?.subjectNumber) {
        return problem.metadata.subjectNumber;
    }
    // Try to extract from titlu (e.g., "Sub II" or "Sub III" or "Problema II" for backward compatibility)
    const titlu = problem.titlu || '';
    const match = titlu.match(/(?:Sub|Problema)\s+(I{1,3})/i);
    if (match) {
        const roman = match[1];
        return roman === 'I' ? 1 : roman === 'II' ? 2 : roman === 'III' ? 3 : null;
    }
    // Try to extract from filename or source
    const source = problem.metadata?.source || '';
    const subMatch = source.match(/sub(\d)/i);
    if (subMatch) {
        return parseInt(subMatch[1]);
    }
    return null;
};

const getSubjectArea = (problem) => {
    // Try metadata.subjectArea first
    if (problem.metadata?.subjectArea) {
        return problem.metadata.subjectArea;
    }
    // Try to extract from titlu
    const titlu = problem.titlu || '';
    if (titlu.includes('Mecanică') || titlu.includes('Mecanic')) return 'Mecanică';
    if (titlu.includes('Termodinamică') || titlu.includes('Termodinamic')) return 'Termodinamică';
    if (titlu.includes('Optică') || titlu.includes('Optic')) return 'Optică';
    if (titlu.includes('Curent continuu') || titlu.includes('Electric')) return 'Curent continuu';
    return null;
};

const ProblemeBac = () => {
    const navigate = useNavigate();
    const { lang, t, localizedPath } = useI18n();
    const location = useLocation();
    const dispatch = useDispatch();
    const { value: problemeData, status } = useSelector(state => state.problems);
    const { addStatus, addError } = useSelector(state => state.problems);
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [favorites, setFavorites] = useState([]);
    // Restore filters from sessionStorage only if coming back from a problem
    const getStoredFilters = () => {
        try {
            const shouldRestore = sessionStorage.getItem('restoreBacFilters');
            if (shouldRestore === 'true') {
                const stored = sessionStorage.getItem('bacFilters');
                if (stored) {
                    // Clear the flag after reading
                    sessionStorage.removeItem('restoreBacFilters');
                    return JSON.parse(stored);
                }
            }
        } catch (e) {
            console.error('Error loading filters from sessionStorage:', e);
        }
        return null;
    };

    const storedFilters = getStoredFilters();
    const [searchQuery, setSearchQuery] = useState(storedFilters?.searchQuery || "");
    const [selectedSubject, setSelectedSubject] = useState(storedFilters?.selectedSubject || "Toate");
    const [selectedYear, setSelectedYear] = useState(storedFilters?.selectedYear || "Toate");
    const [selectedSession, setSelectedSession] = useState(storedFilters?.selectedSession || "Toate");
    const [selectedCategory, setSelectedCategory] = useState(storedFilters?.selectedCategory || "Toate");
    const [sortBy, setSortBy] = useState(storedFilters?.sortBy || "newest");
    const [showAddModal, setShowAddModal] = useState(false);
    const [pendingUrlData, setPendingUrlData] = useState(null);
    const { solvedProblems } = useSolvedProblems();

    // Save filters to sessionStorage whenever they change (for back navigation)
    useEffect(() => {
        const filters = {
            searchQuery,
            selectedSubject,
            selectedYear,
            selectedSession,
            selectedCategory,
            sortBy
        };
        try {
            sessionStorage.setItem('bacFilters', JSON.stringify(filters));
        } catch (e) {
            console.error('Error saving filters to sessionStorage:', e);
        }
    }, [searchQuery, selectedSubject, selectedYear, selectedSession, selectedCategory, sortBy]);

    // Function to save filters before navigating to a problem
    const saveFiltersBeforeNavigate = () => {
        try {
            sessionStorage.setItem('bacFilters', JSON.stringify({
                searchQuery,
                selectedSubject,
                selectedYear,
                selectedSession,
                selectedCategory,
                sortBy
            }));
            sessionStorage.setItem('restoreBacFilters', 'true');
        } catch (e) {
            console.error('Error saving filters:', e);
        }
    };

    // Filter only Bac problems
    const bacProblems = useMemo(() => {
        return problemeData.filter(problem => 
            problem.categorie === 'Bac' || 
            (problem.categorie && normalizeString(problem.categorie).includes('bac'))
        );
    }, [problemeData]);

    // Extract available years, sessions, subjects and categories from problems
    const availableYears = useMemo(() => {
        const years = new Set();
        bacProblems.forEach(problem => {
            const year = problem.metadata?.year || extractYear(problem.varianta || '');
            if (year > 0) {
                years.add(year);
            }
        });
        return Array.from(years).sort((a, b) => b - a); // Newest first
    }, [bacProblems]);

    const availableSessions = useMemo(() => {
        const sessions = new Set();
        bacProblems.forEach(problem => {
            const session = problem.metadata?.session || getVariantType(problem.varianta || '', problem.metadata);
            if (session) {
                sessions.add(session);
            }
        });
        return Array.from(sessions).sort();
    }, [bacProblems]);

    const availableSubjects = useMemo(() => {
        const subjects = new Set();
        bacProblems.forEach(problem => {
            const subjectNum = getSubjectNumber(problem);
            if (subjectNum) {
                subjects.add(subjectNum);
            }
        });
        return Array.from(subjects).sort((a, b) => a - b);
    }, [bacProblems]);

    const availableCategories = useMemo(() => {
        const categories = new Set();
        bacProblems.forEach(problem => {
            const category = getSubjectArea(problem);
            if (category) {
                categories.add(category);
            }
        });
        return Array.from(categories).sort();
    }, [bacProblems]);

    // Filter problems by search, subject, year, session and category
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

            if (selectedSubject !== "Toate") {
                const subjectNum = getSubjectNumber(problem);
                const selectedNum = parseInt(selectedSubject);
                if (subjectNum !== selectedNum) {
                    return false;
                }
            }

            if (selectedYear !== "Toate") {
                const problemYear = problem.metadata?.year || extractYear(problem.varianta || '');
                if (problemYear !== parseInt(selectedYear)) {
                    return false;
                }
            }

            if (selectedSession !== "Toate") {
                const problemSession = problem.metadata?.session || getVariantType(problem.varianta || '', problem.metadata);
                if (problemSession !== selectedSession.toLowerCase()) {
                    return false;
                }
            }

            if (selectedCategory !== "Toate") {
                const category = getSubjectArea(problem);
                if (!category || normalizeString(category) !== normalizeString(selectedCategory)) {
                    return false;
                }
            }

            return true;
        });
    }, [bacProblems, searchQuery, selectedSubject, selectedYear, selectedSession, selectedCategory]);

    // Sort problems
    const sortedProblems = useMemo(() => {
        const problems = [...filteredBacProblems];
        switch (sortBy) {
            case "newest":
                return problems.sort((a, b) => {
                    const yearA = a.metadata?.year || extractYear(a.varianta || '') || 0;
                    const yearB = b.metadata?.year || extractYear(b.varianta || '') || 0;
                    if (yearB !== yearA) return yearB - yearA;
                    return b.index - a.index;
                });
            case "oldest":
                return problems.sort((a, b) => {
                    const yearA = a.metadata?.year || extractYear(a.varianta || '') || 0;
                    const yearB = b.metadata?.year || extractYear(b.varianta || '') || 0;
                    if (yearA !== yearB) return yearA - yearB;
                    return a.index - b.index;
                });
            case "subject-asc":
                return problems.sort((a, b) => {
                    const subA = getSubjectNumber(a) || 0;
                    const subB = getSubjectNumber(b) || 0;
                    if (subA !== subB) return subA - subB;
                    return a.index - b.index;
                });
            case "subject-desc":
                return problems.sort((a, b) => {
                    const subA = getSubjectNumber(a) || 0;
                    const subB = getSubjectNumber(b) || 0;
                    if (subA !== subB) return subB - subA;
                    return a.index - b.index;
                });
            default:
                return problems.sort((a, b) => a.index - b.index);
        }
    }, [filteredBacProblems, sortBy]);

    const bacProblemIds = useMemo(
        () => sortedProblems.map((p) => p.id).filter(Boolean),
        [sortedProblems]
    );
    const enByIdBac = useProblemEnById(bacProblemIds, lang, PROBLEM_TRANSLATION_VERSION);
    const sortedProblemsForCards = useMemo(() => {
        if (lang !== 'en') return sortedProblems;
        return sortedProblems.map((p) => mergeProblemWithEnDoc(p, enByIdBac[p.id]));
    }, [lang, sortedProblems, enByIdBac]);


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
            alert(t('bacProblemsPage.favoriteLogin', 'Autentifică-te pentru a salva probleme la favorite.'));
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


    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const query = searchQuery.trim();
            const problemIndex = parseInt(query);
            if (!isNaN(problemIndex)) {
                const problem = bacProblems.find(p => p.index === problemIndex);
                if (problem) {
                    // Save filters before navigating
                    try {
                        sessionStorage.setItem('bacFilters', JSON.stringify({
                            searchQuery,
                            selectedSubject,
                            selectedYear,
                            selectedSession,
                            selectedCategory,
                            sortBy
                        }));
                        sessionStorage.setItem('restoreBacFilters', 'true');
                    } catch (e) {
                        console.error('Error saving filters:', e);
                    }
                    navigate(localizedPath(`/probleme/${problemIndex}`));
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
                categorie: 'Bac',
                continut: decodeURIComponent(urlParams.get('continut') || ''),
                punctajTotal: parseInt(urlParams.get('punctajTotal')) || 0,
                metadata: {
                    year: urlParams.get('an') ? parseInt(urlParams.get('an')) : null,
                    subjectNumber: urlParams.get('subiect') ? parseInt(urlParams.get('subiect')) : null,
                    subjectArea: urlParams.get('categorie') || null,
                    session: urlParams.get('sesiune') || null
                }
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


    // AddProblemModal for Bac page
    const AddProblemModal = ({ isOpen, onClose }) => {
        const [formData, setFormData] = useState({
            titlu: '',
            descriere: '',
            categorie: 'Bac',
            subiect: '',
            an: '',
            sesiune: '',
            subjectArea: '',
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
            
            // Calculează următorul index disponibil pentru problemele de BAC (>= 1000)
            const allIndexes = new Set(problemeData.map(p => p.index).filter(idx => idx !== undefined && idx !== null));
            
            // Găsește cel mai mic index disponibil >= 1000
            let nextIndex = 1000;
            while (allIndexes.has(nextIndex)) {
                nextIndex++;
            }
            
            const problemData = {
                titlu: formData.titlu,
                descriere: formData.descriere,
                categorie: 'Bac',
                continut: formData.continut,
                formule: formData.formule,
                date: dateObject,
                subpuncte: formData.subpuncte.map((subpunct, index) => ({
                    id: `${index + 1}${String.fromCharCode(97 + index)}`,
                    cerinta: subpunct.cerinta,
                    punctaj: subpunct.punctaj
                })),
                index: nextIndex,
                creator: '',
                punctajTotal: formData.punctajTotal,
                createdAt: new Date().toISOString(),
                poze: formData.poze,
                metadata: {
                    year: formData.an ? parseInt(formData.an) : null,
                    subjectNumber: formData.subiect ? parseInt(formData.subiect) : null,
                    subjectArea: formData.subjectArea || null,
                    session: formData.sesiune || null
                }
            };
            
            if (isAdmin) {
                try {
                    await dispatch(addProblem(problemData)).unwrap();
                    setFormData({
                        titlu: '',
                        descriere: '',
                        categorie: 'Bac',
                        subiect: '',
                        an: '',
                        sesiune: '',
                        subjectArea: '',
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
                setEmailLogs([{ type: 'info', message: t('problemsPage.suggestion.preparing', 'Pregătire sugestie problemă...'), timestamp: new Date() }]);
                try {
                    setEmailLogs(prev => [...prev, { type: 'info', message: t('problemsPage.suggestion.initializingEmail', 'Se inițializează serviciul de email...'), timestamp: new Date() }]);
                    const result = await sendProblemSuggestion(problemData, user);
                    setEmailLogs(prev => [...prev, { 
                        type: 'success', 
                        message: t('problemsPage.suggestion.sentDuration', 'Sugestia a fost trimisă cu succes! Durata: {duration}ms', { duration: result.duration || 'N/A' }), 
                        timestamp: new Date() 
                    }]);
                    setEmailStatus('success');
                    setFormData({
                        titlu: '',
                        descriere: '',
                        categorie: 'Bac',
                        subiect: '',
                        an: '',
                        sesiune: '',
                        subjectArea: '',
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
                        message: t('problemsPage.suggestion.errorPrefix', 'Eroare: {message}', { message: error.message }), 
                        timestamp: new Date() 
                    }]);
                    setEmailStatus('error');
                    setEmailError(error.message || t('bacProblemsPage.genericSuggestError', 'A apărut o eroare la trimiterea sugestiei. Te rugăm să încerci din nou.'));
                }
            }
        };

        useEffect(() => {
            if (isOpen) {
                // Check if there's prefill data from URL
                if (window.__prefillProblemData) {
                    const prefillData = window.__prefillProblemData;
                    console.log('📝 [Modal] Populating form with URL data:', prefillData);
                    
                    // Extract data from prefill or metadata
                    const metadata = prefillData.metadata || {};
                    const year = metadata.year || extractYear(prefillData.varianta || '') || '';
                    const subjectNum = metadata.subjectNumber || getSubjectNumber(prefillData) || '';
                    const session = metadata.session || getVariantType(prefillData.varianta || '', metadata) || '';
                    const subjectArea = metadata.subjectArea || getSubjectArea(prefillData) || '';
                    
                    // Set form data
                    setFormData({
                        titlu: prefillData.titlu || '',
                        descriere: prefillData.descriere || '',
                        categorie: 'Bac',
                        subiect: subjectNum ? String(subjectNum) : '',
                        an: year ? String(year) : '',
                        sesiune: session || '',
                        subjectArea: subjectArea || '',
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
                        subiect: '',
                        an: '',
                        sesiune: '',
                        subjectArea: '',
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
                    subiect: '',
                    an: '',
                    sesiune: '',
                    subjectArea: '',
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
                        <h2>{isAdmin ? t('bacProblemsPage.modalTitleAdmin', 'Adaugă problemă de bac') : t('bacProblemsPage.modalTitleSuggest', 'Sugerează o problemă de bac')}</h2>
                        <button type="button" className="modal-close" onClick={onClose}>×</button>
                    </div>
                    
                    {!isAdmin && (
                        <div className="info-message" style={{ 
                            padding: '12px', 
                            marginBottom: '16px', 
                            backgroundColor: '#e3f2fd', 
                            borderRadius: '4px',
                            color: '#1976d2',
                            fontSize: '14px'
                        }}>
                            <strong>{t('problemsPage.suggestion.notePrefix', 'Notă:')}</strong>{' '}
                            {t('bacProblemsPage.modalNoteNonAdmin', 'Ca utilizator non-admin, poți doar să sugerezi probleme. Sugestiile tale vor fi trimise prin email administratorilor pentru revizuire și adăugare în baza de date.')}
                        </div>
                    )}
                    
                    {addError && (
                        <div className="error-message">
                            {t('bacProblemsPage.saveError', 'Eroare la salvarea problemei: {error}', { error: addError })}
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
                                        {log.timestamp.toLocaleTimeString(lang === 'en' ? 'en-GB' : 'ro-RO')}
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
                            ✓ {t('problemsPage.suggestion.successInline', 'Sugestia ta a fost trimisă cu succes! Administratorii vor revizui problema și o vor adăuga în baza de date dacă este aprobată.')}
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
                            {t('problemsPage.suggestion.sendError', 'Eroare la trimiterea sugestiei: {error}', { error: emailError })}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="modal-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>{t('problemsPage.suggestion.modal.titleLabel', 'Titlu *')}</label>
                                <input
                                    type="text"
                                    value={formData.titlu}
                                    onChange={(e) => handleInputChange('titlu', e.target.value)}
                                    required
                                    placeholder={t('problemsPage.suggestion.modal.titlePlaceholder', 'Titlul problemei')}
                                    disabled={addStatus === 'loading'}
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('problemsPage.suggestion.modal.descriptionLabel', 'Descriere')}</label>
                                <textarea
                                    value={formData.descriere}
                                    onChange={(e) => handleInputChange('descriere', e.target.value)}
                                    placeholder={t('problemsPage.suggestion.modal.descriptionPlaceholder', 'O scurtă descriere a problemei')}
                                    rows={3}
                                    disabled={addStatus === 'loading'}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('bacProblemsPage.modalSubjectSelectLabel', 'Subiect *')}</label>
                                    <select
                                        value={formData.subiect}
                                        onChange={(e) => handleInputChange('subiect', e.target.value)}
                                        required
                                        disabled={addStatus === 'loading'}
                                    >
                                        <option value="">{t('bacProblemsPage.subjectPlaceholder', 'Selectează subiectul')}</option>
                                        <option value="1">{t('bacProblemsPage.subjectPaper', 'Subiectul {roman}', { roman: bacSubjectRoman(1) })}</option>
                                        <option value="2">{t('bacProblemsPage.subjectPaper', 'Subiectul {roman}', { roman: bacSubjectRoman(2) })}</option>
                                        <option value="3">{t('bacProblemsPage.subjectPaper', 'Subiectul {roman}', { roman: bacSubjectRoman(3) })}</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>{t('bacProblemsPage.modalYearLabel', 'An *')}</label>
                                    <input
                                        type="number"
                                        value={formData.an}
                                        onChange={(e) => handleInputChange('an', e.target.value)}
                                        placeholder={t('bacProblemsPage.yearPlaceholder', 'ex: 2024')}
                                        required
                                        min="2000"
                                        max="2100"
                                        disabled={addStatus === 'loading'}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('bacProblemsPage.modalSessionLabel', 'Sesiune *')}</label>
                                    <select
                                        value={formData.sesiune}
                                        onChange={(e) => handleInputChange('sesiune', e.target.value)}
                                        required
                                        disabled={addStatus === 'loading'}
                                    >
                                        <option value="">{t('bacProblemsPage.sessionPlaceholder', 'Selectează sesiunea')}</option>
                                        <option value="bac">{translateBacSession('bac', t)}</option>
                                        <option value="model">{translateBacSession('model', t)}</option>
                                        <option value="simulare">{translateBacSession('simulare', t)}</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>{t('bacProblemsPage.modalCategorySelectLabel', 'Categorie')}</label>
                                    <select
                                        value={formData.subjectArea}
                                        onChange={(e) => handleInputChange('subjectArea', e.target.value)}
                                        disabled={addStatus === 'loading'}
                                    >
                                        <option value="">{t('bacProblemsPage.categoryPlaceholder', 'Selectează categoria')}</option>
                                        <option value="Mecanică">{translateBacSubjectArea('Mecanică', t)}</option>
                                        <option value="Termodinamică">{translateBacSubjectArea('Termodinamică', t)}</option>
                                        <option value="Optică">{translateBacSubjectArea('Optică', t)}</option>
                                        <option value="Curent continuu">{translateBacSubjectArea('Curent continuu', t)}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>{t('problemsPage.suggestion.modal.totalScoreLabel', 'Punctaj total')}</label>
                                    <input
                                        type="number"
                                        value={formData.punctajTotal}
                                        onChange={(e) => handleInputChange('punctajTotal', parseInt(e.target.value) || 0)}
                                        min="0"
                                        placeholder={t('problemsPage.suggestion.modal.totalScorePlaceholder', 'Punctaj total')}
                                        disabled={addStatus === 'loading'}
                                    />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>{t('problemsPage.suggestion.modal.contentLabel', 'Conținut/Enunț *')}</label>
                                <textarea
                                    value={formData.continut}
                                    onChange={(e) => handleInputChange('continut', e.target.value)}
                                    required
                                    placeholder={t('problemsPage.suggestion.modal.contentPlaceholder', 'Enunțul problemei cu formule LaTeX (folosește $...$ pentru formule)')}
                                    rows={6}
                                    disabled={addStatus === 'loading'}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>{t('problemsPage.suggestion.modal.formulasLabel', 'Formule')}</label>
                                <textarea
                                    value={formData.formule.join('\n')}
                                    onChange={(e) => handleInputChange('formule', e.target.value.split('\n'))}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.stopPropagation();
                                        }
                                    }}
                                    placeholder={t('problemsPage.suggestion.modal.formulasPlaceholder', 'Formulele necesare (câte una pe rând)')}
                                    rows={3}
                                    disabled={addStatus === 'loading'}
                                    style={{ whiteSpace: 'pre-wrap' }}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>{t('problemsPage.suggestion.modal.dataLabel', 'Date/Variabile')}</label>
                                <div className="date-pairs-container">
                                    {datePairs.map((pair, index) => (
                                        <div key={index} className="date-pair-row">
                                            <input
                                                type="text"
                                                value={pair.key}
                                                onChange={(e) => handleDatePairChange(index, 'key', e.target.value)}
                                                placeholder={t('problemsPage.suggestion.modal.variableNamePlaceholder', 'Nume variabilă (ex: m, v, t)')}
                                                disabled={addStatus === 'loading'}
                                            />
                                            <span className="date-pair-separator">=</span>
                                            <input
                                                type="text"
                                                value={pair.value}
                                                onChange={(e) => handleDatePairChange(index, 'value', e.target.value)}
                                                placeholder={t('problemsPage.suggestion.modal.variableValuePlaceholder', 'Valoare (ex: 5 kg, 10 m/s)')}
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
                                        {t('problemsPage.suggestion.modal.addVariable', 'Adaugă variabilă')}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>{t('problemsPage.suggestion.modal.imagesLabel', 'Poze')}</label>
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
                                            <span>{t('problemsPage.suggestion.modal.imagesUploadHint', 'Click, trage sau folosește Ctrl+V pentru a adăuga poze')}</span>
                                        </div>
                                    </label>
                                    
                                    {formData.poze.length > 0 && (
                                        <div className="uploaded-images">
                                            {formData.poze.map((image, index) => (
                                                <div key={index} className="image-preview">
                                                    <img src={image} alt={t('problemsPage.suggestion.modal.previewAlt', 'Previzualizare {n}', { n: index + 1 })} />
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
                                <label>{t('problemsPage.suggestion.modal.subproblemsLabel', 'Cerințe (subpuncte)')}</label>
                                <div className="subpuncte-container">
                                    {formData.subpuncte.map((subpunct, index) => (
                                        <div key={index} className="subpunct-row">
                                            <div className="subpunct-inputs">
                                                <input
                                                    type="text"
                                                    value={subpunct.cerinta}
                                                    onChange={(e) => handleSubpunctChange(index, 'cerinta', e.target.value)}
                                                    placeholder={t('problemsPage.suggestion.modal.subproblemRequirement', 'Cerință')}
                                                    disabled={addStatus === 'loading'}
                                                />
                                                <input
                                                    type="number"
                                                    value={subpunct.punctaj}
                                                    onChange={(e) => handleSubpunctChange(index, 'punctaj', parseInt(e.target.value) || 0)}
                                                    min="1"
                                                    max="10"
                                                    placeholder={t('problemsPage.suggestion.modal.subproblemScore', 'Punctaj')}
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
                                        {t('problemsPage.suggestion.modal.addSubproblem', 'Adaugă subpunct')}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button type="submit" className="btn-primary" disabled={addStatus === 'loading' || emailStatus === 'loading'}>
                                {isAdmin ? (addStatus === 'loading' ? t('problemsPage.suggestion.modal.submitAdminLoading', 'Se salvează...') : t('problemsPage.suggestion.modal.submitAdmin', 'Salvează')) : (emailStatus === 'loading' ? t('problemsPage.suggestion.modal.submitSuggestLoading', 'Se trimite...') : t('problemsPage.suggestion.modal.submitSuggest', 'Trimite sugestie'))}
                            </button>
                            <button type="button" className="btn-secondary" onClick={onClose} disabled={addStatus === 'loading' || emailStatus === 'loading'}>{t('problemsPage.suggestion.modal.cancel', 'Anulează')}</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // Generate structured data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Probleme BAC Fizică - PULS",
        "description": "Colecție completă de probleme de fizică din examenele de bacalaureat. Probleme BAC organizate pe ani, sesiuni și subiecte. Rezolvări pas cu pas și autoevaluare cu feedback AI.",
        "url": "https://puls-fizica.ro/probleme/bac",
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": sortedProblems.length,
            "itemListElement": sortedProblems.slice(0, 10).map((problem, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "EducationalContent",
                    "@id": `https://puls-fizica.ro/probleme/${problem.index}`,
                    "name": problem.titlu,
                    "description": problem.descriere || problem.titlu,
                    "educationalLevel": "High School",
                    "learningResourceType": "Exam Problem",
                    "subject": "Physics",
                    "about": problem.metadata?.subjectArea || problem.categorie,
                    "educationalUse": "Exam Preparation",
                    "audience": {
                        "@type": "EducationalAudience",
                        "educationalRole": "Student"
                    },
                    "dateCreated": problem.metadata?.year ? `${problem.metadata.year}-01-01` : undefined
                }
            }))
        },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Acasă",
                    "item": "https://puls-fizica.ro/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Probleme",
                    "item": "https://puls-fizica.ro/probleme"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "Probleme BAC",
                    "item": "https://puls-fizica.ro/probleme/bac"
                }
            ]
        }
    };

    return (
        <Layout>
            <SEO
                title={t('bacProblemsPage.seoTitle', 'Probleme BAC Fizică | Examen Bacalaureat - Rezolvări Complete | PULS')}
                description={t(
                    'bacProblemsPage.seoDescription',
                    `Probleme de fizică din examenele de bacalaureat. Colecție completă de probleme BAC organizate pe ani, sesiuni și subiecte. Rezolvări pas cu pas și autoevaluare cu feedback AI. Peste ${sortedProblems.length} probleme BAC disponibile.`,
                )}
                keywords={t(
                    'bacProblemsPage.seoKeywords',
                    'probleme BAC fizică, examen bacalaureat fizică, probleme BAC rezolvate, fizică BAC, subiecte BAC fizică, variante BAC fizică',
                )}
                image="/res/icons/New-logo.png"
                structuredData={structuredData}
            />
            <div className="problems-bac-page">
                <div className="problems-bac-page-inner">
                    {/* Header Section */}
                    <div className="problems-bac-header">
                        <div className="header-content">
                            <h1 className="problems-bac-page-title">{t('bacProblemsPage.title', 'Probleme de Bacalaureat')}</h1>
                            <p className="problems-bac-page-subtitle">
                                {t('bacProblemsPage.subtitle', 'Probleme organizate pe variante de examen din diferiți ani')}
                            </p>
                        </div>
                    </div>

                    {/* Search and Filters Section */}
                    <div className="problems-bac-filters-section">
                        <form onSubmit={handleSearchSubmit} className="search-wrapper">
                            <div className="search-container">
                                <span className="search-icon"><SearchIcon /></span>
                                <input
                                    type="text"
                                    placeholder={t('bacProblemsPage.searchPlaceholder', 'Caută după titlu, ID sau număr...')}
                                    className="search-input"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </form>
                        
                        <div className="filters-wrapper">
                            <div className="filter-group">
                                <label className="filter-label">{t('bacProblemsPage.filterSubject', 'Subiect')}</label>
                                <select
                                    className="filter-select"
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                >
                                    <option value="Toate">{t('bacProblemsPage.allSubjects', 'Toate subiectele')}</option>
                                    {availableSubjects.map((subjectNum) => (
                                        <option key={subjectNum} value={subjectNum.toString()}>
                                            {t('bacProblemsPage.subjectPaper', 'Subiectul {roman}', {
                                                roman: bacSubjectRoman(subjectNum),
                                            })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="filter-group">
                                <label className="filter-label">{t('bacProblemsPage.filterYear', 'An')}</label>
                                <select
                                    className="filter-select"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    <option value="Toate">{t('bacProblemsPage.allYears', 'Toți anii')}</option>
                                    {availableYears.map((year) => (
                                        <option key={year} value={year.toString()}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="filter-group">
                                <label className="filter-label">{t('bacProblemsPage.filterSession', 'Sesiune')}</label>
                                <select
                                    className="filter-select"
                                    value={selectedSession}
                                    onChange={(e) => setSelectedSession(e.target.value)}
                                >
                                    <option value="Toate">{t('bacProblemsPage.allSessions', 'Toate sesiunile')}</option>
                                    {availableSessions.map((session) => (
                                        <option key={session} value={session}>
                                            {translateBacSession(session, t)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="filter-group">
                                <label className="filter-label">{t('bacProblemsPage.filterCategory', 'Categorie')}</label>
                                <select
                                    className="filter-select"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="Toate">{t('bacProblemsPage.allCategories', 'Toate categoriile')}</option>
                                    {availableCategories.map((category) => (
                                        <option key={category} value={category}>
                                            {translateBacSubjectArea(category, t)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="filter-group">
                                <label className="filter-label">{t('bacProblemsPage.filterSort', 'Sortare')}</label>
                                <select
                                    className="filter-select"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="newest">{t('bacProblemsPage.sortNewest', 'Cele mai noi')}</option>
                                    <option value="oldest">{t('bacProblemsPage.sortOldest', 'Cele mai vechi')}</option>
                                    <option value="subject-asc">{t('bacProblemsPage.sortSubjectAsc', 'Subiect (I → III)')}</option>
                                    <option value="subject-desc">{t('bacProblemsPage.sortSubjectDesc', 'Subiect (III → I)')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="results-count-section">
                        <span className="results-count-badge">
                            {sortedProblems.length === 1
                                ? t('bacProblemsPage.resultsSingle', '{count} problemă găsită', { count: sortedProblems.length })
                                : t('bacProblemsPage.resultsPlural', '{count} probleme găsite', { count: sortedProblems.length })}
                        </span>
                    </div>

                    {/* Loading State */}
                    {status === 'loading' && (
                        <div className="problems-loading">
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                            </div>
                            <p>{t('bacProblemsPage.loading', 'Se încarcă problemele...')}</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {status === 'succeeded' && sortedProblems.length === 0 && (
                        <div className="no-results">
                            <div className="no-results-icon">📚</div>
                            <h3>{t('bacProblemsPage.emptyTitle', 'Nu există probleme de bac disponibile')}</h3>
                            <p>{t('bacProblemsPage.emptySubtitle', 'Problemele vor fi adăugate în curând.')}</p>
                        </div>
                    )}

                    {/* Problems Grid */}
                    {status === 'succeeded' && sortedProblems.length > 0 && (
                        <div className="problems-grid">
                            {sortedProblemsForCards.map((problem) => (
                                <ProblemCard
                                    key={problem.id}
                                    problem={problem}
                                    isFavorite={favorites.includes(problem.id)}
                                    onToggleFavorite={toggleFavorite}
                                    completionPercent={getProblemCompletion(problem)}
                                    onBeforeNavigate={saveFiltersBeforeNavigate}
                                />
                            ))}
                        </div>
                    )}

                    {/* Floating Action Button */}
                    {user && (
                        <button 
                            className="fab-add-problem"
                            onClick={() => setShowAddModal(true)}
                            title={isAdmin ? t('bacProblemsPage.fabAddTitle', 'Adaugă o problemă nouă') : t('bacProblemsPage.fabSuggestTitle', 'Sugerează o problemă')}
                            aria-label={isAdmin ? t('bacProblemsPage.fabAddTitle', 'Adaugă o problemă nouă') : t('bacProblemsPage.fabSuggestTitle', 'Sugerează o problemă')}
                        >
                            <Plus size={24} />
                        </button>
                    )}

                    {/* Add Problem Modal */}
                    <AddProblemModal 
                        isOpen={showAddModal}
                        onClose={() => {
                            // Check if we're on a link with addProblem parameter
                            const urlParams = new URLSearchParams(location.search);
                            if (urlParams.get('addProblem') === '1') {
                                // Clear the custom link and navigate to normal bac problems page
                                navigate(localizedPath('/probleme/bac'));
                            }
                            setShowAddModal(false);
                        }}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default ProblemeBac;
