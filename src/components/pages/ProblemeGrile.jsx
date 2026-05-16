import { useEffect, useState, useMemo, Fragment } from 'react';
import Layout from '../Layout';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGrile, addGrila, clearAddStatus } from '../../features/grile/grileSlice';
import { normalizeString } from '../../lib/normalizeString';
import { Plus, X } from 'lucide-react';
import SEO from '../SEO';
import '../../scss/components/_probleme-grile.scss';
import { useI18n } from '../../i18n/LanguageContext';

const FILTER_ALL = 'Toate';

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

function formatDifficultyLabel(raw, t, lang) {
    if (!raw) return '';
    if (lang !== 'en') return raw;
    const n = normalizeString(raw);
    if (n.includes('usor')) return t('problemsPage.difficulty.easy', raw);
    if (n.includes('mediu')) return t('problemsPage.difficulty.medium', raw);
    if (n.includes('dificil')) return t('problemsPage.difficulty.hard', raw);
    return raw;
}

function AddGrilaModal({ isOpen, onClose, onSuccess, t, addStatus, grileData, dispatch }) {
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
            alert(t('gridProblemsPage.alertQuestionRequired', 'Introdu întrebarea.'));
            return;
        }
        const { a, b, c, d } = formData.variante;
        if (!a.trim() || !b.trim() || !c.trim() || !d.trim()) {
            alert(t('gridProblemsPage.alertVariantsRequired', 'Completează toate cele 4 variante de răspuns.'));
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
            alert(err.message || t('gridProblemsPage.alertSaveError', 'Eroare la salvarea grilei.'));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content grila-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{t('gridProblemsPage.modalTitle', 'Adaugă o grilă')}</h2>
                    <button type="button" className="modal-close" onClick={onClose} aria-label={t('gridProblemsPage.modalCloseAria', 'Închide')}>
                        <X size={20} />
                    </button>
                </div>
                <form className="modal-form grila-modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('gridProblemsPage.modalQuestionLabel', 'Întrebare *')}</label>
                        <textarea
                            value={formData.intrebare}
                            onChange={e => handleChange('intrebare', e.target.value)}
                            placeholder={t('gridProblemsPage.modalQuestionPlaceholder', 'Textul întrebării (poți folosi $...$ pentru LaTeX)')}
                            rows={3}
                            required
                        />
                    </div>
                    <div className="grila-variante-section">
                        {['a', 'b', 'c', 'd'].map(k => {
                            const letter = k.toUpperCase();
                            return (
                                <div key={k} className="form-group">
                                    <label>{t('gridProblemsPage.modalVariantLabel', `Varianta ${letter} *`, { letter })}</label>
                                    <input
                                        type="text"
                                        value={formData.variante[k]}
                                        onChange={e => handleVariantaChange(k, e.target.value)}
                                        placeholder={t('gridProblemsPage.modalVariantPlaceholder', `Răspuns ${letter}`, { letter })}
                                        required
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="form-group grila-radio-section">
                        <label>{t('gridProblemsPage.modalCorrectLabel', 'Răspuns corect *')}</label>
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
                            <label>{t('gridProblemsPage.modalCategoryLabel', 'Categorie')}</label>
                            <input
                                type="text"
                                value={formData.categorie}
                                onChange={e => handleChange('categorie', e.target.value)}
                                placeholder={t('gridProblemsPage.modalCategoryPlaceholder', 'ex: Mecanică, Termodinamică')}
                            />
                        </div>
                        <div className="form-group">
                            <label>{t('gridProblemsPage.modalDifficultyLabel', 'Dificultate')}</label>
                            <select
                                value={formData.dificultate}
                                onChange={e => handleChange('dificultate', e.target.value)}
                            >
                                <option value="ușor">{t('problemsPage.difficulty.easy', 'Ușor')}</option>
                                <option value="mediu">{t('problemsPage.difficulty.medium', 'Mediu')}</option>
                                <option value="dificil">{t('problemsPage.difficulty.hard', 'Dificil')}</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>{t('gridProblemsPage.modalExplanationLabel', 'Explicație (opțional)')}</label>
                        <textarea
                            value={formData.explicatie}
                            onChange={e => handleChange('explicatie', e.target.value)}
                            placeholder={t('gridProblemsPage.modalExplanationPlaceholder', 'Explicație afișată după răspuns')}
                            rows={2}
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            {t('gridProblemsPage.modalCancel', 'Anulează')}
                        </button>
                        <button type="submit" className="btn-primary" disabled={addStatus === 'loading'}>
                            {addStatus === 'loading'
                                ? t('gridProblemsPage.modalSaving', 'Se salvează...')
                                : t('gridProblemsPage.modalSubmit', 'Adaugă grila')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

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
    const { localizedPath, lang, t } = useI18n();
    const titlu = grila.intrebare
        ? (grila.intrebare.length > 80 ? grila.intrebare.substring(0, 80) + '...' : grila.intrebare)
        : t('gridProblemsPage.cardFallbackTitle', `Grilă #${grila.index}`, { num: grila.index });

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
            aria-label={t('gridProblemsPage.cardOpenAria', `Deschide grila ${titlu}`, { title: titlu })}
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
                        {formatDifficultyLabel(grila.dificultate, t, lang)}
                    </div>
                )}
                <div className="grila-card-link">
                    <span>{t('gridProblemsPage.cardSolve', 'Rezolvă')}</span>
                    <ExternalLinkIcon />
                </div>
            </div>
        </div>
    );
};

const ProblemeGrile = () => {
    const navigate = useNavigate();
    const { localizedPath, lang, t } = useI18n();
    const dispatch = useDispatch();
    const { value: grileData, status, error, addStatus } = useSelector(state => state.grile);

    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(FILTER_ALL);
    const [selectedDifficulty, setSelectedDifficulty] = useState(FILTER_ALL);
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
        return [FILTER_ALL, ...Array.from(set).sort()];
    }, [grileData]);

    const difficulties = useMemo(() => {
        const set = new Set();
        grileData.forEach(g => {
            if (g.dificultate) set.add(g.dificultate);
        });
        return [FILTER_ALL, ...Array.from(set).sort()];
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
            if (selectedCategory !== FILTER_ALL && normalizeString(grila.categorie) !== normalizeString(selectedCategory)) {
                return false;
            }
            if (selectedDifficulty !== FILTER_ALL && normalizeString(grila.dificultate) !== normalizeString(selectedDifficulty)) {
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

    const structuredData = useMemo(() => ({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": t('gridProblemsPage.title', 'Grile de fizică'),
        "description": t('gridProblemsPage.seoDescription', 'Întrebări cu variante de răspuns pentru pregătirea la fizică. Grile organizate pe categorii și dificultate.'),
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
                    "name": grila.intrebare?.substring(0, 100) || t('gridProblemsPage.cardFallbackTitle', `Grilă #${grila.index}`, { num: grila.index }),
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
                { "@type": "ListItem", "position": 1, "name": t('common.home', 'Acasă'), "item": "https://puls-fizica.ro/" },
                { "@type": "ListItem", "position": 2, "name": t('common.problems', 'Probleme'), "item": "https://puls-fizica.ro/probleme" },
                { "@type": "ListItem", "position": 3, "name": t('gridProblemsPage.breadcrumbGrid', 'Grile'), "item": "https://puls-fizica.ro/probleme/grile" }
            ]
        }
    }), [sortedGrile, t]);

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
            const idx = parseInt(searchQuery.trim(), 10);
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

    const resultsLine =
        sortedGrile.length === 1
            ? t('gridProblemsPage.resultsSingle', '{count} grilă găsită', { count: sortedGrile.length })
            : t('gridProblemsPage.resultsPlural', '{count} grile găsite', { count: sortedGrile.length });
    const pageSuffix =
        totalPages > 1
            ? ` ${t('gridProblemsPage.pageOf', '(pagina {current} din {total})', { current: currentPage, total: totalPages })}`
            : '';

    return (
        <Layout>
            <SEO
                title={t('gridProblemsPage.seoTitle', 'Grile de Fizică | Întrebări cu Variante - PULS')}
                description={t(
                    'gridProblemsPage.seoDescriptionFull',
                    'Întrebări cu variante de răspuns pentru pregătirea la fizică. Grile organizate pe categorii și dificultate. {count} grile disponibile.',
                    { count: sortedGrile.length }
                )}
                keywords={t('gridProblemsPage.seoKeywords', 'grile fizică, întrebări fizică, test grilă fizică, exerciții fizică, pregătire BAC fizică')}
                image="/res/icons/New-logo.png"
                structuredData={structuredData}
            />
            <div className="problems-grile-page">
                <div className="problems-grile-page-inner">
                    <div className="problems-grile-header">
                        <div className="header-content">
                            <h1 className="problems-grile-page-title">{t('gridProblemsPage.title', 'Grile de fizică')}</h1>
                            <p className="problems-grile-page-subtitle">
                                {t('gridProblemsPage.subtitle', 'Întrebări cu variante de răspuns pentru autoevaluare')}
                            </p>
                        </div>
                    </div>

                    <div className="problems-grile-filters">
                        <form onSubmit={handleSearchSubmit} className="search-wrapper">
                            <div className="search-container">
                                <span className="search-icon"><SearchIcon /></span>
                                <input
                                    type="text"
                                    placeholder={t('gridProblemsPage.searchPlaceholder', 'Caută după întrebare, categorie sau număr...')}
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
                                <option value={FILTER_ALL}>{t('gridProblemsPage.allCategories', 'Toate categoriile')}</option>
                                {categories.filter(c => c !== FILTER_ALL).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                            <select
                                className="filter-select"
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                            >
                                <option value={FILTER_ALL}>{t('gridProblemsPage.allDifficulties', 'Toate dificultățile')}</option>
                                {difficulties.filter(d => d !== FILTER_ALL).map(d => (
                                    <option key={d} value={d}>
                                        {formatDifficultyLabel(d, t, lang)}
                                    </option>
                                ))}
                            </select>
                            <select
                                className="filter-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="newest">{t('gridProblemsPage.sortNewest', 'Cele mai noi')}</option>
                                <option value="oldest">{t('gridProblemsPage.sortOldest', 'Cele mai vechi')}</option>
                                <option value="difficulty-asc">{t('gridProblemsPage.sortDifficultyAsc', 'Dificultate (crescător)')}</option>
                                <option value="difficulty-desc">{t('gridProblemsPage.sortDifficultyDesc', 'Dificultate (descrescător)')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="results-header">
                        <p className="results-count">
                            {resultsLine}{pageSuffix}
                        </p>
                    </div>

                    {status === 'loading' && (
                        <div className="problems-loading">
                            <div className="loading-spinner">
                                <div className="spinner"></div>
                            </div>
                            <p>{t('gridProblemsPage.loading', 'Se încarcă grilele...')}</p>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="problems-error">{t('gridProblemsPage.loadError', 'Eroare la încărcarea grilelor: {error}', { error })}</div>
                    )}

                    {status === 'succeeded' && sortedGrile.length === 0 && (
                        <div className="no-results">
                            <div className="no-results-icon">📋</div>
                            <h3>{t('gridProblemsPage.emptyTitle', 'Nu există grile disponibile')}</h3>
                            <p>{t('gridProblemsPage.emptySubtitle', 'Grilele vor fi adăugate în curând.')}</p>
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
                                            {t('common.previous', 'Anterior')}
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
                                            {t('common.next', 'Următor')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <button
                        className="fab-add-problem"
                        onClick={() => setShowAddModal(true)}
                        title={t('gridProblemsPage.fabTitle', 'Adaugă o grilă')}
                        aria-label={t('gridProblemsPage.fabTitle', 'Adaugă o grilă')}
                    >
                        <Plus size={24} />
                    </button>

                    <AddGrilaModal
                        isOpen={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onSuccess={() => dispatch(fetchGrile())}
                        t={t}
                        addStatus={addStatus}
                        grileData={grileData}
                        dispatch={dispatch}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default ProblemeGrile;
