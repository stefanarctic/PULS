import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Layout from "../Layout";
import { simulationsConfig } from "@/data/simulations";
import SEO from "../SEO";
import { useI18n } from "../../i18n/LanguageContext";

// Funcție helper pentru normalizarea diacriticelor (elimină diacriticele)
const normalizeDiacritics = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

/** Ordine stabilă pentru filtre (frecvență mică → frecvență mare în curriculum), nu alfabetică. */
const SIMULATION_CATEGORY_ORDER = [
  "Mecanică",
  "Pendule",
  "Oscilații",
  "Unde",
  "Grafice",
  "Termodinamică",
  "Electricitate",
  "Electromagnetism",
  "Optică",
  "Lasere",
  "Astronomie",
  "Atomul",
  "Fizică cuantică",
  "Fizică nucleară",
  "4D",
];

const SimulariPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang, localizedPath } = useI18n();

  // Map Romanian category to the English label from the i18n catalog.
  const localizedCategory = (cat) => {
    if (lang !== 'en' || !cat) return cat;
    const map = {
      'Toate': t('simulationCategories.all', 'Toate'),
      'Mecanică': t('simulationCategories.mechanics', 'Mecanică'),
      'Pendule': t('simulationCategories.pendulums', 'Pendule'),
      'Oscilații': t('simulationCategories.oscillations', 'Oscilații'),
      'Unde': t('simulationCategories.waves', 'Unde'),
      'Grafice': t('simulationCategories.graphs', 'Grafice'),
      'Termodinamică': t('simulationCategories.thermodynamics', 'Termodinamică'),
      'Electricitate': t('simulationCategories.electricity', 'Electricitate'),
      'Electromagnetism': t('simulationCategories.electromagnetism', 'Electromagnetism'),
      'Optică': t('simulationCategories.optics', 'Optică'),
      'Lasere': t('simulationCategories.lasers', 'Lasere'),
      'Astronomie': t('simulationCategories.astronomy', 'Astronomie'),
      'Atomul': t('simulationCategories.atom', 'Atomul'),
      'Fizică cuantică': t('simulationCategories.quantumPhysics', 'Fizică cuantică'),
      'Fizică nucleară': t('simulationCategories.nuclearPhysics', 'Fizică nucleară'),
      '4D': t('simulationCategories.fourD', '4D'),
    };
    return map[cat] || cat;
  };

  // Map a simulation entry to its localized title/description/caption using its route as the key.
  const localizedSim = (sim) => {
    if (lang !== 'en') return sim;
    const key = sim.slug || (sim.route ? sim.route.split('/').filter(Boolean).pop() : sim.id);
    return {
      ...sim,
      title: t(`simulations.${key}.title`, sim.title),
      description: t(`simulations.${key}.description`, sim.description),
      caption: t(`simulations.${key}.caption`, sim.caption),
    };
  };
  
  // Citește parametrii din URL la inițializare și decodează diacriticele
  const getSearchFromUrl = () => {
    const searchFromUrl = searchParams.get("search") || "";
    // Decodăm diacriticele din URL (pentru că URL-ul va fi fără diacritice)
    // Dar încercăm să găsim cea mai bună potrivire din simulări
    return searchFromUrl;
  };
  
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "Toate"
  );
  const [searchQuery, setSearchQuery] = useState(getSearchFromUrl());

  // Obține toate categoriile unice din simulări
  const categories = useMemo(() => {
    const uniqueCats = [...new Set(simulationsConfig.map((sim) => sim.category))];
    const ordered = SIMULATION_CATEGORY_ORDER.filter((c) => uniqueCats.includes(c));
    const rest = uniqueCats
      .filter((c) => !SIMULATION_CATEGORY_ORDER.includes(c))
      .sort((a, b) => a.localeCompare(b, "ro"));
    return ["Toate", ...ordered, ...rest];
  }, []);

  // Sincronizează state-ul cu URL-ul când se schimbă state-ul
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedCategory && selectedCategory !== "Toate") {
      // Normalizează categoria pentru URL (elimină diacriticele)
      const normalizedCategory = normalizeDiacritics(selectedCategory);
      params.set("category", normalizedCategory);
    }

    if (searchQuery.trim()) {
      // Normalizează search query-ul pentru URL (elimină diacriticele)
      const normalizedSearch = normalizeDiacritics(searchQuery.trim());
      params.set("search", normalizedSearch);
    }

    // Actualizează URL-ul doar dacă parametrii s-au schimbat
    const currentParams = searchParams.toString();
    const newParams = params.toString();
    
    if (currentParams !== newParams) {
      setSearchParams(params, { replace: true });
    }
  }, [selectedCategory, searchQuery, setSearchParams, searchParams]);

  // Citește parametrii din URL când se schimbă (pentru back/forward navigation sau link-uri directe)
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category") || "Toate";
    const searchFromUrl = searchParams.get("search") || "";

    // Pentru categorie, trebuie să găsim categoria corectă (cu diacritice) din lista de categorii
    let categoryToSet = "Toate";
    if (categoryFromUrl !== "Toate" && categoryFromUrl !== "") {
      // Găsim categoria care, normalizată, se potrivește cu cea din URL
      const foundCategory = categories.find(cat => 
        normalizeDiacritics(cat) === normalizeDiacritics(categoryFromUrl)
      );
      categoryToSet = foundCategory || categoryFromUrl;
    }

    // Actualizează state-ul doar dacă valorile din URL sunt diferite
    if (categoryToSet !== selectedCategory) {
      setSelectedCategory(categoryToSet);
    }
    // Pentru search, păstrăm valoarea din URL (fără diacritice în URL, dar utilizatorul poate scrie cu diacritice)
    if (searchFromUrl !== searchQuery) {
      setSearchQuery(searchFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]); // Doar când se schimbă URL-ul (back/forward sau link direct)

  // Filtrează simulările pe baza categoriei selectate și a căutării
  const filteredSimulations = useMemo(() => {
    let filtered = simulationsConfig;

    // Filtrare după categorie
    if (selectedCategory !== "Toate") {
      filtered = filtered.filter(sim => sim.category === selectedCategory);
    }

    // Filtrare după search query (cu comparație normalizată pentru diacritice)
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      const normalizedQuery = normalizeDiacritics(query);
      
      filtered = filtered.filter(sim => {
        // Normalizează toate textele pentru comparație
        const normalizedTitle = normalizeDiacritics(sim.title);
        const normalizedDescription = normalizeDiacritics(sim.description);
        const normalizedCaption = normalizeDiacritics(sim.caption);
        const normalizedCategory = sim.category ? normalizeDiacritics(sim.category) : "";
        
        // Compară normalizat (astfel "a" va găsi "ă", "â", etc.)
        return (
          normalizedTitle.includes(normalizedQuery) ||
          normalizedDescription.includes(normalizedQuery) ||
          normalizedCaption.includes(normalizedQuery) ||
          normalizedCategory.includes(normalizedQuery)
        );
      });
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  return (
    <Layout>
      <SEO
        title="Simulări Interactive Fizică | PULS - 40+ Simulări Educaționale"
        description="Explorează fizica prin simulări interactive: pendule, unde, oscilații, termodinamică, mecanică, electricitate, optică, lasere, fizică cuantică, atomul, astronomie și mai multe. 40+ simulări educaționale pentru elevi și profesori."
        keywords="simulări fizică, simulări interactive fizică, pendul simulare, unde simulare, oscilații simulare, termodinamică simulare, fizică interactivă, fizică cuantică simulare, atomul simulare, astronomie simulare"
        image="/res/icons/New-logo.png"
      />
      <div className="simulari-page">
        <main className="main-content">
          <h1>{t('simulationsPage.title', 'Simulări')}</h1>
          <p>{t('simulationsPage.subtitle', 'Explorează concepte fizice prin intermediul simulărilor interactive.')}</p>

          {/* Search Bar */}
          <div className="simulations-search">
            <div className="search-container">
              <svg 
                className="search-icon" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder={t('simulationsPage.searchPlaceholder', 'Caută simulări după titlu, descriere sau categorie...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label={t('simulationsPage.clearSearchAria', 'Șterge căutarea')}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Filtre de categorii */}
          <div className="simulations-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {localizedCategory(category)}
                {category !== "Toate" && (
                  <span className="filter-count">
                    ({simulationsConfig.filter(sim => sim.category === category).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Rezultate filtrate */}
          <div className="simulations-results">
            <p className="results-count">
              {filteredSimulations.length === 1
                ? t('simulationsPage.resultsSingle', '{count} simulare', { count: filteredSimulations.length })
                : t('simulationsPage.resultsPlural', '{count} simulări', { count: filteredSimulations.length })
              }
              {selectedCategory !== "Toate" && ' '}{selectedCategory !== "Toate" && t('simulationsPage.inCategory', 'în categoria "{category}"', { category: localizedCategory(selectedCategory) })}
              {searchQuery && ' '}{searchQuery && t('simulationsPage.forQuery', 'pentru "{query}"', { query: searchQuery })}
            </p>
            {filteredSimulations.length === 0 && (
              <p className="no-results">
                {t('simulationsPage.noResults', 'Nu s-au găsit simulări care să corespundă criteriilor tale. Încearcă să modifici filtrele sau termenii de căutare.')}
              </p>
            )}
          </div>

          <div className="simulations-grid">
            {filteredSimulations.map((simulation) => {
              const sim = localizedSim(simulation);
              return (
                <div key={sim.id} className="simulation-card" onClick={() => {
                  if (sim.route) {
                    navigate(localizedPath(sim.route));
                  } else if (sim.iframeSrc) {
                    window.open(sim.iframeSrc, "_blank");
                  }
                }}>
                  <div className="card-content">
                    <h2>{sim.title}</h2>
                    <p className="description">{sim.description}</p>
                    {sim.category && (
                      <span className="simulation-category">{localizedCategory(sim.category)}</span>
                    )}
                  </div>
                  <div className="image-container">
                    <div className="card-image active">
                      <img
                        src={sim.image}
                        alt={sim.caption}
                      />
                      <div className="caption">
                        {sim.caption}
                      </div>
                    </div>
                  </div>
                  <button
                    className="start-simulation-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (sim.route) {
                        navigate(localizedPath(sim.route));
                      } else if (sim.iframeSrc) {
                        window.open(sim.iframeSrc, "_blank");
                      }
                    }}
                  >
                    {t('simulationsPage.startSimulation', 'Începe simularea')}
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default SimulariPage;
