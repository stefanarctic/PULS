import { useLocation } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/scss/components/_searchresults.scss";
import { normalizeString } from "../../lib/normalizeString";
import { getSiteSearchStaticEntries } from "@/data/siteSearchIndex";
import { LocalizedLink, useI18n } from "@/i18n/LanguageContext";
import SEO from "@/components/SEO";
import { fetchProblemsEnglishSnippetsBatch } from "@/lib/problemEnFirestoreSnippet";

const PROBLEM_EN_PROBE_CHUNK = 40;
const PROBLEM_EN_PROBE_READ_CAP = 240;
const MIN_QUERY_LEN_PROBE = 2;

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

function problemMatchesSearchQueryRo(p, qNorm) {
    const titleNorm = normalizeString(p.titlu || "");
    const descNorm = normalizeString(p.descriere || "");
    const idx = String(p.index ?? "");
    return (
        titleNorm.includes(qNorm) ||
        descNorm.includes(qNorm) ||
        idx.includes(qNorm) ||
        (qNorm.length >= 1 && idx === qNorm)
    );
}

function problemSnippetMatchesLangEn(snippet, qNorm) {
    if (!snippet || typeof snippet !== "object") return false;
    const tn = normalizeString(snippet.titlu || "");
    const dn = normalizeString(snippet.descriere || "");
    return tn.includes(qNorm) || dn.includes(qNorm);
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

    /** Probleme care se potrivesc pe câmpurile din colecția `problems` (RO). */
    const matchingRoProblems = useMemo(() => {
        if (!qNorm || problemsStatus !== "succeeded" || !Array.isArray(problemeData)) return [];
        return problemeData.filter((p) => problemMatchesSearchQueryRo(p, qNorm));
    }, [problemeData, problemsStatus, qNorm]);

    const [problemEnSnippets, setProblemEnSnippets] = useState({});
    /** Probleme găsite doar după titlu/descriere EN (când căutarea RO nu dă lovituri). */
    const [enOnlyProblems, setEnOnlyProblems] = useState([]);
    const [problemEnSnippetsLoading, setProblemEnSnippetsLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;

        if (lang !== "en") {
            setProblemEnSnippets({});
            setEnOnlyProblems([]);
            setProblemEnSnippetsLoading(false);
            return;
        }

        if (!qNorm || problemsStatus !== "succeeded" || !Array.isArray(problemeData)) {
            setProblemEnSnippets({});
            setEnOnlyProblems([]);
            setProblemEnSnippetsLoading(false);
            return;
        }

        (async () => {
            setProblemEnSnippetsLoading(true);

            /** @type {Record<string, {titlu?: string, descriere?: string}>} */
            const mergedSnippets = {};
            let nextEnOnly = [];

            try {
                const roHits = problemeData.filter((p) => problemMatchesSearchQueryRo(p, qNorm));

                if (roHits.length > 0) {
                    const top = roHits.slice(0, 50).filter((p) => p.id);
                    const batch = await fetchProblemsEnglishSnippetsBatch(top.map((p) => p.id));
                    if (!cancelled) Object.assign(mergedSnippets, batch);
                    nextEnOnly = [];
                } else if (rawQuery.trim().length >= MIN_QUERY_LEN_PROBE) {
                    const matchedProblems = [];
                    let readsDone = 0;

                    for (
                        let i = 0;
                        i < problemeData.length && matchedProblems.length < 50 && readsDone < PROBLEM_EN_PROBE_READ_CAP;
                        i += PROBLEM_EN_PROBE_CHUNK
                    ) {
                        const slice = problemeData.slice(i, i + PROBLEM_EN_PROBE_CHUNK);
                        const ids = slice.map((p) => p.id).filter(Boolean);
                        if (!ids.length) continue;
                        readsDone += ids.length;
                        const chunkSnippets = await fetchProblemsEnglishSnippetsBatch(ids);
                        if (cancelled) break;
                        Object.assign(mergedSnippets, chunkSnippets);

                        for (const p of slice) {
                            if (!p.id || matchedProblems.length >= 50) continue;
                            const snippet = chunkSnippets[p.id];
                            if (problemSnippetMatchesLangEn(snippet, qNorm)) {
                                matchedProblems.push(p);
                            }
                        }
                    }

                    nextEnOnly = matchedProblems;
                }

                if (!cancelled) {
                    setProblemEnSnippets(mergedSnippets);
                    setEnOnlyProblems(nextEnOnly);
                }
            } catch (e) {
                console.error("[SearchResults] EN snippets", e);
                if (!cancelled) {
                    setProblemEnSnippets({});
                    setEnOnlyProblems([]);
                }
            } finally {
                if (!cancelled) setProblemEnSnippetsLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [lang, qNorm, problemsStatus, problemeData, rawQuery]);

    /** Lista de afișat (max 50): întâi potriviri RO, altfel rezultate doar-en. */
    const problemsDisplayed = useMemo(() => {
        if (!qNorm) return [];
        if (matchingRoProblems.length > 0) return matchingRoProblems.slice(0, 50);
        if (lang === "en") return enOnlyProblems.slice(0, 50);
        return [];
    }, [matchingRoProblems, enOnlyProblems, lang, qNorm]);

    const problemResults = useMemo(() => {
        if (!qNorm) return [];
        return problemsDisplayed.map((p) => {
            const snippetTitlu =
                lang === "en" && p.id && problemEnSnippets[p.id]?.titlu
                    ? String(problemEnSnippets[p.id].titlu).trim()
                    : "";
            const plainTitle =
                snippetTitlu ||
                p.titlu ||
                t("searchPage.problemUntitled", "Fără titlu");
            return {
                title: t("searchPage.problemLine", "Problema #{index}: {title}", {
                    index: p.index,
                    title: plainTitle,
                }),
                path: `/probleme/${p.index}`,
                kind: "problem",
                key: `${p.index}-${p.id || ""}`,
            };
        });
    }, [problemsDisplayed, problemEnSnippets, lang, qNorm, t]);

    const pageResults = useMemo(() => {
        if (!qNorm) return [];
        const pages = staticEntries.filter((e) => matchesEntry(e, qNorm));
        const seen = new Set();
        const pageDeduped = [];
        for (const p of pages) {
            if (seen.has(p.path)) continue;
            seen.add(p.path);
            pageDeduped.push({ ...p, kind: "page" });
        }
        return pageDeduped;
    }, [qNorm, staticEntries]);

    const totalLinks = pageResults.length + problemResults.length;
    const trimmedQuery = rawQuery.trim();

    /** Evită „niciun rezultat” în EN în timpul încărcării traducerilor (probe sau titluri EN). */
    const suppressProblemEmptyNotice =
        lang === "en" &&
        qNorm &&
        problemsStatus === "succeeded" &&
        matchingRoProblems.length === 0 &&
        problemEnSnippetsLoading &&
        pageResults.length === 0 &&
        trimmedQuery.length >= MIN_QUERY_LEN_PROBE;

    const canAskWhiz = trimmedQuery.length >= 1;
    const whizTo = localizedPath(`/asistent?q=${encodeURIComponent(trimmedQuery)}`);

    const searchInviteHeadingFallback = "Mai ai nevoie de ajutor?";
    const searchInviteBodyFallback =
        "Căutarea de mai sus arată doar pagini și conținut de pe PULS. Dacă nu ai găsit ce căutai, poți întreba Profesorul Whiz — se deschide într-o filă nouă cu textul tău.";

    const searchTitle = trimmedQuery
        ? t("searchPage.seo.titleWithQuery", 'Rezultate pentru "{query}" | PULS', {
              query: trimmedQuery,
          })
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

                    {lang === "en" && suppressProblemEmptyNotice ? (
                        <p className="search-results-empty" aria-live="polite">
                            {t(
                                "searchPage.loadingProblemTranslations",
                                "Se încarcă rezultatele (titluri în engleză)...",
                            )}
                        </p>
                    ) : null}

                    {totalLinks === 0 && !suppressProblemEmptyNotice ? (
                        <p className="search-results-empty">
                            {t(
                                "searchPage.noSiteMatches",
                                "Niciun link potrivit pe site pentru acest text.",
                            )}
                        </p>
                    ) : null}

                    {totalLinks > 0 ? (
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
                                <li key={item.key || item.path} className="search-results-item">
                                    <LocalizedLink
                                        to={item.path}
                                        className="search-results-link search-results-link--problem"
                                    >
                                        {item.title}
                                    </LocalizedLink>
                                </li>
                            ))}
                        </ul>
                    ) : null}
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
