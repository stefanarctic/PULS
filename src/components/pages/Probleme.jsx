import { useEffect, useState, Fragment, useMemo } from 'react';
import Layout from '../Layout';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// import { problemeData } from '../problemedata';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProblems, addProblem, clearAddStatus, deleteProblem } from '../../features/problems/problemsSlice';
import { Plus, Check, GraduationCap, ExternalLink, ListChecks } from 'lucide-react';
import { normalizeString } from '../../lib/normalizeString';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useSolvedProblems } from '../../hooks/useSolvedProblems';
import { sendProblemSuggestion } from '../../lib/emailService';
import SEO from '../SEO';
import { LocalizedLink as Link, useI18n } from '../../i18n/LanguageContext';

function formatDifficultyLabel(raw, t) {
    if (!raw) return '';
    const n = normalizeString(raw);
    if (n.includes('usor')) return t('problemsPage.difficulty.easy', raw);
    if (n.includes('mediu')) return t('problemsPage.difficulty.medium', raw);
    if (n.includes('dificil')) return t('problemsPage.difficulty.hard', raw);
    if (n.includes('concurs')) return t('problemsPage.difficulty.competition', raw);
    return raw;
}

function formatCategoryFilterLabel(cat, t) {
    const map = {
        Toate: ['problemsPage.categories.all', 'Toate'],
        Mecanică: ['problemsPage.categories.mechanics', 'Mecanică'],
        Oscilații: ['problemsPage.categories.oscillations', 'Oscilații'],
        Unde: ['problemsPage.categories.waves', 'Unde'],
        Lissajous: ['problemsPage.categories.lissajous', 'Lissajous'],
        Seismologie: ['problemsPage.categories.seismology', 'Seismologie'],
    };
    const entry = map[cat];
    return entry ? t(entry[0], entry[1]) : cat;
}

// Icon components
const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15,3 21,3 21,9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

// Problem Card Component
const ProblemCard = ({ problem, isFavorite, onToggleFavorite, completionPercent, onBeforeNavigate }) => {
    const { index, titlu, dificultate, categorie, descriere, solved } = problem;
    const navigate = useNavigate();
    const { localizedPath, t } = useI18n();
    const isPerfectScore = completionPercent === 100;
    const isSolved = solved || isPerfectScore;
    const handleNavigate = () => {
        if (onBeforeNavigate) {
            onBeforeNavigate();
        }
        navigate(localizedPath(`/probleme/${index}`));
    };
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleNavigate();
        }
    };

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
        <div
            className={`problem-card${isSolved ? ' solved' : ''}`}
            onClick={handleNavigate}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={t('problemsPage.card.openAria', `Deschide problema ${titlu}`, { title: titlu })}
        >
            <div className="problem-card-header">
                <div className="problem-card-actions">
                    {isFavorite && (
                        <button
                            title={t('problemsPage.card.removeFavorite', 'Elimină din favorite')}
                            aria-label={t('problemsPage.card.removeFavorite', 'Elimină din favorite')}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onToggleFavorite(problem);
                            }}
                            className="problem-card-favorite-btn is-active"
                        >
                            ★
                        </button>
                    )}
                    {isPerfectScore && (
                        <div
                            className="problem-card-perfect-badge"
                            title={t('problemsPage.card.perfectScoreTooltip', 'Ai obținut scorul maxim la această problemă')}
                        >
                            <span className="problem-card-perfect-icon" aria-hidden="true">
                                <Check size={14} strokeWidth={3} />
                            </span>
                            <span className="problem-card-perfect-text">100%</span>
                        </div>
                    )}
                </div>
                <div className="problem-card-info">
                    <span className="problem-card-id">#{index}</span>
                    <h3 className="problem-card-title">{titlu}</h3>
                    <p className="problem-card-topic">{categorie}</p>
                </div>
                {solved && <div className="problem-card-solved-badge">{t('problemsPage.card.solved', 'Rezolvată')}</div>}
            </div>
            <div className="problem-card-footer">
                <div className={`problem-card-difficulty ${getDifficultyColorClass(dificultate)}`}>
                    {formatDifficultyLabel(dificultate, t)}
                </div>
                <div className="problem-card-link">
                    <span>{t('problemsPage.card.solve', 'Rezolvă')}</span>
                    <ExternalLinkIcon />
                </div>
            </div>
        </div>
    );
};

const PhysicsProblems = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const { lang, t, localizedPath } = useI18n();

    // Restore filters from sessionStorage only if coming back from a problem
    const getStoredFilters = () => {
        try {
            const shouldRestore = sessionStorage.getItem('restoreProblemsFilters');
            if (shouldRestore === 'true') {
                const stored = sessionStorage.getItem('problemsFilters');
                if (stored) {
                    // Clear the flag after reading
                    sessionStorage.removeItem('restoreProblemsFilters');
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
    const [selectedDifficulty, setSelectedDifficulty] = useState(
        params.get("difficulty") || storedFilters?.selectedDifficulty || "Toate"
    );
    const [selectedCategory, setSelectedCategory] = useState(
        params.get("category") || storedFilters?.selectedCategory || "Toate"
    );
    const [sortBy, setSortBy] = useState(storedFilters?.sortBy || "newest");
    
    // Paginare
    const [currentPage, setCurrentPage] = useState(1);
    const problemsPerPage = 8; // Numărul de probleme per pagină

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [pendingUrlData, setPendingUrlData] = useState(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { value: problemeData, status, error } = useSelector(state => state.problems);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const { solvedProblems } = useSolvedProblems();

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
          // Check admin status from DB
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
            alert(t('problemsPage.suggestion.loginRequired', 'Autentifică-te pentru a salva probleme la favorite.'));
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

    // Funcție pentru a verifica dacă query-ul este un ID valid și naviga direct
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const query = searchQuery.trim();
            // Verifică dacă query-ul este un număr și dacă există o problemă cu acel index
            const problemIndex = parseInt(query);
            if (!isNaN(problemIndex)) {
                const problem = problemeData.find(p => p.index === problemIndex);
                if (problem) {
                    saveFiltersBeforeNavigate();
                    navigate(localizedPath(`/probleme/${problemIndex}`));
                    return;
                }
            }
        }
    };

    useEffect(() => {
        // Don't modify URL if we have addProblem parameter
        const urlParams = new URLSearchParams(location.search);
        if (urlParams.get('addProblem') === '1') {
            return; // Keep the addProblem parameters
        }

        const params = new URLSearchParams();

        if (selectedDifficulty && selectedDifficulty !== "Toate") {
            params.set("difficulty", selectedDifficulty);
        }

        navigate({
            pathname: location.pathname,
            search: params.toString(),
        });
    }, [selectedDifficulty, navigate, location.pathname, location.search, localizedPath]);

    // Reset la pagina 1 când se schimbă filtrele
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedDifficulty, selectedCategory, sortBy]);

    // Save filters to sessionStorage whenever they change (for back navigation)
    useEffect(() => {
        const filters = {
            searchQuery,
            selectedDifficulty,
            selectedCategory,
            sortBy
        };
        try {
            sessionStorage.setItem('problemsFilters', JSON.stringify(filters));
        } catch (e) {
            console.error('Error saving filters to sessionStorage:', e);
        }
    }, [searchQuery, selectedDifficulty, selectedCategory, sortBy]);

    // Function to save filters before navigating to a problem
    const saveFiltersBeforeNavigate = () => {
        try {
            sessionStorage.setItem('problemsFilters', JSON.stringify({
                searchQuery,
                selectedDifficulty,
                selectedCategory,
                sortBy
            }));
            sessionStorage.setItem('restoreProblemsFilters', 'true');
        } catch (e) {
            console.error('Error saving filters:', e);
        }
    };

    // Check for addProblem parameter in URL and populate form
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const addProblem = urlParams.get('addProblem');
        
        if (addProblem === '1') {
            console.log('📝 [URL] Detected addProblem parameter in URL');
            
            // Parse problem data from URL immediately
            const problemData = {
                titlu: decodeURIComponent(urlParams.get('titlu') || ''),
                descriere: decodeURIComponent(urlParams.get('descriere') || ''),
                categorie: decodeURIComponent(urlParams.get('categorie') || 'Mecanică'),
                dificultate: decodeURIComponent(urlParams.get('dificultate') || 'ușor'),
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

    const categories = [
        "Toate",
        "Mecanică",
        "Oscilații",
        "Unde",
        "Lissajous",
        "Seismologie",
        // Bac problems are only available on /probleme/bac page
    ];

    const difficulties = ["Toate", "ușor", "mediu", "dificil", "concurs"];

    const isSpecializedPage = location.pathname.includes("/specialized");
    const specializedTopics = ["pendul", "unde", "lissajous", "seism"];

    const relevantProblems = isSpecializedPage
        ? problemeData.filter((problem) =>
            specializedTopics.some(topic =>
                problem.topic.toLowerCase().includes(topic)
            )
        )
        : problemeData;

    // Filter out Bac problems from main problems page (they're only on /probleme/bac)
    const problemsWithoutBac = relevantProblems.filter((problem) => {
        const isBac = problem.categorie === 'Bac' || 
                     (problem.categorie && normalizeString(problem.categorie).includes('bac'));
        return !isBac;
    });

    const filteredProblems = problemsWithoutBac.filter((problem) => {
        if (searchQuery) {
            const query = normalizeString(searchQuery);
            const matchesTitle = normalizeString(problem.titlu).includes(query);
            const matchesCategory = normalizeString(problem.categorie).includes(query);
            const matchesId = problem.id.toString().includes(query);
            const matchesIndex = problem.index.toString().includes(query);
            
            if (!matchesTitle && !matchesCategory && !matchesId && !matchesIndex) {
                return false;
            }
        }

        if (selectedDifficulty !== "Toate" && normalizeString(problem.dificultate) !== normalizeString(selectedDifficulty)) {
            return false;
        }

        if (
            selectedCategory !== "Toate" &&
            !normalizeString(problem.categorie).includes(normalizeString(selectedCategory))
        ) {
            return false;
        }

        return true;
    });

    // Funcție pentru sortarea după dificultate
    const difficultyOrder = { "ușor": 1, "mediu": 2, "dificil": 3, "concurs": 4 };

    // Funcție pentru sortarea problemelor
    const sortProblems = (problems) => {
        switch (sortBy) {
            case "newest":
                // Cele mai noi - sortare descrescătoare după index
                return [...problems].sort((a, b) => b.index - a.index);
            case "oldest":
                // Cele mai vechi - sortare crescătoare după index
                return [...problems].sort((a, b) => a.index - b.index);
            case "difficulty-asc":
                // Dificultate crescătoare (ușor -> mediu -> dificil)
                return [...problems].sort((a, b) => {
                    const orderA = difficultyOrder[a.dificultate] || 0;
                    const orderB = difficultyOrder[b.dificultate] || 0;
                    if (orderA === orderB) {
                        // Dacă dificultatea este aceeași, sortăm după index
                        return a.index - b.index;
                    }
                    return orderA - orderB;
                });
            case "difficulty-desc":
                // Dificultate descrescătoare (dificil -> mediu -> ușor)
                return [...problems].sort((a, b) => {
                    const orderA = difficultyOrder[a.dificultate] || 0;
                    const orderB = difficultyOrder[b.dificultate] || 0;
                    if (orderA === orderB) {
                        // Dacă dificultatea este aceeași, sortăm după index
                        return a.index - b.index;
                    }
                    return orderB - orderA;
                });
            default:
                // Implicit - sortare după index crescător
                return [...problems].sort((a, b) => a.index - b.index);
        }
    };

    const sortedProblems = sortProblems(filteredProblems);

    // Calculul paginării
    const totalPages = Math.ceil(sortedProblems.length / problemsPerPage);
    const startIndex = (currentPage - 1) * problemsPerPage;
    const endIndex = startIndex + problemsPerPage;
    const currentProblems = sortedProblems.slice(startIndex, endIndex);

    // Funcție pentru generarea numerelor de pagină
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5; // Numărul maxim de pagini vizibile

        if (totalPages <= maxVisiblePages) {
            // Dacă avem puține pagini, le afișăm pe toate
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Dacă avem multe pagini, afișăm o selecție inteligentă
            if (currentPage <= 3) {
                // Începutul listei
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Sfârșitul listei
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Mijlocul listei
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    // Funcții pentru navigarea paginării
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // AddProblemModal Component
    const AddProblemModal = ({ isOpen, onClose, isAdmin, user, onSuccess }) => {
        const [formData, setFormData] = useState({
            titlu: '',
            descriere: '',
            categorie: 'Mecanică',
            dificultate: 'ușor',
            continut: '',
            formule: [''],
            date: {},
            poze: [],
            punctajTotal: 0,
            subpuncte: [
                {
                    cerinta: '',
                    punctaj: 1
                }
            ]
        });

        const [datePairs, setDatePairs] = useState([
            { key: '', value: '' }
        ]);
        
        const dispatch = useDispatch();
        const { addStatus, addError } = useSelector(state => state.problems);
        const [emailStatus, setEmailStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
        const [emailError, setEmailError] = useState(null);
        const [emailLogs, setEmailLogs] = useState([]); // Array of log messages for UI display

        const handleInputChange = (field, value) => {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
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
                subpuncte: [...prev.subpuncte, {
                    cerinta: '',
                    punctaj: 1
                }]
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

        const removeImage = (index) => {
            setFormData(prev => ({
                ...prev,
                poze: prev.poze.filter((_, i) => i !== index)
            }));
        };

        // Date pairs handlers
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
            
            console.log('📝 [UI] Problem submission started', {
                isAdmin,
                userId: user?.uid,
                userEmail: user?.email,
                timestamp: new Date().toISOString()
            });
            
            // Convert date pairs to object
            const dateObject = {};
            datePairs.forEach(pair => {
                if (pair.key.trim() && pair.value.trim()) {
                    dateObject[pair.key.trim()] = pair.value.trim();
                }
            });
            
            // Calculează următorul index disponibil pentru probleme normale (< 1000)
            const allIndexes = new Set(problemeData.map(p => p.index).filter(idx => idx !== undefined && idx !== null && idx < 1000));
            
            // Găsește cel mai mic index disponibil < 1000
            let nextIndex = 1;
            while (allIndexes.has(nextIndex)) {
                nextIndex++;
            }
            
            // Dacă am ajuns la 1000, înseamnă că nu mai sunt index-uri disponibile sub 1000
            if (nextIndex >= 1000) {
                console.warn('⚠️ Nu mai sunt index-uri disponibile sub 1000 pentru probleme normale!');
            }
            
            // Prepare the problem data
            const problemData = {
                titlu: formData.titlu,
                descriere: formData.descriere,
                categorie: formData.categorie,
                dificultate: formData.dificultate,
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
                poze: formData.poze, // Include images in problem data
            };
            
            // Check if user is admin
            if (isAdmin) {
                // Admin: Upload directly to database
                console.log('📝 [UI] User is admin, uploading problem directly to database...', {
                    problemTitle: problemData.titlu,
                    problemCategory: problemData.categorie,
                    problemDifficulty: problemData.dificultate,
                    subpuncteCount: problemData.subpuncte.length,
                    hasImages: problemData.poze?.length > 0
                });
                
                try {
                    console.log('📝 [UI] Dispatching addProblem action...');
                    const result = await dispatch(addProblem(problemData)).unwrap();
                    
                    console.log('✅ [UI] Problem uploaded successfully to database!', {
                        problemTitle: problemData.titlu,
                        problemIndex: problemData.index,
                        problemId: result?.id,
                        timestamp: new Date().toISOString(),
                        result
                    });
                    
                    // Reset form and close modal
                    setFormData({
                        titlu: '',
                        descriere: '',
                        categorie: 'Mecanică',
                        dificultate: 'ușor',
                        continut: '',
                        formule: [''],
                        date: {},
                        poze: [],
                        punctajTotal: 0,
                        subpuncte: [{ cerinta: '', punctaj: 1 }]
                    });
                    setDatePairs([{ key: '', value: '' }]);
                    onClose();
                    
                    // Clear add status after a delay
                    setTimeout(() => {
                        dispatch(clearAddStatus());
                    }, 2000);
                    
                } catch (error) {
                    console.error('❌ [UI] Error saving problem to database:', {
                        error: error.message,
                        errorName: error.name,
                        problemTitle: problemData.titlu,
                        timestamp: new Date().toISOString(),
                        stack: error.stack
                    });
                }
            } else {
                // Non-admin: Send email suggestion
                console.log('📝 [UI] User is not admin, sending problem suggestion via email...', {
                    userId: user?.uid,
                    userEmail: user?.email,
                    problemTitle: problemData.titlu,
                    problemCategory: problemData.categorie,
                    problemDifficulty: problemData.dificultate
                });
                
                setEmailStatus('loading');
                setEmailError(null);
                setEmailLogs([{ type: 'info', message: t('problemsPage.suggestion.preparing', 'Pregătire sugestie problemă...'), timestamp: new Date() }]);
                
                try {
                    setEmailLogs(prev => [...prev, { type: 'info', message: t('problemsPage.suggestion.initializingEmail', 'Se inițializează serviciul de email...'), timestamp: new Date() }]);
                    console.log('📝 [UI] Calling sendProblemSuggestion...');
                    
                    setEmailLogs(prev => [...prev, { type: 'info', message: t('problemsPage.suggestion.loadingProfile', 'Se încarcă datele profilului utilizator...'), timestamp: new Date() }]);
                    const result = await sendProblemSuggestion(problemData, user);
                    
                    console.log('✅ [UI] Problem suggestion sent successfully!', {
                        result,
                        problemTitle: problemData.titlu,
                        timestamp: new Date().toISOString()
                    });
                    
                    setEmailLogs(prev => [...prev, { 
                        type: 'success', 
                        message: t('problemsPage.suggestion.sentDuration', 'Sugestia a fost trimisă cu succes! Durata: {duration}ms', { duration: result.duration || 'N/A' }), 
                        timestamp: new Date() 
                    }]);
                    
                    // Reset form immediately
                    setFormData({
                        titlu: '',
                        descriere: '',
                        categorie: 'Mecanică',
                        dificultate: 'ușor',
                        continut: '',
                        formule: [''],
                        date: {},
                        poze: [],
                        punctajTotal: 0,
                        subpuncte: [{ cerinta: '', punctaj: 1 }]
                    });
                    setDatePairs([{ key: '', value: '' }]);
                    setEmailStatus('idle');
                    setEmailLogs([]);
                    
                    // Close modal and trigger success notification
                    onClose();
                    if (onSuccess) {
                        onSuccess();
                    }
                    
                } catch (error) {
                    console.error('❌ [UI] Error sending problem suggestion:', {
                        error: error.message,
                        errorName: error.name,
                        problemTitle: problemData.titlu,
                        userId: user?.uid,
                        timestamp: new Date().toISOString()
                    });
                    
                    setEmailLogs(prev => [...prev, { 
                        type: 'error', 
                        message: t('problemsPage.suggestion.errorPrefix', 'Eroare: {message}', { message: error.message }), 
                        timestamp: new Date() 
                    }]);
                    setEmailStatus('error');
                    setEmailError(error.message || t('problemsPage.suggestion.genericError', 'A apărut o eroare la trimiterea sugestiei. Te rugăm să încerci din nou.'));
                }
            }
        };

        // Reset form when modal opens/closes or populate from URL
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
                        categorie: prefillData.categorie || 'Mecanică',
                        dificultate: prefillData.dificultate || 'ușor',
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
                        categorie: 'Mecanică',
                        dificultate: 'ușor',
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
                    categorie: 'Mecanică',
                    dificultate: 'ușor',
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
                // Save current scroll position
                const scrollY = window.scrollY;
                // Disable scroll
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollY}px`;
                document.body.style.width = '100%';
                document.body.style.overflow = 'hidden';
                
                return () => {
                    // Re-enable scroll
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.width = '';
                    document.body.style.overflow = '';
                    // Restore scroll position
                    window.scrollTo(0, scrollY);
                };
            }
        }, [isOpen]);

        if (!isOpen) return null;
        
        // Safety check: Don't show modal if user is not logged in
        if (!user) {
            return null;
        }

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>{isAdmin ? t('problemsPage.actions.addProblemTitle', 'Adaugă problemă') : t('problemsPage.actions.suggestProblemTitle', 'Sugerează o problemă')}</h2>
                        <button className="modal-close" onClick={onClose}>×</button>
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
                            {t('problemsPage.suggestion.nonAdminNote', 'Ca utilizator non-admin, poți doar să sugerezi probleme. Sugestiile tale vor fi trimise prin email administratorilor pentru revizuire și adăugare în baza de date.')}
                        </div>
                    )}
                    
                    {addError && (
                        <div className="error-message">
                            {t('problemsPage.suggestion.saveError', 'Eroare la salvarea problemei: {error}', { error: addError })}
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
                                    <label>{t('problemsPage.suggestion.modal.categoryLabel', 'Categorie *')}</label>
                                    <select
                                        value={formData.categorie}
                                        onChange={(e) => handleInputChange('categorie', e.target.value)}
                                        required
                                        disabled={addStatus === 'loading'}
                                    >
                                        <option value="Mecanică">{formatCategoryFilterLabel('Mecanică', t)}</option>
                                        <option value="Oscilații">{formatCategoryFilterLabel('Oscilații', t)}</option>
                                        <option value="Unde">{formatCategoryFilterLabel('Unde', t)}</option>
                                        <option value="Lissajous">{formatCategoryFilterLabel('Lissajous', t)}</option>
                                        <option value="Seismologie">{formatCategoryFilterLabel('Seismologie', t)}</option>
                                        <option value="Bac">{t('problemsPage.categories.bac', 'Bac')}</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>{t('problemsPage.suggestion.modal.difficultyLabel', 'Dificultate *')}</label>
                                    <select
                                        value={formData.dificultate}
                                        onChange={(e) => handleInputChange('dificultate', e.target.value)}
                                        required
                                        disabled={addStatus === 'loading'}
                                    >
                                        <option value="ușor">{t('problemsPage.difficulty.easy', 'Ușor')}</option>
                                        <option value="mediu">{t('problemsPage.difficulty.medium', 'Mediu')}</option>
                                        <option value="dificil">{t('problemsPage.difficulty.hard', 'Dificil')}</option>
                                        <option value="concurs">{t('problemsPage.difficulty.competition', 'Concurs')}</option>
                                    </select>
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
                                <div className="image-upload-area">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        id="image-upload"
                                        style={{ display: 'none' }}
                                        disabled={addStatus === 'loading'}
                                    />
                                    <label htmlFor="image-upload" className="image-upload-label">
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
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={addStatus === 'loading' || emailStatus === 'loading'}
                            >
                                {isAdmin 
                                    ? (addStatus === 'loading' ? t('problemsPage.suggestion.modal.submitAdminLoading', 'Se salvează...') : t('problemsPage.suggestion.modal.submitAdmin', 'Salvează'))
                                    : (emailStatus === 'loading' ? t('problemsPage.suggestion.modal.submitSuggestLoading', 'Se trimite...') : t('problemsPage.suggestion.modal.submitSuggest', 'Trimite sugestie'))
                                }
                            </button>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={onClose}
                                disabled={addStatus === 'loading' || emailStatus === 'loading'}
                            >
                                {t('problemsPage.suggestion.modal.cancel', 'Anulează')}
                            </button>
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
        "name": "Probleme de Fizică - PULS",
        "description": "Colecție completă de probleme de fizică pentru bacalaureat și concursuri. Rezolvări pas cu pas, organizate pe categorii și dificultate. Autoevaluare cu feedback AI.",
        "url": "https://puls-fizica.ro/probleme",
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": sortedProblems.length,
            "itemListElement": currentProblems.slice(0, 10).map((problem, index) => ({
                "@type": "ListItem",
                "position": startIndex + index + 1,
                "item": {
                    "@type": "EducationalContent",
                    "@id": `https://puls-fizica.ro/probleme/${problem.index}`,
                    "name": problem.titlu,
                    "description": problem.descriere || problem.titlu,
                    "educationalLevel": "High School",
                    "learningResourceType": "Problem",
                    "subject": "Physics",
                    "about": problem.categorie,
                    "difficulty": problem.dificultate
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
                    "name": "Probleme de Fizică",
                    "item": "https://puls-fizica.ro/probleme"
                }
            ]
        }
    };

    return (
        <Layout>
            <SEO
                title={t('problemsPage.seoTitle', 'Probleme de Fizică | PULS - Probleme BAC și Exerciții cu Rezolvări Pas cu Pas')}
                description={t(
                    'problemsPage.seoDescription',
                    `Rezolvă probleme de fizică pentru bacalaureat și concursuri. Colecție completă de probleme cu rezolvări pas cu pas, organizate pe categorii și dificultate. Autoevaluare cu feedback AI. Peste ${sortedProblems.length} probleme disponibile.`,
                )}
                keywords={t(
                    'problemsPage.seoKeywords',
                    'probleme fizică, probleme BAC fizică, exerciții fizică, probleme rezolvate fizică, bacalaureat fizică, probleme concurs fizică, probleme fizică rezolvate pas cu pas, probleme fizică clasa a 12-a, probleme fizică mecanică, probleme fizică termodinamică',
                )}
                image="/res/icons/New-logo.png"
                structuredData={structuredData}
            />
            <div className="problems-page">
                <div className="problems-page-inner">
                    {/* Title */}
                    <h1 className="problems-page-title">{t('problemsPage.title', 'Probleme de fizică')}</h1>
                    {/* <p className="problems-page-intro" style={{ marginTop: '1rem', fontSize: '1.1rem', color: 'var(--muted-color-current-mode)', maxWidth: '800px', marginBottom: '2rem' }}>
                        Explorează o colecție completă de probleme de fizică pentru bacalaureat și concursuri. Fiecare problemă include rezolvări detaliate pas cu pas, formule necesare și autoevaluare cu feedback AI. Problemele sunt organizate pe categorii (Mecanică, Oscilații, Unde, Termodinamică) și dificultate (ușor, mediu, dificil, concurs).
                    </p> */}

                    {/* Search and Filters */}
                    <div className="problems-page-filters">
                        <div className="filters-row">
                            <form onSubmit={handleSearchSubmit} className="search-container">
                                <span className="search-icon"><SearchIcon /></span>
                                <input
                                    type="text"
                                    placeholder={t('problemsPage.searchPlaceholder', 'Caută după titlu, categorie, ID sau număr...')}
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
                                            {difficulty === "Toate"
                                                ? t('problemsPage.allDifficulties', 'Toate dificultățile')
                                                : `${t('problemsPage.difficultyPrefix', 'Dificultate')}: ${formatDifficultyLabel(difficulty, t)}`
                                            }
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="filter-select"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category === "Toate"
                                                ? t('problemsPage.allCategories', 'Toate categoriile')
                                                : `${t('problemsPage.categoryPrefix', 'Categorie')}: ${formatCategoryFilterLabel(category, t)}`
                                            }
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Category Pills */}
                    <div className="category-pills">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`category-pill${selectedCategory === category ? ' active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {formatCategoryFilterLabel(category, t)}
                            </button>
                        ))}
                        <Link to="/probleme/bac" className="bac-category-button">
                            <GraduationCap size={16} />
                            <span>{t('problemsPage.categories.bac', 'Bacalaureat')}</span>
                            <ExternalLink size={12} />
                        </Link>
                        <Link to="/probleme/grile" className="bac-category-button">
                            <ListChecks size={16} />
                            <span>{t('problemsPage.categories.quizzes', 'Grile')}</span>
                            <ExternalLink size={12} />
                        </Link>
                    </div>

                    {/* Results Header */}
                    <div className="results-header">
                        <p className="results-count">
                            {t('problemsPage.foundCount', '{count} probleme găsite', { count: sortedProblems.length })}
                            {totalPages > 1 && ` (${t('problemsPage.pageCount', 'pagina {current} din {total}', { current: currentPage, total: totalPages })})`}
                        </p>
                        <select
                            className="sort-select"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">{t('problemsPage.sort.newest', 'Cele mai noi')}</option>
                            <option value="oldest">{t('problemsPage.sort.oldest', 'Cele mai vechi')}</option>
                            <option value="difficulty-asc">{t('problemsPage.sort.difficultyAsc', 'Dificultate (crescător)')}</option>
                            <option value="difficulty-desc">{t('problemsPage.sort.difficultyDesc', 'Dificultate (descrescător)')}</option>
                        </select>
                    </div>

                    {/* Problem Cards Grid */}
                    {status === 'loading' && (
                        <div className="problems-loading">{t('problemsPage.loading', 'Se încarcă problemele...')}</div>
                    )}
                    {status === 'failed' && (
                        <div className="problems-error">{t('problemsPage.loadError', 'Eroare la încărcarea problemelor: {error}', { error })}</div>
                    )}
                    <div className="problems-grid">
                        {currentProblems.map((problem) => (
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

                    {status === 'succeeded' && sortedProblems.length === 0 && (
                        <div className="no-results">
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <h3>{t('problemsPage.noResultsYetTitle', 'Nu există rezultate pentru filtrele curente')}</h3>
                                <p>{t('problemsPage.noResultsYetDescription', 'Încearcă să modifici căutarea sau filtrele.')}</p>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <div className="pagination-navbar">
                                <button 
                                    className="pagination-btn" 
                                    disabled={currentPage === 1}
                                    onClick={goToPreviousPage}
                                >
                                    {t('common.previous', 'Anterior')}
                                </button>
                                
                                {getPageNumbers().map((page, index) => (
                                    <Fragment key={index}>
                                        {page === '...' ? (
                                            <span className="pagination-dots">...</span>
                                        ) : (
                                            <button 
                                                className={`pagination-btn${currentPage === page ? ' pagination-btn--active' : ''}`}
                                                onClick={() => goToPage(page)}
                                            >
                                                {page}
                                            </button>
                                        )}
                                    </Fragment>
                                ))}
                                
                                <button 
                                    className="pagination-btn" 
                                    disabled={currentPage === totalPages}
                                    onClick={goToNextPage}
                                >
                                    {t('common.next', 'Următor')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Floating Action Button - Only show if user is logged in */}
                    {user && (
                        <button 
                            className="fab-add-problem"
                            onClick={() => setShowAddModal(true)}
                            title={isAdmin ? t('problemsPage.actions.addProblem', 'Adaugă o problemă nouă') : t('problemsPage.actions.suggestProblem', 'Sugerează o problemă')}
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
                                // Clear the custom link and navigate to normal problems page
                                navigate(localizedPath('/probleme'));
                            }
                            setShowAddModal(false);
                        }}
                        isAdmin={isAdmin}
                        user={user}
                        onSuccess={() => {
                            setShowSuccessNotification(true);
                            setTimeout(() => {
                                setShowSuccessNotification(false);
                            }, 5000);
                        }}
                    />
                    
                    {/* Success Notification */}
                    {showSuccessNotification && (
                        <div 
                            className="success-notification-overlay"
                            onClick={() => setShowSuccessNotification(false)}
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 10000,
                                animation: 'fadeIn 0.3s ease-in'
                            }}
                        >
                            <div 
                                className="success-notification"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    padding: '30px 40px',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                    color: '#ffffff',
                                    textAlign: 'center',
                                    maxWidth: '400px',
                                    animation: 'slideUp 0.3s ease-out'
                                }}
                            >
                                <div style={{ fontSize: '48px', marginBottom: '15px' }}>✓</div>
                                <h3 style={{ margin: '0 0 10px', fontSize: '24px', fontWeight: 600 }}>
                                    {t('problemsPage.suggestionSuccess.title', 'Sugestie Trimisă!')}
                                </h3>
                                <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
                                    {t(
                                        'problemsPage.suggestionSuccess.description',
                                        'Sugestia ta a fost trimisă cu succes administratorilor. Ei vor revizui problema și o vor adăuga în baza de date dacă este aprobată.',
                                    )}
                                </p>
                                <button
                                    onClick={() => setShowSuccessNotification(false)}
                                    style={{
                                        marginTop: '20px',
                                        padding: '10px 24px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                        borderRadius: '6px',
                                        color: '#ffffff',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                    }}
                                >
                                    {t('problemsPage.suggestionSuccess.close', 'OK')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default PhysicsProblems;
export { ProblemCard };