import { Link, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/scss/components/_searchresults.scss";
import { normalizeString } from "../../lib/normalizeString";
import { getSiteSearchStaticEntries } from "@/data/siteSearchIndex";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function matchesEntry(entry, qNorm) {
    if (!qNorm) return false;
    if (normalizeString(entry.title).includes(qNorm)) return true;
    if (entry.path && normalizeString(entry.path).includes(qNorm)) return true;
    if (entry.category && normalizeString(entry.category).includes(qNorm)) return true;
    if (entry.keywords?.some((kw) => normalizeString(kw).includes(qNorm))) return true;
    const blob = [entry.title, entry.path, entry.category, ...(entry.keywords || [])]
        .filter(Boolean)
        .join(" ");
    return normalizeString(blob).includes(qNorm);
}

const SearchResults = () => {
    const rawQuery = useQuery().get("q") || "";
    const qNorm = normalizeString(rawQuery.trim());

    const { value: problemeData, status: problemsStatus } = useSelector((state) => state.problems);

    const staticEntries = useMemo(() => getSiteSearchStaticEntries(), []);

    const { pageResults, problemResults } = useMemo(() => {
        if (!qNorm) {
            return { pageResults: [], problemResults: [] };
        }

        const pages = staticEntries.filter((e) => matchesEntry(e, qNorm));

        let problems = [];
        if (problemsStatus === "succeeded" && Array.isArray(problemeData)) {
            problems = problemeData
                .filter((p) => {
                    const t = normalizeString(p.titlu || "");
                    const d = normalizeString(p.descriere || "");
                    const idx = String(p.index ?? "");
                    return (
                        t.includes(qNorm) ||
                        d.includes(qNorm) ||
                        idx.includes(qNorm) ||
                        (qNorm.length >= 1 && idx === qNorm)
                    );
                })
                .slice(0, 50)
                .map((p) => ({
                    title: `Problema #${p.index}: ${p.titlu || "Fără titlu"}`,
                    path: `/probleme/${p.index}`,
                    kind: "problem",
                }));
        }

        const seen = new Set();
        const pageDeduped = [];
        for (const p of pages) {
            if (seen.has(p.path)) continue;
            seen.add(p.path);
            pageDeduped.push({ ...p, kind: "page" });
        }

        return { pageResults: pageDeduped, problemResults: problems };
    }, [qNorm, staticEntries, problemeData, problemsStatus]);

    const totalLinks = pageResults.length + problemResults.length;
    const trimmedQuery = rawQuery.trim();
    const canAskWhiz = trimmedQuery.length >= 1;
    const whizTo = `/asistent?q=${encodeURIComponent(trimmedQuery)}`;

    return (
        <div className="search-results-page">
            <Navbar />
            <main className="search-results-main">
                <h1 className="search-results-title">
                    Rezultate pentru: <em>{trimmedQuery || "—"}</em>
                </h1>

                <section className="search-links-section" aria-labelledby="search-links-heading">
                    <h2 id="search-links-heading" className="search-links-heading">
                        Pagini și simulări
                    </h2>
                    {totalLinks === 0 ? (
                        <p className="search-results-empty">
                            Niciun link potrivit pe site pentru acest text.
                        </p>
                    ) : (
                        <ul className="search-results-list">
                            {pageResults.map((item) => (
                                <li key={item.path} className="search-results-item">
                                    <Link to={item.path} className="search-results-link">
                                        {item.title}
                                        {item.category ? (
                                            <span className="search-results-meta"> · {item.category}</span>
                                        ) : null}
                                    </Link>
                                </li>
                            ))}
                            {problemResults.map((item) => (
                                <li key={item.path} className="search-results-item">
                                    <Link to={item.path} className="search-results-link search-results-link--problem">
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {canAskWhiz ? (
                    <section className="search-whiz-cta-section" aria-labelledby="search-whiz-cta-heading">
                        <h2 id="search-whiz-cta-heading" className="search-whiz-cta-heading">
                            Mai ai nevoie de ajutor?
                        </h2>
                        <p className="search-whiz-cta-text">
                            Căutarea de mai sus arată doar pagini și conținut de pe PULS. Dacă nu ai găsit ce
                            căutai, poți întreba Profesorul Whiz — se deschide într-o filă nouă cu textul tău.
                        </p>
                        <Link
                            to={whizTo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="search-whiz-cta-button"
                        >
                            <Sparkles size={20} className="search-whiz-cta-icon" aria-hidden />
                            Întreabă Profesorul Whiz
                        </Link>
                    </section>
                ) : null}
            </main>
            <Footer />
        </div>
    );
};

export default SearchResults;
