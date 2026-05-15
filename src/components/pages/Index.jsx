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
import SEO from "../SEO";
import { LocalizedLink as Link, useI18n } from "../../i18n/LanguageContext";

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
    const { t } = useI18n();

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
    
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "PULS - Platformă Educațională pentru Fizică",
        "description": "Platformă educațională modernă pentru studiul fizicii cu simulări interactive, probleme BAC și asistent AI",
        "url": "https://puls-fizica.ro",
        "logo": "https://puls-fizica.ro/res/icons/New-logo.png",
        "sameAs": [
            "https://github.com/Stefanarctic/PULS"
        ],
        "educationalCredentialAwarded": "Educational Content",
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Resurse Educaționale Fizică",
            "itemListElement": [
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Course",
                        "name": "Simulări Interactive Fizică",
                        "description": "40+ simulări interactive pentru pendule, unde, oscilații, termodinamică și mai mult"
                    }
                },
                {
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Course",
                        "name": "Probleme BAC Fizică",
                        "description": "Colecție completă de probleme din examenele de bacalaureat cu rezolvări"
                    }
                }
            ]
        }
    };

    return (
        <Layout>
            <SEO
                title="PULS - Platformă Educațională pentru Fizică Interactivă | Simulări și Probleme BAC"
                description="Platformă educațională modernă pentru studiul fizicii. 40+ simulări interactive, probleme BAC cu rezolvări, resurse teoretice și asistent AI pentru elevi și profesori."
                keywords="fizică, educație, simulări fizică, probleme BAC fizică, pendule, unde, oscilații, termodinamică, mecanică, electricitate, optică, platformă educațională, învățare fizică, simulări interactive"
                image="/res/icons/New-logo.png"
                structuredData={structuredData}
            />
            {/* Hero Section */}
            <header id="hero">
                <main>
                    <div id="hero-text-container" className="hidden hidden-left">
                        <h1>{t('home.hero.title', 'Descoperă fizica prin exerciții și simulări interactive')}</h1>
                        <p>
                            {t('home.hero.subtitle', 'PULS - platforma educațională cu 40+ simulări interactive, resurse educaționale, probleme de BAC rezolvate, grile și un asistent care te ghidează pas cu pas.')}
                        </p>
                        <div className="buttons">
                            {loading || !user ? (
                                <>
                                    <button className="profile-btn-big profile-btn-red filled" onClick={handleGoogleLogin}>
                                        {t('profilePage.signedOut.signUp', 'Înregistrează-te')}
                                    </button>
                                    <button className="profile-btn-big profile-btn-blue" onClick={handleGoogleLogin}>
                                        {t('profilePage.signedOut.signIn', 'Loghează-te')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="filled">
                                        <Link to="/probleme" className="index-link">{t('home.hero.primaryCta', 'Exploreaza problemele')}</Link>
                                    </button>
                                    <button>
                                        <Link to="/simulari" className="index-link">{t('home.hero.secondaryCta', 'Incearca simularile')}</Link>
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
                <h2 className="section-title hidden hidden-bottom">{t('home.features.title', 'Ce îți oferă PULS?')}</h2>
                <div className="features-grid hidden hidden-bottom">
                    <div className="feature-card">
                        <Link to="/probleme" className="feature-link">
                            <div className="feature-icon">
                                <Atom size={48} strokeWidth={1.5} />
                            </div>
                            <h3>{t('home.features.interactiveProblems.title', 'Probleme interactive')}</h3>
                            <p>{t('home.features.interactiveProblems.description', 'Exerciții de fizică organizate pe nivel de dificultate, clasă și tematică pentru a-ți testa cunoștințele.')}</p>
                        </Link>
                    </div>
                    <div className="feature-card">
                        <Link to="/simulari" className="feature-link">
                            <div className="feature-icon">
                                <Waves size={48} strokeWidth={1.5} />
                            </div>
                            <h3>{t('home.features.visualSimulations.title', 'Simulări vizuale')}</h3>
                            <p>{t('home.features.visualSimulations.description', 'Experimentează vizual concepte fizice complexe precum pendulul simplu, undele sinusoidale și figurile Lissajous.')}</p>
                        </Link>
                    </div>
                    <div className="feature-card">
                        <Link to="/resurse" className="feature-link">
                            <div className="feature-icon">
                                <Circle size={48} strokeWidth={1.5} />
                            </div>
                            <h3>{t('home.features.teachingResources.title', 'Resurse didactice')}</h3>
                            <p>{t('home.features.teachingResources.description', 'Lecții teoretice și materiale educaționale care explică în detaliu conceptele fizice studiate.')}</p>
                        </Link>
                    </div>
                    <div className="feature-card">
                        <Link to="/profil" className="feature-link">
                            <div className="feature-icon">
                                <Activity size={48} strokeWidth={1.5} />
                            </div>
                            <h3>{t('home.features.trackedProgress.title', 'Progres monitorizat')}</h3>
                            <p>{t('home.features.trackedProgress.description', 'Urmărește-ți evoluția și vizualizează statistici personalizate pe măsură ce rezolvi probleme.')}</p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Simulations Section */}
            <section id="simulations" className="simulations-section">
                <h2 className="section-title hidden hidden-bottom">{t('home.simulationHighlights.title', 'Explorează simulările noastre')}</h2>
                <div className="simulations-grid hidden hidden-bottom">
                    <div className="simulation-card pendul">
                        <div className="simulation-content">
                            <h3>{t('home.simulationHighlights.pendulum.title', 'Pendul')}</h3>
                            <p>{t('home.simulationHighlights.pendulum.description', 'Mișcare oscilantă, forțe, energie cinetică și potențială, conservarea energiei')}</p>
                            <Link to="/simulari?category=pendule" className="simulation-button">{t('common.explore', 'Explorează')}</Link>
                        </div>
                    </div>
                    <div className="simulation-card unde">
                        <div className="simulation-content">
                            <h3>{t('home.simulationHighlights.waves.title', 'Unde')}</h3>
                            <p>{t('home.simulationHighlights.waves.description', 'Unde mecanice, unde electromagnetice, interferență, difracție și propagare')}</p>
                            <Link to="/simulari?category=unde" className="simulation-button">{t('common.explore', 'Explorează')}</Link>
                        </div>
                    </div>
                    <div className="simulation-card lissajous">
                        <div className="simulation-content">
                            <h3>{t('home.simulationHighlights.lissajous.title', 'Lissajous')}</h3>
                            <p>{t('home.simulationHighlights.lissajous.description', 'Figuri parametrice, oscilații perpendiculare, frecvențe și faze')}</p>
                            <Link to="/simulari?search=lissajous" className="simulation-button">{t('common.explore', 'Explorează')}</Link>
                        </div>
                    </div>
                    <div className="simulation-card seism">
                        <div className="simulation-content">
                            <h3>{t('home.simulationHighlights.earthquake.title', 'Seism')}</h3>
                            <p>{t('home.simulationHighlights.earthquake.description', 'Unde seismice, propagare, reflexie, refracție și principii de seismologie')}</p>
                            <Link to="/simulari?search=seism" className="simulation-button">{t('common.explore', 'Explorează')}</Link>
                        </div>
                    </div>
                </div>
                <div className="simulations-cta hidden hidden-bottom">
                    <Link to="/simulari" className="simulations-view-all-button">
                        {t('simulationsPage.viewAll', 'Vizualizează toate simulările')}
                    </Link>
                </div>
            </section>

            {/* Problems Section */}
            <section id="problems" className="problems-section">
                <h2 className="section-title hidden hidden-bottom">{t('home.problemLevels.title', 'Probleme interactive')}</h2>
                <div className="problems-grid hidden hidden-bottom">
                    <Link to="/probleme?difficulty=ușor" className="problem-card-link">
                        <div className="problem-card">
                            <div className="problem-icon">
                                <Calculator size={32} strokeWidth={1.5} />
                            </div>
                            <h3>{t('home.problemLevels.beginner.title', 'Începători')}</h3>
                            <p>{t('home.problemLevels.beginner.description', 'Probleme simple pentru a înțelege conceptele de bază ale fizicii')}</p>
                            <div className="problem-stats">
                                <span>{t('home.problemLevels.problemCount.plural', '{count} probleme', { count: getProblemsCountByDifficulty('ușor') })}</span>
                                <span className="difficulty easy">{t('home.problemLevels.beginner.difficulty', 'Ușor')}</span>
                            </div>
                            <button className="problem-button">{t('home.problemLevels.beginner.cta', 'Începe acum')}</button>
                        </div>
                    </Link>

                    <Link to="/probleme?difficulty=mediu" className="problem-card-link">
                        <div className="problem-card">
                            <div className="problem-icon">
                                <BookOpen size={32} strokeWidth={1.5} />
                            </div>
                            <h3>{t('home.problemLevels.intermediate.title', 'Intermediar')}</h3>
                            <p>{t('home.problemLevels.intermediate.description', 'Exerciții care combină mai multe concepte și necesită raționament')}</p>
                            <div className="problem-stats">
                                <span>{t('home.problemLevels.problemCount.plural', '{count} probleme', { count: getProblemsCountByDifficulty('mediu') })}</span>
                                <span className="difficulty medium">{t('home.problemLevels.intermediate.difficulty', 'Mediu')}</span>
                            </div>
                            <button className="problem-button">{t('home.problemLevels.intermediate.cta', 'Explorează')}</button>
                        </div>
                    </Link>

                   <Link to="/probleme?difficulty=dificil" className="problem-card-link">
                        <div className="problem-card">
                            <div className="problem-icon">
                                <Lightbulb size={32} strokeWidth={1.5} />
                            </div>
                            <h3>{t('home.problemLevels.advanced.title', 'Avansat')}</h3>
                            <p>{t('home.problemLevels.advanced.description', 'Probleme complexe pentru pregătirea la olimpiade și examene')}</p>
                            <div className="problem-stats">
                                <span>{t('home.problemLevels.problemCount.plural', '{count} probleme', { count: getProblemsCountByDifficulty('dificil') })}</span>
                                <span className="difficulty hard">{t('home.problemLevels.advanced.difficulty', 'Dificil')}</span>
                            </div>
                            <button className="problem-button">{t('home.problemLevels.advanced.cta', 'Provocacă-te')}</button>
                        </div>
                    </Link>

                    <Link to="/probleme?difficulty=concurs" className="problem-card-link">
                        <div className="problem-card">
                            <div className="problem-icon">
                                <Target size={32} strokeWidth={1.5} />
                            </div>
                            <h3>{t('home.problemLevels.specialized.title', 'Concurs')}</h3>
                            <p>{t('home.problemLevels.specialized.description', 'Probleme focusate pe teme specifice: pendul, unde, Lissajous, seism')}</p>
                            <div className="problem-stats">
                                <span>{t('home.problemLevels.problemCount.plural', '{count} probleme', { count: getProblemsCountByDifficulty('concurs') })}</span>
                                <span className="difficulty expert">{t('home.problemLevels.specialized.difficulty', 'Concurs')}</span>
                            </div>
                            <button className="problem-button">{t('home.problemLevels.specialized.cta', 'Specializează-te')}</button>
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
                    <h2 className="about-title index-about-title">{t('home.about.title', 'Despre noi')}</h2>
                    <p className="about-description hidden hidden-bottom index-about-description">
                        {t('home.about.paragraph1', 'P.U.L.S. este o platformă educațională pentru fizică care combină simulări interactive, probleme și grile, resurse teoretice pe mai multe capitole și instrumente digitale menite să facă abstractul vizibil. Ne-am propus să mergem dincolo de „pagină cu formule”: vrem un loc unde poți exersa pentru școală sau bac, să urmărești progresul și să explorezi fenomene, de la oscilații și unde la mecanică, termodinamică, optică sau astronomie, într-un mod modern, clar și captivant.')}
                    </p>
                    <p className="about-story hidden hidden-bottom index-about-story">
                        {t('home.about.paragraph2', 'Povestea noastră a început cu o întrebare simplă: cum putem face fenomenele fizice, în special cele oscilatorii, să prindă viață și să devină mai ușor de înțeles? Noi, o echipă de elevi pasionați de știință, am simțit mereu că, dincolo de formule și definiții, există o lume fascinantă, plină de ritm, mișcare și conexiuni surprinzătoare cu natura și tehnologia. De la acel punct de plecare, P.U.L.S. a crescut într-o platformă mai largă: simulări și experimente virtuale, colecții de probleme și variante de tip bac, grile pentru antrenament rapid, materiale și lecții grupate pe tematici, plus spațiu pentru profil și statistici ca să îți vezi evoluția. În spate stă aceeași curiozitate: fizica nu e doar simboluri pe tablă, ci mișcare, ritm și legături cu lumea reală.')}
                    </p>
                    <Link to="/about-us" className="about-preview-button hidden hidden-bottom">
                        {t('home.about.cta', 'Vezi mai mult')}
                    </Link>
                </div>
            </section>
        </Layout>
    );
}

export default Index;