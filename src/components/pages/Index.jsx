import { Link } from "react-router-dom";
import Layout from "../Layout";
import Slideshow from "../Slideshow";
import { Waves, Atom, Circle, Activity, Calculator, BookOpen, Lightbulb, Target } from "lucide-react";

const Index = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <header id="hero">
                <main>
                    <div id="hero-text-container" className="hidden hidden-left">
                        <h1>Descoperă fizica prin exerciții și simulări interactive</h1>
                        <p>
                            PULS - Platforma educațională pentru studiul conceptelor de Pendul, Unde, Lissajous și Seism prin probleme și simulări interactive.
                        </p>
                        <div className="buttons">
                            <button className="filled">
                                <Link to="/probleme" style={{ 'all': 'unset' }}>Exploreaza problemele</Link>
                            </button>
                            <button>
                                <Link to="/simulari" style={{ 'all': 'unset' }}>Incearca simularile</Link>
                            </button>
                        </div>
                    </div>
                    <div className="hero-slideshow-wrapper">
                        <div className="slideshow-parent hidden hidden-bottom">
                            <Slideshow />
                        </div>
                    </div>
                </main>
            </header>

            {/* Features Section */}
            <section id="features" className="features-section">
                <h2 className="section-title">Ce îți oferă PULS?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <Link to="/probleme" className="feature-link">
                            <div className="feature-icon">
                                <Atom size={48} strokeWidth={1.5} />
                            </div>
                            <h3>Probleme interactive</h3>
                            <p>Exerciții de fizică organizate pe nivel de dificultate, clasă și tematică pentru a-ți testa cunoștințele.</p>
                        </Link>
                    </div>
                    <div className="feature-card">
                        <Link to="/simulari" className="feature-link">
                            <div className="feature-icon">
                                <Waves size={48} strokeWidth={1.5} />
                            </div>
                            <h3>Simulări vizuale</h3>
                            <p>Experimentează vizual concepte fizice complexe precum pendulul simplu, undele sinusoidale și figurile Lissajous.</p>
                        </Link>
                    </div>
                    <div className="feature-card">
                        <Link to="/resurse" className="feature-link">
                            <div className="feature-icon">
                                <Circle size={48} strokeWidth={1.5} />
                            </div>
                            <h3>Resurse didactice</h3>
                            <p>Lecții teoretice și materiale educaționale care explică în detaliu conceptele fizice studiate.</p>
                        </Link>
                    </div>
                    <div className="feature-card">
                        <Link to="/profil" className="feature-link">
                            <div className="feature-icon">
                                <Activity size={48} strokeWidth={1.5} />
                            </div>
                            <h3>Progres monitorizat</h3>
                            <p>Urmărește-ți evoluția și vizualizează statistici personalizate pe măsură ce rezolvi probleme.</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Simulations Section */}
            <section id="probleme" className="topics-section">
                <h2 className="section-title">Explorează simulările noastre</h2>
                <div className="topics-grid">
                    <div className="topic-card pendul">
                        {/* <Link to="/resurse/pendul" className="topic-content">
                            <div className="topic-content">
                                <h3>Pendul</h3>
                                <p>Mișcare oscilantă, forțe, energie cinetică și potențială, conservarea energiei</p>
                                <button className="topic-button">Explorează</button>
                            </div>
                        </Link> */}
                        <div className="topic-content">
                            <h3>Pendul</h3>
                            <p>Mișcare oscilantă, forțe, energie cinetică și potențială, conservarea energiei</p>
                            {/* <button className="topic-button">Explorează</button> */}
                            <Link to="/resurse/pendul" className="topic-button">Explorează</Link>
                        </div>
                    </div>
                    <div className="topic-card unde">
                        <div className="topic-content">
                            <h3>Unde</h3>
                            <p>Unde mecanice, unde electromagnetice, interferență, difracție și propagare</p>
                            <Link to="/resurse/unde" className="topic-button">Explorează</Link>
                        </div>
                    </div>
                    <div className="topic-card lissajous">
                        <div className="topic-content">
                            <h3>Lissajous</h3>
                            <p>Figuri parametrice, oscilații perpendiculare, frecvențe și faze</p>
                            <Link to="/resurse/lissajous" className="topic-button">Explorează</Link>
                        </div>
                    </div>
                    <div className="topic-card seism">
                        <div className="topic-content">
                            <h3>Seism</h3>
                            <p>Unde seismice, propagare, reflexie, refracție și principii de seismologie</p>
                            <Link to="/resurse/seism" className="topic-button">Explorează</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problems Section */}
            <section id="problems" className="problems-section">
                <h2 className="section-title">Probleme interactive</h2>
                <div className="problems-grid">
                    <Link to="/problems/beginners" className="problem-card-link">
                        <div className="problem-card">
                            <div className="problem-icon">
                                <Calculator size={32} strokeWidth={1.5} />
                            </div>
                            <h3>Începători</h3>
                            <p>Probleme simple pentru a înțelege conceptele de bază ale fizicii</p>
                            <div className="problem-stats">
                                <span>120+ probleme</span>
                                <span className="difficulty easy">Ușor</span>
                            </div>
                            <button className="problem-button">Începe acum</button>
                        </div>
                    </Link>

                    <Link to="/problems/intermediate" className="problem-card-link">
                        <div className="problem-card">
                            <div className="problem-icon">
                                <BookOpen size={32} strokeWidth={1.5} />
                            </div>
                            <h3>Intermediar</h3>
                            <p>Exerciții care combină mai multe concepte și necesită raționament</p>
                            <div className="problem-stats">
                                <span>85+ probleme</span>
                                <span className="difficulty medium">Mediu</span>
                            </div>
                            <button className="problem-button">Explorează</button>
                        </div>
                    </Link>

                    <Link to="/problems/advanced" className="problem-card-link">
                        <div className="problem-card">
                            <div className="problem-icon">
                                <Lightbulb size={32} strokeWidth={1.5} />
                            </div>
                            <h3>Avansat</h3>
                            <p>Probleme complexe pentru pregătirea la olimpiade și examene</p>
                            <div className="problem-stats">
                                <span>50+ probleme</span>
                                <span className="difficulty hard">Dificil</span>
                            </div>
                            <button className="problem-button">Provocarea</button>
                        </div>
                    </Link>

                    <Link to="/problems/specialized" className="problem-card-link">
                        <div className="problem-card">
                            <div className="problem-icon">
                                <Target size={32} strokeWidth={1.5} />
                            </div>
                            <h3>Specializat</h3>
                            <p>Probleme focusate pe teme specifice: pendul, unde, Lissajous, seism</p>
                            <div className="problem-stats">
                                <span>40+ probleme</span>
                                <span className="difficulty expert">Expert</span>
                            </div>
                            <button className="problem-button">Specializează-te</button>
                        </div>
                    </Link>
                </div>
            </section>
        </Layout>
    );
}

export default Index;