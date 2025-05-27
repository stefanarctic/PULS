import React, { useState } from "react";
import Layout from "../Layout";

// Mock data
const simulationsMock = [
  {
    id: 1,
    title: "Pendulul simplu",
    description: "Simulare interactivă a mișcării unui pendul simplu cu posibilitatea de a ajusta lungimea și unghiul inițial.",
    imageUrl: "https://placehold.co/600x400/3b82f6/FFFFFF?text=Pendul+Simplu",
    category: "Mecanică"
  },
  {
    id: 2,
    title: "Unde transversale",
    description: "Vizualizează propagarea undelor transversale și modifică parametrii pentru a observa efectele.",
    imageUrl: "https://placehold.co/600x400/3b82f6/FFFFFF?text=Unde+Transversale",
    category: "Unde"
  },
  {
    id: 3,
    title: "Figuri Lissajous",
    description: "Generează figuri Lissajous prin modificarea frecvențelor și fazelor oscilațiilor perpendiculare.",
    imageUrl: "https://placehold.co/600x400/3b82f6/FFFFFF?text=Figuri+Lissajous",
    category: "Oscilații"
  },
  {
    id: 4,
    title: "Unde seismice",
    description: "Simularea propagării undelor seismice în diferite medii și structuri geologice.",
    imageUrl: "https://placehold.co/600x400/3b82f6/FFFFFF?text=Unde+Seismice",
    category: "Seismologie"
  },
  {
    id: 5,
    title: "Pendulul elastic",
    description: "Studiază oscilațiile unui corp suspendat de un resort elastic.",
    imageUrl: "https://placehold.co/600x400/3b82f6/FFFFFF?text=Pendul+Elastic",
    category: "Mecanică"
  },
  {
    id: 6,
    title: "Interferența undelor",
    description: "Observă fenomenul de interferență constructivă și distructivă între două surse de unde.",
    imageUrl: "https://placehold.co/600x400/3b82f6/FFFFFF?text=Interferență+Unde",
    category: "Unde"
  }
];

const categories = ["Toate", "Mecanică", "Unde", "Oscilații", "Seismologie"];

// SimulationCard component
const SimulationCard = ({ id, title, description, imageUrl, category }) => {
  return (
    <div className="simulation-card">
      <img src={imageUrl} alt={title} className="simulation-card__image" />
      <div className="simulation-card__content">
        <div className="simulation-card__category">{category}</div>
        <h3 className="simulation-card__title">{title}</h3>
        <p className="simulation-card__description">{description}</p>
        <button className="simulation-card__button">
          Deschide simularea
        </button>
      </div>
    </div>
  );
};

const Simulari = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSimulations = simulationsMock.filter((sim) => {
    // Filter by search
    if (
      searchQuery &&
      !sim.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sim.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== "Toate" && sim.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  return (
    <Layout>
      <div className="simulations">
        <h1 className="simulations__title">Simulări interactive</h1>
        
        <div className="simulations__intro">
          <p>
            Explorează concepte de fizică prin intermediul simulărilor interactive. 
            Modifică parametrii și observă efectele în timp real.
          </p>
        </div>

        {/* Search */}
        <div className="simulations__search">
          <div className="search-input">
            <input
              type="text"
              placeholder="Caută simulări..."
              className="search-input__field"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="search-input__icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Category Pills */}
        <div className="simulations__categories">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-pill ${
                selectedCategory === category || (category === "Toate" && !selectedCategory)
                  ? "category-pill--active"
                  : ""
              }`}
              onClick={() => setSelectedCategory(category === "Toate" ? null : category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Simulation Cards */}
        <div className="simulations__grid">
          {filteredSimulations.map((simulation) => (
            <SimulationCard
              key={simulation.id}
              id={simulation.id}
              title={simulation.title}
              description={simulation.description}
              imageUrl={simulation.imageUrl}
              category={simulation.category}
            />
          ))}
        </div>

        {filteredSimulations.length === 0 && (
          <div className="simulations__empty">
            <h3>Nicio simulare găsită</h3>
            <p>
              Încearcă să folosești alte cuvinte cheie sau să schimbi categoria selectată.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Simulari;