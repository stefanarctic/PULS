import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/scss/components/searchresul.scss";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
    const query = useQuery().get("q")?.toLowerCase() || "";

    const allData = [
        {
            title: "Pendule",
            path: "/Simulari/pendule",
            keywords: [
                "pendul", "pendule", "pendulum", "pendulare", "pendulare simpla", "pendulare simplă", "pendul simplu", "pendul matematic", "pendul fizic",
                "pend", "pen", "pndul", "pendu", "pendl", "penduul", "pendull", "pendlum", "pendulm", "pendulum", "pendulum simplu",
                "oscilație", "oscillatie", "oscillation", "oscilatie", "oscill", "osc", "oscil", "oscila", "oscilat", "oscillate", "oscillating",
                "pendulum physics", "pendulum experiment", "pendulum simulation", "pendulum sim", "pendulum fizica", "pendulum experimente"
            ]
        },
        {
            title: "Unde",
            path: "/Simulari/unde",
            keywords: [
                "unda", "unde", "wave", "waves", "unda mecanica", "unda mecanică", "unda transversala", "unda transversală", "unda longitudinala", "unda longitudinală",
                "oscilație", "oscilatii", "oscilatie", "oscillation", "oscillations", "vibrație", "vibratie", "vibratii", "vibrations", "vibra", "vibrat",
                "un", "und", "wav", "wavw", "wvae", "wve", "undee", "undea", "undele", "undelor", "unda fizica", "unda experiment", "unda sim"
            ]
        },
        {
            title: "Lissajous",
            path: "/Simulari/lissajous",
            keywords: [
                "lissajous", "figuri lissajous", "figura lissajous", "lissajou", "lisa", "liss", "figuri", "figura", "oscilloscope", "oscilloscop",
                "lissajous figures", "lissajous figure", "lissajous sim", "lissajous simulation", "lissajous experimente", "lissajous physics",
                "lisajous", "lisajou", "lisajus", "lisajus", "lisaj", "lissaj", "lissajous pattern", "lissajous patterns"
            ]
        },
        {
            title: "Seisme",
            path: "/Simulari/seism",
            keywords: [
                "seism", "seisme", "cutremur", "cutremure", "earthquake", "earthquakes", "seismic", "seismograf", "seismologie", "sei", "seis",
                "seismology", "seismology", "seismology", "seismology", "seism experiment", "seism sim", "seism simulation", "seism fizica",
                "cutremr", "cutremr", "cutremr", "cutremr", "cutrem", "cutre", "cutr", "seisme fizica", "seism physics"
            ]
        },
        {
            title: "Resurse",
            path: "/resurse",
            keywords: [
                "resursa", "resurse", "resource", "resources", "materiale", "material", "manual", "manuale", "ghid", "ghiduri", "pdf", "documentatie", "doc",
                "resurce", "resur", "res", "resouce", "resoruce", "resursee", "resursee", "resursee", "resursee", "resurse fizica", "resurse experiment"
            ]
        },
        {
            title: "Probleme",
            path: "/probleme",
            keywords: [
                "problema", "probleme", "exercitii", "exercițiu", "exercise", "exercises", "test", "teste", "quiz", "quizz", "intrebare", "intrebari",
                "question", "questions", "prob", "ex", "probleme fizica", "probleme experiment", "probleme sim", "probleme simulare",
                "problema fizica", "problema experiment", "problema sim", "problema simulare", "exerciti", "exercit", "exercitii fizica"
            ]
        },
        {
            title: "Simulari",
            path: "/Simulari",
            keywords: [
                "simulare", "simulari", "simulări", "simulare fizica", "simulare unda", "simulare pendul", "sim", "simul", "simulatie", "simulație",
                "simulations", "simulation", "simulare experiment", "simulare physics", "simulare experimente", "simulare sim", "simulare simulare",
                "simulări fizica", "simulări experiment", "simulări sim", "simulări simulare", "simulati", "simulati", "simular", "simulr"
            ]
        },
         {
            title: "Muie Ţie",
            keywords: [
               "muie", "muie ţie", "muie tie", "muie ție", "muie ţie", "muie tie", "muie", "muie muie", "muie muie ţie", "muie muie tie", "muie muie ție", "muie muie ţie",
                "muie muie muie", "muie muie muie ţie", "muie muie muie tie", "muie muie muie ție", "muie muie muie ţie", "muie muie muie tie",
                "muie muie muie muie", "muie muie muie muie ţie", "muie muie muie muie tie", "muie muie muie muie ție", "muie muie muie muie ţie", "muie muie muie muie tie",
                "pula", "pula mea", "pula ta", "pula lui", "pula lor", "pula noastra", "pula voastra", "pula voastra mea",
                "pula mea muie", "pula ta muie", "pula lui muie", "pula lor muie", "pula noastra muie", "pula voastra muie", "pula voastra mea muie",
                "suge pula", "suge pula mea", "suge pula ta", "suge pula lui", "suge pula lor", "suge pula noastra", "suge pula voastra", "suge pula voastra mea",
            ]
        }
    ];

    const results = useMemo(
        () =>
            allData.filter(item =>
                item.title.toLowerCase().includes(query) ||
                (item.keywords && item.keywords.some(kw => kw.includes(query)))
            ),
        [query]
    );

    return (
        <div className="search-results-page">
            <Navbar />
            <main className="search-results-main">
                <h1 className="search-results-title">
                    Rezultate pentru: <em>{query}</em>
                </h1>
                {results.length === 0 ? (
                    <p className="search-results-empty">Niciun rezultat găsit.</p>
                ) : (
                    <ul className="search-results-list">
                        {results.map(item => (
                            <li key={item.path} className="search-results-item">
                                <a href={item.path} className="search-results-link">{item.title}</a>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default SearchResults;