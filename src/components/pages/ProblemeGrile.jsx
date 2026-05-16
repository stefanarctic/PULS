import { useEffect, useState, useMemo, Fragment } from 'react';
import Layout from '../Layout';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGrile, addGrila, clearAddStatus } from '../../features/grile/grileSlice';
import { normalizeString } from '../../lib/normalizeString';
import { ExternalLink, Plus, X } from 'lucide-react';
import SEO from '../SEO';
import '../../scss/components/_probleme-grile.scss';
import { useI18n } from '../../i18n/LanguageContext';

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

const getDifficultyColorClass = (diff) => {
    if (!diff) return '';
    const d = normalizeString(diff);
    if (d.includes('usor') || d.includes('usoare')) return 'difficulty--usor';
    if (d.includes('mediu') || d.includes('medii')) return 'difficulty--mediu';
    if (d.includes('dificil') || d.includes('dificile')) return 'difficulty--dificil';
    return '';
};

const GrileCard = ({ grila, onBeforeNavigate }) => {
    const navigate = useNavigate();
    const { localizedPath } = useI18n();
    const titlu = grila.intrebare
        ? (grila.intrebare.length > 80 ? grila.intrebare.substring(0, 80) + '...' : grila.intrebare)
        : `Grilă #${grila.index}`;

    const handleNavigate = () => {
        if (onBeforeNavigate) onBeforeNavigate();
        navigate(localizedPath(`/probleme/grile/${grila.index}`));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNavigate();
        }
    };

    return (
        <div
            className="grila-card"
            onClick={handleNavigate}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Deschide grila ${titlu}`}
        >
            <div className="grila-card-header">
                <div className="grila-card-info">
                    <span className="grila-card-id">#{grila.index}</span>
                    <h3 className="grila-card-title">{titlu}</h3>
                    <p className="grila-card-topic">{grila.categorie || '—'}</p>
                </div>
            </div>
            <div className="grila-card-footer">
                {grila.dificultate && (
                    <div className={`grila-card-difficulty ${getDifficultyColorClass(grila.dificultate)}`}>
                        {grila.dificultate}
                    </div>
                )}
                <div className="grila-card-link">
                    <span>Rezolvă</span>
                    <ExternalLinkIcon />
                </div>
            </div>
        </div>
    );
};

const ProblemeGrile = () => {
    const navigate = useNavigate();
    const { localizedPath } = useI18n();
    const dispatch = useDispatch();
    const { value: grileData, status, error, addStatus, addError } = useSelector(state => state.grile);

    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Toate');
    const [selectedDifficulty, setSelectedDifficulty] = useState('Toate');
    const [sortBy, setSortBy] = useState('oldest');
    const [currentPage, setCurrentPage] = useState(1);
    const grilePerPage = 8;

    useEffect(() => {
        dispatch(fetchGrile());
    }, [dispatch]);

    const categories = useMemo(() => {
        const set = new Set();
        grileData.forEach(g => {
            if (g.categorie) set.add(g.categorie);
        });
        return ['Toate', ...Array.from(set).sort()];
    }, [grileData]);

    const difficulties = useMemo(() => {
        const set = new Set();
        grileData.forEach(g => {
            if (g.dificultate) set.add(g.dificultate);
        });
        return ['Toate', ...Array.from(set).sort()];
    }, [grileData]);

    const filteredGrile = useMemo(() => {
        return grileData.filter((grila) => {
            if (searchQuery) {
                const q = normalizeString(searchQuery);
                const matchIntrebare = normalizeString(grila.intrebare || '').includes(q);
                const matchCategorie = normalizeString(grila.categorie || '').includes(q);
                const matchIndex = String(grila.index || '').includes(q);
                if (!matchIntrebare && !matchCategorie && !matchIndex) return false;
            }
            if (selectedCategory !== 'Toate' && normalizeString(grila.categorie) !== normalizeString(selectedCategory)) {
                return false;
            }
            if (selectedDifficulty !== 'Toate' && normalizeString(grila.dificultate) !== normalizeString(selectedDifficulty)) {
                return false;
            }
            return true;
        });
    }, [grileData, searchQuery, selectedCategory, selectedDifficulty]);

    const sortedGrile = useMemo(() => {
        const arr = [...filteredGrile];
        switch (sortBy) {
            case 'newest':
                return arr.sort((a, b) => (b.index ?? 0) - (a.index ?? 0));
            case 'oldest':
                return arr.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
            case 'difficulty-asc': {
                const order = { 'ușor': 1, 'usoare': 1, 'mediu': 2, 'medii': 2, 'dificil': 3, 'dificile': 3 };
                return arr.sort((a, b) => {
                    const oa = order[normalizeString(a.dificultate || '')] || 0;
                    const ob = order[normalizeString(b.dificultate || '')] || 0;
                    if (oa !== ob) return oa - ob;
                    return (a.index ?? 0) - (b.index ?? 0);
                });
            }
            case 'difficulty-desc': {
                const order = { 'ușor': 1, 'usoare': 1, 'mediu': 2, 'medii': 2, 'dificil': 3, 'dificile': 3 };
                return arr.sort((a, b) => {
                    const oa = order[normalizeString(a.dificultate || '')] || 0;
                    const ob = order[normalizeString(b.dificultate || '')] || 0;
                    if (oa !== ob) return ob - oa;
                    return (a.index ?? 0) - (b.index ?? 0);
                });
            }
            default:
                return arr.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
        }
    }, [filteredGrile, sortBy]);

    const totalPages = Math.ceil(sortedGrile.length / grilePerPage);
    const startIndex = (currentPage - 1) * grilePerPage;
    const currentGrile = sortedGrile.slice(startIndex, startIndex + grilePerPage);

    const saveFiltersBeforeNavigate = () => {
        try {
            sessionStorage.setItem('grileFilters', JSON.stringify({
                searchQuery,
                selectedCategory,
                selectedDifficulty,
                sortBy,
                currentPage
            }));
            sessionStorage.setItem('restoreGrileFilters', 'true');
        } catch (e) {
            console.error('Error saving grile filters:', e);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const idx = parseInt(searchQuery.trim());
            if (!isNaN(idx)) {
                const grila = grileData.find(g => g.index === idx);
                if (grila) {
                    saveFiltersBeforeNavigate();
                    navigate(localizedPath(`/probleme/grile/${idx}`));
                    return;
                }
            }
        }
    };

    const AddGrilaModal = ({ isOpen, onClose, onSuccess }) => {
        useEffect(() => {
            if (isOpen) {
                document.body.style.overflow = 'hidden';
            }
            return () => {
                document.body.style.overflow = '';
            };
        }, [isOpen]);

        const [formData, setFormData] = useState({
            intrebare: '',
            variante: { a: '', b: '', c: '', d: '' },
            raspunsCorect: 'a',
            categorie: '',
            dificultate: 'ușor',
            explicatie: ''
        });

        const handleChange = (field, value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
        };

        const handleVariantaChange = (key, value) => {
            setFormData(prev => ({
                ...prev,
                variante: { ...prev.variante, [key]: value }
            }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!formData.intrebare.trim()) {
                alert('Introdu întrebarea.');
                return;
            }
            const { a, b, c, d } = formData.variante;
            if (!a.trim() || !b.trim() || !c.trim() || !d.trim()) {
                alert('Completează toate cele 4 variante de răspuns.');
                return;
            }
            const allIndexes = new Set(grileData.map(g => g.index).filter(i => i != null));
            let nextIndex = 1;
            while (allIndexes.has(nextIndex)) nextIndex++;

            const grilaData = {
                index: nextIndex,
                intrebare: formData.intrebare.trim(),
                variante: { a: a.trim(), b: b.trim(), c: c.trim(), d: d.trim() },
                raspunsCorect: formData.raspunsCorect,
                categorie: formData.categorie.trim() || 'General',
                dificultate: formData.dificultate,
                explicatie: formData.explicatie.trim() || null
            };

            try {
                await dispatch(addGrila(grilaData)).unwrap();
                setFormData({
                    intrebare: '',
                    variante: { a: '', b: '', c: '', d: '' },
                    raspunsCorect: 'a',
                    categorie: '',
                    dificultate: 'ușor',
                    explicatie: ''
                });
                onClose();
                onSuccess?.();
                setTimeout(() => dispatch(clearAddStatus()), 2000);
            } catch (err) {
                console.error('Eroare la adăugarea grilei:', err);
                alert(err.message || 'Eroare la salvarea grilei.');
            }
        };

        if (!isOpen) return null;

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content grila-modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Adaugă o grilă</h2>
                        <button type="button" className="modal-close" onClick={onClose} aria-label="Închide">
                            <X size={20} />
                        </button>
                    </div>
                    <form className="modal-form grila-modal-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Întrebare *</label>
                            <textarea
                                value={formData.intrebare}
                                onChange={e => handleChange('intrebare', e.target.value)}
                                placeholder="Textul întrebării (poți folosi $...$ pentru LaTeX)"
                                rows={3}
                                required
                            />
                        </div>
                        <div className="grila-variante-section">
                            <div className="form-group">
                                <label>Varianta A *</label>
                                <input
                                    type="text"
                                    value={formData.variante.a}
                                    onChange={e => handleVariantaChange('a', e.target.value)}
                                    placeholder="Răspuns A"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Varianta B *</label>
                                <input
                                    type="text"
                                    value={formData.variante.b}
                                    onChange={e => handleVariantaChange('b', e.target.value)}
                                    placeholder="Răspuns B"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Varianta C *</label>
                                <input
                                    type="text"
                                    value={formData.variante.c}
                                    onChange={e => handleVariantaChange('c', e.target.value)}
                                    placeholder="Răspuns C"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Varianta D *</label>
                                <input
                                    type="text"
                                    value={formData.variante.d}
                                    onChange={e => handleVariantaChange('d', e.target.value)}
                                    placeholder="Răspuns D"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-group grila-radio-section">
                            <label>Răspuns corect *</label>
                            <div className="grila-radio-group">
                                {['a', 'b', 'c', 'd'].map(k => (
                                    <label key={k} className="grila-radio-label">
                                        <input
                                            type="radio"
                                            name="raspunsCorect"
                                            value={k}
                                            checked={formData.raspunsCorect === k}
                                            onChange={() => handleChange('raspunsCorect', k)}
                                        />
                                        {k.toUpperCase()}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group category-group">
                                <label>Categorie</label>
                                <input
                                    type="text"
                                    value={formData.categorie}
                                    onChange={e => handleChange('categorie', e.target.value)}
                                    placeholder="ex: Mecanică, Termodinamică"
                                />
                            </div>
                            <div className="form-group">
                                <label>Dificultate</label>
                                <select
                                    value={formData.dificultate}
                                    onChange={e => handleChange('dificultate', e.target.value)}
                                >
                                    <option value="ușor">Ușor</option>
                                    <option value="mediu">Mediu</option>
                                    <option value="dificil">Dificil</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Explicație (opțional)</label>
                            <textarea
                                value={formData.explicatie}
                                onChange={e => handleChange('explicatie', e.target.value)}
                                placeholder="Explicație afișată după răspuns"
                                rows={2}
                            />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-secondary" onClick={onClose}>
                                Anulează
                            </button>
                            <button type="submit" className="btn-primary" disabled={addStatus === 'loading'}>
                                {addStatus === 'loading' ? 'Se salvează...' : 'Adaugă grila'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        return pages;
    };

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Grile de Fizică",
        "description": "Întrebări cu variante de răspuns pentru pregătirea la fizică. Grile organizate pe categorii și dificultate.",
        "url": "https://puls-fizica.ro/probleme/grile",
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": sortedGrile.length,
            "itemListElement": sortedGrile.slice(0, 10).map((grila, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "item": {
                    "@type": "Quiz",
                    "@id": `https://puls-fizica.ro/probleme/grile/${grila.index}`,
                    "name": grila.intrebare?.substring(0, 100) || `Grilă #${grila.index}`,
                    "educationalLevel": "High School",
                    "learningResourceType": "Quiz",
                    "subject": "Physics",
                    "about": grila.categorie
                }
            }))
        },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Acasă", "item": "https://puls-fizica.ro/" },
                { "@type": "ListItem", "position": 2, "name": "Probleme", "item": "https://puls-fizica.ro/probleme" },
                { "@type": "ListItem", "position": 3, "name": "Grile", "item": "https://puls-fizica.ro/probleme/grile" }
            ]
        }
    };

    return (
        <Layout>
            <SEO
                title="Grile de Fizică | Întrebări cu Variante - PULS"
                description={`Întrebări cu variante de răspuns pentru pregătirea la fizică. Grile organizate pe categorii și dificultate. ${sortedGrile.length} grile disponibile.`}
                keywords="grile fizică, întrebări fizică, test grilă fizică, exerciții fizică, pregătire BAC fizică"
                image="/res/icons/New-logo.png"
                structuredData={structuredData}
            />
            <div className="problems-grile-page">
                <div className="problems-grile-page-inner">
                    <div className="problems-grile-header">
                        <div className="header-content">
                            <h1 className="problems-grile-page-title">Grile de fizică</h1>
                            <p className="problems-grile-page-subtitle">
                                Întrebări cu variante de răspuns pentru autoevaluare
                            </p>
                        </div>
                    </div>

                    <div className="problems-grile-filters">
                        <form onSubmit={handleSearchSubmit} className="search-wrapper">
                            <div className="search-container">
                                <span className="search-icon"><SearchIcon /></span>
                                <input
                                    type="text"
                                    placeholder="Caută după întrebare, categorie sau număr..."
                                    className="search-input"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </form>
                        <div className="filters-row">
                            <select
                                className="filter-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="Toate">Toate categoriile</option>
                                {categories.filter(c => c !== 'Toate').map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <select
                                className="filter-select"
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                            >
                                <option value="Toate">Toate dificultățile</option>
                                {difficulties.filter(d => d !== 'Toate').map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <select
                                className="filter-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">Cele mai noi</option>
                                <option value="oldest">Cele mai vechi</option>
                                <option value="difficulty-asc">Dificultate (crescător)</option>
                                <option value="difficulty-desc">Dificultate (descrescător)</option>
                            </select>
                        </div>
                    </div>

                    <div className="results-header">
                        <p className="results-count">
                            {sortedGrile.length} {sortedGrile.length === 1 ? 'grilă găsită' : 'grile găsite'}
                            {totalPages > 1 && ` (pagina ${currentPage} din ${totalPages})`}
                        </p>
                    </div>

                    {status === 'loading' && (
                        <div className="problems-loading">
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                            </div>
                            <p>Se încarcă grilele...</p>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="problems-error">Eroare la încărcarea grilelor: {error}</div>
                    )}

                    {status === 'succeeded' && sortedGrile.length === 0 && (
                        <div className="no-results">
                            <div className="no-results-icon">📋</div>
                            <h3>Nu există grile disponibile</h3>
                            <p>Grilele vor fi adăugate în curând.</p>
                        </div>
                    )}

                    {status === 'succeeded' && sortedGrile.length > 0 && (
                        <>
                            <div className="grile-grid">
                                {currentGrile.map((grila) => (
                                    <GrileCard
                                        key={grila.id || grila.index}
                                        grila={grila}
                                        onBeforeNavigate={saveFiltersBeforeNavigate}
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="pagination">
                                    <div className="pagination-navbar">
                                        <button
                                            className="pagination-btn"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        >
                                            Anterior
                                        </button>
                                        {getPageNumbers().map((page, idx) => (
                                            <Fragment key={idx}>
                                                {page === '...' ? (
                                                    <span className="pagination-dots">...</span>
                                                ) : (
                                                    <button
                                                        className={`pagination-btn${currentPage === page ? ' pagination-btn--active' : ''}`}
                                                        onClick={() => setCurrentPage(page)}
                                                    >
                                                        {page}
                                                    </button>
                                                )}
                                            </Fragment>
                                        ))}
                                        <button
                                            className="pagination-btn"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        >
                                            Următor
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <button
                        className="fab-add-problem"
                        onClick={() => setShowAddModal(true)}
                        title="Adaugă o grilă"
                        aria-label="Adaugă o grilă"
                    >
                        <Plus size={24} />
                    </button>

                    <AddGrilaModal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => dispatch(fetchGrile())}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default ProblemeGrile;
