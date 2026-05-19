import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/scss/components/_searchresults.scss";
import { normalizeString } from "../../lib/normalizeString";
import { getSiteSearchStaticEntries } from "@/data/siteSearchIndex";
import { LocalizedLink, useI18n } from "@/i18n/LanguageContext";
import SEO from "@/components/SEO";

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

/** EN: simulator rows use translated title/category and extra EN keywords for matching. */
function localizeSimulationSearchEntry(entry, translate) {
    if (!entry.path?.startsWith("/simulare/")) return entry;
    const slug = entry.path.replace("/simulare/", "").split("/")[0];
    const titleRo = entry.title;
    const titleEn = translate(`simulations.${slug}.title`, titleRo);
    const description = translate(`simulations.${slug}.description`, "");
    const caption = translate(`simulations.${slug}.caption`, "");

    const categoryKeyByRo = {
        Mecanică: "simulationCategories.mechanics",
        Pendule: "simulationCategories.pendulums",
        Oscilații: "simulationCategories.oscillations",
        Unde: "simulationCategories.waves",
        Grafice: "simulationCategories.graphs",
        Termodinamică: "simulationCategories.thermodynamics",
        Electricitate: "simulationCategories.electricity",
        Electromagnetism: "simulationCategories.electromagnetism",
        Optică: "simulationCategories.optics",
        Lasere: "simulationCategories.lasers",
        Astronomie: "simulationCategories.astronomy",
        Atomul: "simulationCategories.atom",
        "Fizică cuantică": "simulationCategories.quantumPhysics",
        "Fizică nucleară": "simulationCategories.nuclearPhysics",
        "4D": "simulationCategories.fourD",
    };
    const categoryRo = entry.category;
    const ck = categoryRo && categoryKeyByRo[categoryRo];
    const categoryEn = ck ? translate(ck, categoryRo) : categoryRo;

    const extraKeywords = [titleEn, description, caption, categoryEn].filter(Boolean);
    return {
        ...entry,
        title: titleEn,
        category: categoryEn || entry.category,
        keywords: [...(entry.keywords || []), ...extraKeywords],
    };
}

const SearchResults = () => {
    const rawQuery = useQuery().get("q") || "";
    const qNorm = normalizeString(rawQuery.trim());
    const { t, lang, localizedPath } = useI18n();

    const { value: problemeData, status: problemsStatus } = useSelector((state) => state.problems);

    const staticEntries = useMemo(() => {
        const base = getSiteSearchStaticEntries();
        if (lang !== "en") return base;
        return base.map((e) => localizeSimulationSearchEntry(e, t));
    }, [lang, t]);

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
                .map((p) => {
                    const plainTitle =
                        p.titlu ||
                        t("searchPage.problemUntitled", "Fără titlu");
                    return {
                        title: t("searchPage.problemLine", "Problema #{index}: {title}", {
                            index: p.index,
                            title: plainTitle,
                        }),
                        path: `/probleme/${p.index}`,
                        kind: "problem",
                    };
                });
        }

        const seen = new Set();
        const pageDeduped = [];
        for (const p of pages) {
            if (seen.has(p.path)) continue;
            seen.add(p.path);
            pageDeduped.push({ ...p, kind: "page" });
        }

        return { pageResults: pageDeduped, problemResults: problems };
    }, [qNorm, staticEntries, problemeData, problemsStatus, t]);

    const totalLinks = pageResults.length + problemResults.length;
    const trimmedQuery = rawQuery.trim();
    const canAskWhiz = trimmedQuery.length >= 1;
    const whizTo = localizedPath(`/asistent?q=${encodeURIComponent(trimmedQuery)}`);

    const searchInviteHeadingFallback = 'Mai ai nevoie de ajutor?';
    const searchInviteBodyFallback =
        'Căutarea de mai sus arată doar pagini și conținut de pe PULS. Dacă nu ai găsit ce căutai, poți întreba Profesorul Whiz — se deschide într-o filă nouă cu textul tău.';

    const searchTitle = trimmedQuery
        ? t("searchPage.seo.titleWithQuery", 'Rezultate pentru "{query}" | PULS', { query: trimmedQuery })
        : t("searchPage.seo.title", "Căutare | PULS");

    return (
        <div className="search-results-page">
            <SEO
                title={searchTitle}
                description={t(
                    "searchPage.seo.description",
                    "Caută pe PULS probleme de fizică, simulări și resurse.",
                )}
                keywords={t("searchPage.seo.keywords", "căutare PULS, fizică, simulări")}
                image="/res/icons/New-logo.png"
                locale={lang === "en" ? "en_US" : "ro_RO"}
            />
            <Navbar />
            <main className="search-results-main">
                <h1 className="search-results-title">
                    {t("searchPage.resultsFor", "Rezultate pentru:")}{" "}
                    <em>{trimmedQuery || t("searchPage.queryEmDash", "—")}</em>
                </h1>

                <section className="search-links-section" aria-labelledby="search-links-heading">
                    <h2 id="search-links-heading" className="search-links-heading">
                        {t("searchPage.pagesAndSimulations", "Pagini și simulări")}
                    </h2>
                    {totalLinks === 0 ? (
                        <p className="search-results-empty">
                            {t(
                                "searchPage.noSiteMatches",
                                "Niciun link potrivit pe site pentru acest text.",
                            )}
                        </p>
                    ) : (
                        <ul className="search-results-list">
                            {pageResults.map((item) => (
                                <li key={item.path} className="search-results-item">
                                    <LocalizedLink to={item.path} className="search-results-link">
                                        {item.title}
                                        {item.category ? (
                                            <span className="search-results-meta"> · {item.category}</span>
                                        ) : null}
                                    </LocalizedLink>
                                </li>
                            ))}
                            {problemResults.map((item) => (
                                <li key={item.path} className="search-results-item">
                                    <LocalizedLink
                                        to={item.path}
                                        className="search-results-link search-results-link--problem"
                                    >
                                        {item.title}
                                    </LocalizedLink>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {canAskWhiz ? (
                    <section className="search-whiz-cta-section" aria-labelledby="search-whiz-cta-heading">
                        <h2 id="search-whiz-cta-heading" className="search-whiz-cta-heading">
                            {t("assistant.searchInviteHeading", searchInviteHeadingFallback)}
                        </h2>
                        <p className="search-whiz-cta-text">
                            {t("assistant.searchInviteBody", searchInviteBodyFallback)}
                        </p>
                        <LocalizedLink
                            to={whizTo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="search-whiz-cta-button"
                        >
                            <Sparkles size={20} className="search-whiz-cta-icon" aria-hidden />
                            {t("assistant.searchAskProfessorWhiz", "Întreabă Profesorul Whiz")}
                        </LocalizedLink>
                    </section>
                ) : null}
            </main>
            <Footer />
        </div>
    );
};

export default SearchResults;
