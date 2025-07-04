import { useEffect, useState, Fragment } from 'react';
import Layout from '../Layout';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ProblemaDetaliata from "../Problemadetaliata";
import { problemeData } from '../problemedata';

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
const ProblemCard = ({ problem, onResolveClick }) => {
    const { index, titlu, dificultate, categorie, descriere, solved } = problem;

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
                    onClick={() => onResolveClick(problem)}
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
    const [selectedProblem, setSelectedProblem] = useState(null);
    
    // Paginare
    const [currentPage, setCurrentPage] = useState(1);
    const problemsPerPage = 8; // Numărul de probleme per pagină

    const navigate = useNavigate();

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
        if (
            searchQuery &&
            !problem.titlu.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !problem.categorie.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
            return false;
        }

        if (selectedDifficulty !== "Toate" && problem.dificultate !== selectedDifficulty) {
            return false;
        }

        if (
            selectedCategory !== "Toate" &&
            !problem.categorie.toLowerCase().includes(selectedCategory.toLowerCase())
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

    if (selectedProblem) {
        return (
            <Layout>
                <ProblemaDetaliata 
                    problema={selectedProblem} 
                    onBack={() => setSelectedProblem(null)}
                />
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="problems-page">
                <div className="problems-page-inner">
                    {/* Title */}
                    <h1 className="problems-page-title">Probleme de fizică</h1>

                    {/* Search and Filters */}
                    <div className="problems-page-filters">
                        <div className="filters-row">
                            <div className="search-container">
                                <span className="search-icon"><SearchIcon /></span>
                                <input
                                    type="text"
                                    placeholder="Caută probleme..."
                                    className="search-input"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
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
                    <div className="problems-grid">
                        {currentProblems.map((problem) => (
                            <ProblemCard
                                key={problem.id}
                                problem={problem}
                                onResolveClick={setSelectedProblem}
                            />
                        ))}
                    </div>

                    {/* No Results */}
                    {sortedProblems.length === 0 && (
                        <div className="no-results">
                            <h3>Nicio problemă găsită</h3>
                            <p>Încearcă să modifici filtrele sau să folosești alte cuvinte cheie.</p>
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
                </div>
            </div>
        </Layout>
    );
};

export default PhysicsProblems;