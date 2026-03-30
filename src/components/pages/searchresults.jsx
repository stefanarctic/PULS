import { Link, useLocation } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/scss/components/_searchresults.scss";
import { normalizeString } from "../../lib/normalizeString";
import { getSiteSearchStaticEntries } from "@/data/siteSearchIndex";
import { fetchAssistantReply } from "@/lib/assistantChatApi";

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

const preprocessTextForMarkdown = (text) => {
    if (!text) return text;
    const markdownLinks = [];
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkIndex = 0;
    let protectedText = text;
    let linkMatch;
    while ((linkMatch = markdownLinkRegex.exec(text)) !== null) {
        const placeholder = `__MARKDOWN_LINK_${linkIndex}__`;
        markdownLinks.push(linkMatch[0]);
        protectedText = protectedText.replace(linkMatch[0], placeholder);
        linkIndex++;
    }
    protectedText = protectedText.replace(/\[([^\]]+)\]/g, (match, content) => {
        if (content.startsWith("__MARKDOWN_LINK_")) return match;
        const trimmedContent = content.trim();
        const hasLatex =
            /\\[a-zA-Z]{2,}|\\[^a-zA-Z\s]|\\mathrm\{|\\frac\{|\\cdot|\\sin|\\cos|\\tan|\\sqrt|\\sum|\\int|\\alpha|\\beta|\\gamma|\\delta|\\theta|\\pi|\\mu|\\Delta|[\^_{}]/.test(
                trimmedContent
            );
        const hasMathOperators = /[A-Za-z]\s*[=+\-*/]\s*[A-Za-z0-9]/.test(trimmedContent);
        if (hasLatex || (hasMathOperators && trimmedContent.length > 3)) {
            return `\\(${trimmedContent}\\)`;
        }
        return match;
    });
    markdownLinks.forEach((link, index) => {
        protectedText = protectedText.replace(`__MARKDOWN_LINK_${index}__`, link);
    });
    const hasMarkdownLinks = /\[([^\]]+)\]\(([^)]+)\)/.test(protectedText);
    if (!hasMarkdownLinks) {
        const urlRegex = /(https?:\/\/[^\s<>"'.!?;:)\]}]+)/g;
        protectedText = protectedText.replace(urlRegex, (url) => `[${url}](${url})`);
    }
    return protectedText;
};

const SearchResults = () => {
    const rawQuery = useQuery().get("q") || "";
    const qNorm = normalizeString(rawQuery.trim());

    const { value: problemeData, status: problemsStatus } = useSelector((state) => state.problems);
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [aiAnswer, setAiAnswer] = useState("");

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthReady(true);
        });
        return () => unsub();
    }, []);

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

    const shouldFetchAi = authReady && user?.uid && rawQuery.trim().length >= 2;

    useEffect(() => {
        setAiAnswer("");
        setAiError(null);
        if (!shouldFetchAi) {
            setAiLoading(false);
            return;
        }

        const ac = new AbortController();
        const sessionId = `search-${user.uid}-${Date.now()}`;
        const message = rawQuery.trim();

        setAiLoading(true);

        (async () => {
            try {
                const text = await fetchAssistantReply(message, sessionId, { signal: ac.signal });
                if (ac.signal.aborted) return;
                setAiAnswer(text);
            } catch (e) {
                if (ac.signal.aborted || e?.name === "AbortError") return;
                setAiError(e.message || "Nu am putut obține răspunsul.");
            } finally {
                if (!ac.signal.aborted) setAiLoading(false);
            }
        })();

        return () => ac.abort();
    }, [shouldFetchAi, rawQuery, user?.uid]);

    useEffect(() => {
        if (!aiAnswer || !window.MathJax?.typesetPromise) return;
        const t = setTimeout(() => {
            const el = document.querySelector(".search-ai-markdown");
            if (el) window.MathJax.typesetPromise([el]).catch(() => {});
        }, 80);
        return () => clearTimeout(t);
    }, [aiAnswer]);

    const totalLinks = pageResults.length + problemResults.length;

    return (
        <div className="search-results-page">
            <Navbar />
            <main className="search-results-main">
                <h1 className="search-results-title">
                    Rezultate pentru: <em>{rawQuery.trim() || "—"}</em>
                </h1>

                <section className="search-ai-section" aria-labelledby="search-ai-heading">
                    <h2 id="search-ai-heading" className="search-ai-heading">
                        <Sparkles size={22} className="search-ai-icon" aria-hidden />
                        Profesorul Whiz
                    </h2>
                    {!authReady ? (
                        <p className="search-ai-hint">Se încarcă…</p>
                    ) : !user ? (
                        <p className="search-ai-hint">
                            Conectează-te (buton din colț) ca să primești automat un răspuns la căutarea ta aici.
                        </p>
                    ) : aiLoading ? (
                        <div className="search-ai-loading">
                            <Loader2 className="search-ai-spinner" size={28} aria-hidden />
                            <span>Generez răspunsul…</span>
                        </div>
                    ) : aiError ? (
                        <p className="search-ai-error" role="alert">
                            {aiError}
                        </p>
                    ) : aiAnswer ? (
                        <div className="search-ai-markdown">
                            <ReactMarkdown
                                components={{
                                    a: ({ ...props }) => (
                                        <a {...props} className="assistant-link" target="_self" rel="noopener noreferrer" />
                                    ),
                                }}
                            >
                                {preprocessTextForMarkdown(aiAnswer)}
                            </ReactMarkdown>
                        </div>
                    ) : rawQuery.trim().length < 2 ? (
                        <p className="search-ai-hint">Scrie cel puțin 2 caractere în bara de căutare pentru un răspuns AI.</p>
                    ) : null}
                </section>

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
            </main>
            <Footer />
        </div>
    );
};

export default SearchResults;
