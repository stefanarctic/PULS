import { Link } from "react-router-dom";
import Layout from "../Layout";
import Slideshow from "../Slideshow";
import { Waves, Atom, Circle, Activity, Calculator, BookOpen, Lightbulb, Target, GraduationCap, FileText } from "lucide-react";
import { useEffect } from "react";
import useTranslate, { getTextNodes, useTranslateObject } from "../../hooks/useTranslate";
// import { problemeData } from "../problemedata";
import { useSelector } from 'react-redux';
import { auth, provider } from '../../lib/firebase';
import { onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import ResourcesSection from "./ResourcesSection";

translate = () => {
    const texts = getTextNodes(document.body);
    const newObj = {};
    for (const { path, text } of texts) {
        newObj[path] = text;
    }
    console.log(JSON.stringify(newObj, null, 2));
}

const Index = () => {
    const { value: problemeData, status } = useSelector(state => state.problems);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Funcție pentru a calcula numărul de probleme după dificultate
    const getProblemsCountByDifficulty = (difficulty) => {
        if (status !== 'succeeded') return 0;
        return problemeData.filter(problem => problem.dificultate === difficulty).length;
    };
  
      // Funcție pentru a calcula numărul total de probleme
    const getTotalProblemsCount = () => {
        if (status !== 'succeeded') return 0;
        return problemeData.length;
    };
  
  
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show')
            }
            // else {
            //     entry.target.classList.remove('show')
            // }
        })
    });

    // const texts = useTranslate().map(text => text);
    const translations = useTranslateObject();
    

    useEffect(() => {
        const hiddenElements = document.querySelectorAll('.hidden');
        hiddenElements.forEach(el => observer.observe(el));
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
            
            // Gestionăm erorile specifice Firebase
            switch (error.code) {
                case 'auth/account-exists-with-different-credential':
                    // Există deja un cont cu acest email creat cu email/password
                    // Nu afișăm alertă pentru utilizatorii care au deja conturi email/password
                    // Acest caz este gestionat automat de Firebase
                    return;
                case 'auth/popup-closed-by-user':
                case 'auth/cancelled-popup-request':
                    // Utilizatorul a închis popup-ul - nu afișăm eroare
                    return;
                case 'auth/popup-blocked':
                    alert('Popup-ul a fost blocat de browser. Te rugăm să permiți popup-urile pentru acest site.');
                    return;
                case 'auth/network-request-failed':
                    alert('Eroare de rețea. Te rugăm să verifici conexiunea la internet.');
                    return;
                default:
                    // Pentru alte erori, afișăm mesajul generic doar dacă nu este o eroare de anulare
                    if (error.code && !error.code.includes('cancelled') && !error.code.includes('popup-closed')) {
                        alert('Eroare la autentificare!');
                    }
                    return;
            }
        }
    };

    // useEffect(() => {
    //     console.log(texts);
    // }, [texts]);

    useEffect(() => {
        console.log(JSON.stringify(translations, null, 2));
    }, [translations]);
    
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
                            {loading ? null : user ? (
                                <>
                                    <button className="filled">
                                        <Link to="/probleme" className="index-link">Exploreaza problemele</Link>
                                    </button>
                                    <button>
                                        <Link to="/simulari" className="index-link">Incearca simularile</Link>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="profile-btn-big profile-btn-red filled" onClick={handleGoogleLogin}>
                                        Înregistrează-te
                                    </button>
                                    <button className="profile-btn-big profile-btn-blue" onClick={handleGoogleLogin}>
                                        Loghează-te
                                    </button>
                                </>
                            )}
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
                <h2 className="section-title hidden hidden-bottom">Ce îți oferă PULS?</h2>
                <div className="features-grid hidden hidden-bottom">
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
            <section id="simulations" className="simulations-section">
                <h2 className="section-title hidden hidden-bottom">Explorează simulările noastre</h2>
                <div className="simulations-grid hidden hidden-bottom">
                    <div className="simulation-card pendul">
                        {/* <Link to="/resurse/pendul" className="simulation-content">
                            <div className="simulation-content">
                                <h3>Pendul</h3>
                                <p>Mișcare oscilantă, forțe, energie cinetică și potențială, conservarea energiei</p>
                                <button className="simulation-button">Explorează</button>
                            </div>
                        </Link> */}
                        <div className="simulation-content">
                            <h3>Pendul</h3>
                            <p>Mișcare oscilantă, forțe, energie cinetică și potențială, conservarea energiei</p>
                            {/* <button className="simulation-button">Explorează</button> */}
                            <Link to="/resurse/pendule" className="simulation-button">Explorează</Link>
                        </div>
                    </div>
                    <div className="simulation-card unde">
                        <div className="simulation-content">
                            <h3>Unde</h3>
                            <p>Unde mecanice, unde electromagnetice, interferență, difracție și propagare</p>
                            <Link to="/resurse/unde" className="simulation-button">Explorează</Link>
                        </div>
                    </div>
                    <div className="simulation-card lissajous">
                        <div className="simulation-content">
                            <h3>Lissajous</h3>
                            <p>Figuri parametrice, oscilații perpendiculare, frecvențe și faze</p>
                            <Link to="/resurse/lissajous" className="simulation-button">Explorează</Link>
                        </div>
                    </div>
                    <div className="simulation-card seism">
                        <div className="simulation-content">
                            <h3>Seism</h3>
                            <p>Unde seismice, propagare, reflexie, refracție și principii de seismologie</p>
                            <Link to="/resurse/seism" className="simulation-button">Explorează</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problems Section */}
            <section id="problems" className="problems-section">
                <h2 className="section-title hidden hidden-bottom">Probleme interactive</h2>
                <div className="problems-grid hidden hidden-bottom">
                    <Link to="/probleme?difficulty=ușor" className="problem-card-link">
                        <div className="problem-card">
                            <div className="problem-icon">
                                <Calculator size={32} strokeWidth={1.5} />
                            </div>
                            <h3>Începători</h3>
                            <p>Probleme simple pentru a înțelege conceptele de bază ale fizicii</p>
                            <div className="problem-stats">
                                <span>{getProblemsCountByDifficulty('ușor')} probleme</span>
                                <span className="difficulty easy">Ușor</span>
                            </div>
                            <button className="problem-button">Începe acum</button>
                        </div>
                    </Link>

                    <Link to="/probleme?difficulty=mediu" className="problem-card-link">
                        <div className="problem-card">
                            <div className="problem-icon">
                                <BookOpen size={32} strokeWidth={1.5} />
                            </div>
                            <h3>Intermediar</h3>
                            <p>Exerciții care combină mai multe concepte și necesită raționament</p>
                            <div className="problem-stats">
                                <span>{getProblemsCountByDifficulty('mediu')} probleme</span>
                                <span className="difficulty medium">Mediu</span>
                            </div>
                            <button className="problem-button">Explorează</button>
                        </div>
                    </Link>

                   <Link to="/probleme?difficulty=dificil" className="problem-card-link">
                        <div className="problem-card">
                            <div className="problem-icon">
                                <Lightbulb size={32} strokeWidth={1.5} />
                            </div>
                            <h3>Avansat</h3>
                            <p>Probleme complexe pentru pregătirea la olimpiade și examene</p>
                            <div className="problem-stats">
                                <span>{getProblemsCountByDifficulty('dificil')} probleme</span>
                                <span className="difficulty hard">Dificil</span>
                            </div>
                            <button className="problem-button">Provocacă-te</button>
                        </div>
                    </Link>

                    <Link to="/probleme?difficulty=concurs" className="problem-card-link">
                        <div className="problem-card">
                            <div className="problem-icon">
                                <Target size={32} strokeWidth={1.5} />
                            </div>
                            <h3>Concurs</h3>
                            <p>Probleme focusate pe teme specifice: pendul, unde, Lissajous, seism</p>
                            <div className="problem-stats">
                                <span>{getProblemsCountByDifficulty('concurs')} probleme</span>
                                <span className="difficulty expert">Concurs</span>
                            </div>
                            <button className="problem-button">Specializează-te</button>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Resources Section */}
            <section id="resources" className="resources-section">
                <ResourcesSection />
                {/* <h2 className="section-title hidden hidden-bottom">Resurse didactice</h2>
                <p className="resources-description hidden hidden-bottom">
                    Explorează lecții teoretice, formule esențiale, experimente practice și bibliografie recomandată pentru a-ți aprofunda cunoștințele de fizică.
                </p>
                <div className="resources-grid hidden hidden-bottom">
                    <Link to="/resurse/pendule" className="resource-card-link">
                        <div className="resource-card pendule-resource">
                            <div className="resource-image-overlay"></div>
                            <div className="resource-content">
                                <div className="resource-icon-wrapper">
                                    <Circle size={40} strokeWidth={2} />
                                </div>
                                <h3>Pendule</h3>
                                <p>Descoperă mișcarea oscilatorie, formulele și simulări pentru pendulul simplu, amortizat și neliniar.</p>
                                <span className="resource-button">Explorează →</span>
                            </div>
                        </div>
                    </Link>
                    <Link to="/resurse/unde" className="resource-card-link">
                        <div className="resource-card unde-resource">
                            <div className="resource-image-overlay"></div>
                            <div className="resource-content">
                                <div className="resource-icon-wrapper">
                                    <Waves size={40} strokeWidth={2} />
                                </div>
                                <h3>Unde</h3>
                                <p>Află despre propagarea undelor mecanice și electromagnetice, tipuri de unde și simulări interactive.</p>
                                <span className="resource-button">Explorează →</span>
                            </div>
                        </div>
                    </Link>
                    <Link to="/resurse/lissajous" className="resource-card-link">
                        <div className="resource-card lissajous-resource">
                            <div className="resource-image-overlay"></div>
                            <div className="resource-content">
                                <div className="resource-icon-wrapper">
                                    <Atom size={40} strokeWidth={2} />
                                </div>
                                <h3>Figuri Lissajous</h3>
                                <p>Explorează curbele Lissajous, ecuațiile parametrice și aplicațiile lor în fizică.</p>
                                <span className="resource-button">Explorează →</span>
                            </div>
                        </div>
                    </Link>
                    <Link to="/resurse/seism" className="resource-card-link">
                        <div className="resource-card seism-resource">
                            <div className="resource-image-overlay"></div>
                            <div className="resource-content">
                                <div className="resource-icon-wrapper">
                                    <Activity size={40} strokeWidth={2} />
                                </div>
                                <h3>Seisme</h3>
                                <p>Învață despre cutremure, unde seismice, propagare și vizualizări interactive.</p>
                                <span className="resource-button">Explorează →</span>
                            </div>
                        </div>
                    </Link>
                    <Link to="/resurse/termodinamica" className="resource-card-link">
                        <div className="resource-card termodinamica-resource">
                            <div className="resource-image-overlay"></div>
                            <div className="resource-content">
                                <div className="resource-icon-wrapper">
                                    <FileText size={40} strokeWidth={2} />
                                </div>
                                <h3>Termodinamică</h3>
                                <p>Învață despre termodinamică, principiile și aplicațiile ei în fizică.</p>
                                <span className="resource-button">Explorează →</span>
                            </div>
                        </div>
                    </Link>
                    <Link to="/resurse/mecanica" className="resource-card-link">
                        <div className="resource-card mecanica-resource">
                            <div className="resource-image-overlay"></div>
                            <div className="resource-content">
                                <div className="resource-icon-wrapper">
                                    <GraduationCap size={40} strokeWidth={2} />
                                </div>
                                <h3>Mecanică</h3>
                                <p>Învață despre mecanică, principiile și aplicațiile ei în fizică.</p>
                                <span className="resource-button">Explorează →</span>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="resources-cta hidden hidden-bottom" style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <Link to="/resurse" className="resources-view-all-button">
                        Vezi toate resursele
                    </Link>
                </div> */}
            </section>

            {/* About Us Preview Section */}
            <section className="about-preview-section hidden hidden-bottom">
                <div className="about-preview-text hidden hidden-bottom">
                    <h2 className="about-title index-about-title">Despre noi</h2>
                    <p className="about-description hidden hidden-bottom index-about-description">
                        Suntem dedicați educației moderne și inovării în predarea fizicii. Platforma noastră oferă simulări interactive și exerciții pentru a transforma învățarea într-o experiență captivantă și practică.
                    </p>
                    <p className="about-story hidden hidden-bottom index-about-story">
                        Povestea noastră a început cu o simplă întrebare: cum putem face ca fenomenele oscilatorii să prindă viață și să devină mai ușor de înțeles pentru toți cei care le studiază? Noi, o echipă de elevi pasionați de știință, am simțit mereu că, dincolo de formule și definiții, există o lume fascinantă, plină de ritm, mișcare și conexiuni surprinzătoare cu natura și tehnologia.
                    </p>
                    <Link to="/about-us" className="about-preview-button hidden hidden-bottom">
                        Vezi mai mult
                    </Link>
                </div>
            </section>
        </Layout>
    );
}

export default Index;