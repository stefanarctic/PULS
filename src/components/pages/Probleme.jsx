import { useEffect, useState, Fragment } from 'react';
import Layout from '../Layout';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
// import { problemeData } from '../problemedata';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProblems, addProblem, clearAddStatus } from '../../features/problems/problemsSlice';
import { Plus } from 'lucide-react';
import { normalizeString } from '../../lib/normalizeString';

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
const ProblemCard = ({ problem }) => {
    const { index, titlu, dificultate, categorie, descriere, solved } = problem;
    const navigate = useNavigate();

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
        <div className={`problem-card${solved ? ' solved' : ''}`}>
            <div className="problem-card-header">
                <div className="problem-card-info">
                    <span className="problem-card-id">#{index}</span>
                    <h3 className="problem-card-title">{titlu}</h3>
                    <p className="problem-card-topic">{categorie}</p>
                </div>
                {solved && <div className="problem-card-solved-badge">Rezolvată</div>}
            </div>
            <div className="problem-card-footer">
                <div className={`problem-card-difficulty ${getDifficultyColorClass(dificultate)}`}>
                    {dificultate}
                </div>
                <button
                    className="problem-card-link"
                    onClick={() => navigate(`/probleme/${index}`)}
                >
                    <span>Rezolvă</span>
                    <ExternalLinkIcon />
                </button>
            </div>
        </div>
    );
};

const PhysicsProblems = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const [selectedDifficulty, setSelectedDifficulty] = useState(
        params.get("difficulty") || "Toate"
    );
    const [selectedCategory, setSelectedCategory] = useState(
        params.get("category") || "Toate"
    );
    const [sortBy, setSortBy] = useState("newest");
    
    // Paginare
    const [currentPage, setCurrentPage] = useState(1);
    const problemsPerPage = 8; // Numărul de probleme per pagină

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { value: problemeData, status, error } = useSelector(state => state.problems);

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
                    navigate(`/probleme/${problemIndex}`);
                    return;
                }
            }
        }
    };

    useEffect(() => {
        const params = new URLSearchParams();

        if (selectedDifficulty && selectedDifficulty !== "Toate") {
            params.set("difficulty", selectedDifficulty);
        }

        navigate({
            pathname: location.pathname,
            search: params.toString(),
        });
    }, [selectedDifficulty, navigate, location.pathname]);

    // Reset la pagina 1 când se schimbă filtrele
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedDifficulty, selectedCategory, sortBy]);

    const categories = [
        "Toate",
        "Mecanică",
        "Oscilații",
        "Unde",
        "Lissajous",
        "Seismologie",
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

    const filteredProblems = relevantProblems.filter((problem) => {
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
    const AddProblemModal = ({ isOpen, onClose }) => {
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
            
            // Convert date pairs to object
            const dateObject = {};
            datePairs.forEach(pair => {
                if (pair.key.trim() && pair.value.trim()) {
                    dateObject[pair.key.trim()] = pair.value.trim();
                }
            });
            
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
                index: problemeData.length + 1,
                creator: '',
                punctajTotal: formData.punctajTotal,
                createdAt: new Date().toISOString(),
            };
            
            try {
                await dispatch(addProblem(problemData)).unwrap();
                
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
                console.error('Error saving problem:', error);
            }
        };

        // Reset form when modal opens/closes
        useEffect(() => {
            if (!isOpen) {
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
            }
        }, [isOpen, dispatch]);

        if (!isOpen) return null;

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Adaugă problemă</h2>
                        <button className="modal-close" onClick={onClose}>×</button>
                    </div>
                    
                    {addError && (
                        <div className="error-message">
                            Eroare la salvarea problemei: {addError}
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
                                    <label>Categorie *</label>
                                    <select
                                        value={formData.categorie}
                                        onChange={(e) => handleInputChange('categorie', e.target.value)}
                                        required
                                        disabled={addStatus === 'loading'}
                                    >
                                        <option value="Mecanică">Mecanică</option>
                                        <option value="Oscilații">Oscilații</option>
                                        <option value="Unde">Unde</option>
                                        <option value="Lissajous">Lissajous</option>
                                        <option value="Seismologie">Seismologie</option>
                                    </select>
                                </div>

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
                                    onChange={(e) => handleInputChange('formule', e.target.value.split('\n').filter(f => f.trim()))}
                                    placeholder="Formulele necesare (câte una pe rând)"
                                    rows={3}
                                    disabled={addStatus === 'loading'}
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
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={addStatus === 'loading'}
                            >
                                {addStatus === 'loading' ? 'Se salvează...' : 'Salvează'}
                            </button>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={onClose}
                                disabled={addStatus === 'loading'}
                            >
                                Anulează
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <Layout>
            <div className="problems-page">
                <div className="problems-page-inner">
                    {/* Title */}
                    <h1 className="problems-page-title">Probleme de fizică</h1>

                    {/* Search and Filters */}
                    <div className="problems-page-filters">
                        <div className="filters-row">
                            <form onSubmit={handleSearchSubmit} className="search-container">
                                <span className="search-icon"><SearchIcon /></span>
                                <input
                                    type="text"
                                    placeholder="Caută după titlu, categorie, ID sau număr..."
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
                                <select
                                    className="filter-select"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category === "Toate" ? "Toate categoriile" : `Categorie: ${category}`}
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
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Results Header */}
                    <div className="results-header">
                        <p className="results-count">
                            {sortedProblems.length} probleme găsite
                            {totalPages > 1 && ` (pagina ${currentPage} din ${totalPages})`}
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

                    {/* Problem Cards Grid */}
                    {status === 'loading' && (
                        <div className="problems-loading">Se încarcă problemele...</div>
                    )}
                    {status === 'failed' && (
                        <div className="problems-error">Eroare la încărcarea problemelor: {error}</div>
                    )}
                    <div className="problems-grid">
                        {currentProblems.map((problem) => (
                            <ProblemCard
                                key={problem.id}
                                problem={problem}
                            />
                        ))}
                    </div>

                    {/* Loading Component for No Results */}
                    {sortedProblems.length === 0 && (
                        <div className="no-results">
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                                <h3>Se caută probleme...</h3>
                                <p>Te rugăm să aștepți în timp ce se procesează căutarea.</p>
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
                                    Anterior
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
                                    Următor
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Floating Action Button */}
                    <button 
                        className="fab-add-problem"
                        onClick={() => setShowAddModal(true)}
                        title="Adaugă o problemă nouă"
                    >
                        <Plus size={24} />
                    </button>

                    {/* Add Problem Modal */}
                    <AddProblemModal 
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default PhysicsProblems;