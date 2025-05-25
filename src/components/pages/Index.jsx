import { Link } from "react-router-dom";
import Layout from "../Layout";
import Slideshow from "../Slideshow";
import { Waves, Atom, Circle, Activity } from "lucide-react";

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
                                <Link to="/probleme" style={{'all': 'unset'}}>Exploreaza problemele</Link>
                            </button>
                            <button>
                                <Link to="/simulari" style={{'all': 'unset'}}>Incearca simularile</Link>
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

            {/* Topics Section */}
            <section id="probleme" className="topics-section">
                <h2 className="section-title">Categorii de resurse</h2>
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
                            <Link to="/Simulari/pendule" className="topic-button">Explorează</Link>
                        </div>
                    </div>
                    <div className="topic-card unde">
                        <div className="topic-content">
                            <h3>Unde</h3>
                            <p>Unde mecanice, unde electromagnetice, interferență, difracție și propagare</p>
                            <Link to="/Simulari/unde" className="topic-button">Explorează</Link>
                        </div>
                    </div>
                    <div className="topic-card lissajous">
                        <div className="topic-content">
                            <h3>Lissajous</h3>
                            <p>Figuri parametrice, oscilații perpendiculare, frecvențe și faze</p>
                            <Link to="/Simulari/lissajous" className="topic-button">Explorează</Link>
                        </div>
                    </div>
                    <div className="topic-card seism">
                        <div className="topic-content">
                            <h3>Seism</h3>
                            <p>Unde seismice, propagare, reflexie, refracție și principii de seismologie</p>
                            <Link to="/Simulari/seism" className="topic-button">Explorează</Link>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}

export default Index;