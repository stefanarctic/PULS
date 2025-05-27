import React, { useState } from 'react';
import Layout from '../Layout';

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

// Mock data
const problemsMock = [
    {
        id: 1,
        title: "Pendulul simplu",
        difficulty: "ușor",
        topic: "Mecanică - Oscilații",
        solved: true,
    },
    {
        id: 2,
        title: "Calculul perioadei de oscilație",
        difficulty: "mediu",
        topic: "Mecanică - Oscilații",
        solved: false,
    },
    {
        id: 3,
        title: "Interferența undelor",
        difficulty: "dificil",
        topic: "Unde - Unde mecanice",
        solved: false,
    },
    {
        id: 4,
        title: "Figurile lui Lissajous",
        difficulty: "mediu",
        topic: "Oscilații - Compunere",
        solved: true,
    },
    {
        id: 5,
        title: "Undele seismice",
        difficulty: "mediu",
        topic: "Seismologie - Unde seismice",
        solved: false,
    },
    {
        id: 6,
        title: "Energia mecanică a pendulului",
        difficulty: "ușor",
        topic: "Mecanică - Conservarea energiei",
        solved: false,
    },
    {
        id: 7,
        title: "Analiza osciloscopică a undelor",
        difficulty: "dificil",
        topic: "Unde - Reprezentări",
        solved: false,
    },
    {
        id: 8,
        title: "Pendulul elastic",
        difficulty: "mediu",
        topic: "Mecanică - Oscilații",
        solved: true,
    },
];

// Problem Card Component
const ProblemCard = ({ id, title, difficulty, topic, solved }) => {
    const getDifficultyColorClass = (diff) => {
        switch (diff) {
            case 'ușor': return 'difficulty--usor';
            case 'mediu': return 'difficulty--mediu';
            case 'dificil': return 'difficulty--dificil';
            default: return '';
        }
    };

    return (
        <div className={`problem-card${solved ? ' solved' : ''}`}>
            <div className="problem-card-header">
                <div className="problem-card-info">
                    <span className="problem-card-id">
                        #{id}
                    </span>
                    <h3 className="problem-card-title">
                        {title}
                    </h3>
                    <p className="problem-card-topic">
                        {topic}
                    </p>
                </div>
                {solved && (
                    <div className="problem-card-solved-badge">
                        Rezolvată
                    </div>
                )}
            </div>
            <div className="problem-card-footer">
                <div className={`problem-card-difficulty ${getDifficultyColorClass(difficulty)}`}>
                    {difficulty}
                </div>
                <a
                    href={`/probleme/${id}`}
                    className="problem-card-link"
                >
                    <span>Rezolvă</span>
                    <ExternalLinkIcon />
                </a>
            </div>
        </div>
    );
};

const PhysicsProblems = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("Toate");
    const [selectedCategory, setSelectedCategory] = useState("Toate");
    const [sortBy, setSortBy] = useState("newest");

    const categories = [
        "Toate",
        "Mecanica",
        "Oscilații",
        "Unde",
        "Seismologie",
    ];

    const difficulties = ["Toate", "ușor", "mediu", "dificil"];

    const filteredProblems = problemsMock.filter((problem) => {
        if (
            searchQuery &&
            !problem.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !problem.topic.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
            return false;
        }

        if (selectedDifficulty !== "Toate" && problem.difficulty !== selectedDifficulty) {
            return false;
        }

        if (
            selectedCategory !== "Toate" &&
            !problem.topic.toLowerCase().includes(selectedCategory.toLowerCase())
        ) {
            return false;
        }

        return true;
    });

    return (
        <Layout>
            <div className="problems-page">
                <div className="problems-page-inner">
                    {/* Title */}
                    <h1 className="problems-page-title">
                        Probleme de fizică
                    </h1>

                    {/* Search and Filters */}
                    <div className="problems-page-filters">
                        <div className="filters-row">
                            <div className="search-container">
                                <span className="search-icon">
                                    <SearchIcon />
                                </span>
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
                            {filteredProblems.length} probleme găsite
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
                        {filteredProblems.map((problem) => (
                            <ProblemCard
                                key={problem.id}
                                id={problem.id}
                                title={problem.title}
                                difficulty={problem.difficulty}
                                topic={problem.topic}
                                solved={problem.solved}
                            />
                        ))}
                    </div>

                    {/* No Results */}
                    {filteredProblems.length === 0 && (
                        <div className="no-results">
                            <h3>
                                Nicio problemă găsită
                            </h3>
                            <p>
                                Încearcă să modifici filtrele sau să folosești alte cuvinte cheie.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredProblems.length > 0 && (
                        <div className="pagination">
                            <div className="pagination-navbar">
                                <button className="pagination-btn" disabled>
                                    Anterior
                                </button>
                                <button className="pagination-btn pagination-btn--active">
                                    1
                                </button>
                                <button className="pagination-btn">
                                    2
                                </button>
                                <button className="pagination-btn">
                                    3
                                </button>
                                <span className="pagination-dots">...</span>
                                <button className="pagination-btn">
                                    10
                                </button>
                                <button className="pagination-btn">
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