import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../Layout";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAchievements } from "../../hooks/useAchievements";
import SEO from "../SEO";
import { parseHomeworkParams, recordAssignmentItemProgress } from "../../lib/assignmentProgress";
import { Timestamp } from "firebase/firestore";
import { useI18n } from "../../i18n/LanguageContext";
import { observeAndTranslate } from "../../i18n/domTranslator";

/** EN iframe bundles live in `/translations/simulatoare.en.json` (simulators.<slug>). */
const SIMULATOR_I18N_QUERY_SLUGS = new Set([
  "pendul-simplu",
  "pendul-amortizat",
  "pendul-neliniar",
  "grafice-pendule",
  "pendule-multiple",
  "unde-apa",
  "figuri-lissajous",
  "seism",
  "coliziuni-inelastice",
  "plan-inclinat",
  "proiectile",
  "lanturi-elastice",
  "frecare-aer",
  "tunelare-cuantica",
  "dubla-fanta",
  "apa-grea",
  "michaelson-morley",
  "fisiune-nucleara",
  "reflexie-refractie",
  "prisma",
  "motoare-termice",
  "fuel-cell",
  "supraconductivitate",
  "criogenie",
  "refractie-atmosferica",
  "legi_Kepler",
  "atom_hidrogen",
  "oscillatii-ox",
  "oscillatii-oy",
  "energie-circuite",
  "polarizare-circulara",
  "Vizualizator-4d",
  "lentila-subtire",
  "laser-interactie",
  "eli-np-laser",
  "accelerator-laser",
  "laser",
]);

const DEFAULT_EN_SIMULATOR_EYEBROW = "Interactive simulation";

const SimulationPage = ({
  id,
  slug,
  title,
  description,
  iframeSrc,
  eyebrow = "Simulare interactivă",
  maxHeight,
}) => {
  const iframeRef = useRef(null);
  const frameRef = useRef(null);
  const previewHeightBeforeFullscreenRef = useRef("");
  const iframeTranslateCleanupRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [user, setUser] = useState(null);
  const { checkAchievements } = useAchievements();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, lang, localizedPath } = useI18n();
  const previewHeight = maxHeight || "90vh";
  const iframeSrcWithLang = useMemo(() => {
    if (lang !== "en" || !slug || !SIMULATOR_I18N_QUERY_SLUGS.has(slug)) return iframeSrc;
    const sep = iframeSrc.includes("?") ? "&" : "?";
    return `${iframeSrc}${sep}lang=en`;
  }, [lang, slug, iframeSrc]);
  const translationKey = slug || id;
  const localizedTitle = t(`simulations.${translationKey}.title`, title);
  const localizedDescription = t(`simulations.${translationKey}.description`, description);

  const [enSimulatorEyebrow, setEnSimulatorEyebrow] = useState(null);

  useEffect(() => {
    if (lang !== "en" || !slug || !SIMULATOR_I18N_QUERY_SLUGS.has(slug)) {
      setEnSimulatorEyebrow(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/translations/simulatoare.en.json");
        if (!res.ok) return;
        const data = await res.json();
        const eyebrow = data?.simulators?.[slug]?.page?.eyebrow;
        if (!cancelled && typeof eyebrow === "string") setEnSimulatorEyebrow(eyebrow);
      } catch {
        /* catalog optional */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lang, slug]);

  const localizedEyebrow =
    lang === "en" && slug && SIMULATOR_I18N_QUERY_SLUGS.has(slug)
      ? enSimulatorEyebrow ?? DEFAULT_EN_SIMULATOR_EYEBROW
      : t(`simulations.${translationKey}.eyebrow`, eyebrow);

  // Monitorizează starea de autentificare
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  // Salvează simularea accesată în Firebase
  useEffect(() => {
    if (!user?.uid || !id || !localizedTitle) return;

    const saveSimulationVisited = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        
        let currentSimulationsVisited = [];
        if (snap.exists() && snap.data().simulationsVisited) {
          currentSimulationsVisited = snap.data().simulationsVisited;
        }

        // Verifică dacă simularea a fost deja accesată
        const existingIndex = currentSimulationsVisited.findIndex(
          s => s.id === id || (s.title === localizedTitle && s.id === id)
        );

        const simulationVisited = {
          id: id,
          title: localizedTitle,
          date: new Date().toISOString()
        };

        if (existingIndex >= 0) {
          // Actualizează data dacă există deja (pentru a marca ultima accesare)
          currentSimulationsVisited[existingIndex] = simulationVisited;
        } else {
          // Adaugă simularea nouă accesată
          currentSimulationsVisited.push(simulationVisited);
        }

        // Salvează în Firebase
        await updateDoc(userRef, { simulationsVisited: currentSimulationsVisited });
        console.log('✅ Simulation visited saved to Firebase');

        const hw = parseHomeworkParams(searchParams);
        if (hw && slug && user.uid) {
          try {
            await recordAssignmentItemProgress({
              classId: hw.classId,
              assignmentId: hw.assignmentId,
              studentUid: user.uid,
              itemIndex: hw.itemIndex,
              itemType: "simulation",
              patch: { done: true, visitedAt: Timestamp.now() },
              expectedSimulationSlug: slug,
            });
          } catch (hwErr) {
            console.warn("Temă simulare:", hwErr);
          }
        }

        // Verifică achievements după ce s-a salvat simularea
        try {
          await checkAchievements({
            simulationsVisited: currentSimulationsVisited,
            preloadedUserData: snap.exists() ? snap.data() : null
          });
        } catch (error) {
          console.error('Error checking achievements:', error);
          // Nu aruncăm eroarea pentru a nu afecta salvarea simulării
        }
      } catch (error) {
        console.error('❌ Error saving simulation visited:', error);
      }
    };

    saveSimulationVisited();
  }, [user?.uid, id, localizedTitle, checkAchievements, searchParams, slug]);

  const handleBack = () => {
    // Dacă există istoric de navigare, mergem înapoi, altfel revenim la lista de simulări
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(localizedPath("/simulari"));
    }
  };

  const handleIframeLoad = () => {
    iframeTranslateCleanupRef.current?.();
    iframeTranslateCleanupRef.current = null;

    if (lang !== "en") return;
    if (slug && SIMULATOR_I18N_QUERY_SLUGS.has(slug)) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const frameDocument = iframe.contentDocument || iframe.contentWindow?.document;
      if (frameDocument?.body) {
        iframeTranslateCleanupRef.current = observeAndTranslate(frameDocument);
      }
    } catch (error) {
      // Cross-origin simulations cannot be translated from here.
      console.warn("[i18n] Could not translate simulation iframe:", error);
    }
  };

  useEffect(() => () => iframeTranslateCleanupRef.current?.(), []);

  const handleToggleFullscreen = () => {
    const iframe = iframeRef.current;
    const frame = frameRef.current;
    if (!iframe || !frame) return;

    if (!isFullscreen) {
      previewHeightBeforeFullscreenRef.current = iframe.style.height;
      const requestFullscreen =
        frame.requestFullscreen ||
        frame.webkitRequestFullscreen ||
        frame.mozRequestFullscreen ||
        frame.msRequestFullscreen;

      if (requestFullscreen) {
        requestFullscreen.call(iframe);
      } else {
        window.open(iframeSrcWithLang, "_blank");
      }
    } else {
      const exitFullscreen =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen;
      exitFullscreen?.call(document);
    }
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.style.height = previewHeight;

    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      const nowFullscreen = Boolean(fullscreenElement);
      setIsFullscreen(nowFullscreen);

      if (nowFullscreen && iframeRef.current) {
        iframeRef.current.style.height = "100%";
      } else if (iframeRef.current) {
        if (previewHeightBeforeFullscreenRef.current) {
          iframeRef.current.style.height = previewHeightBeforeFullscreenRef.current;
        } else {
          iframeRef.current.style.height = previewHeight;
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [iframeSrcWithLang, previewHeight]);

  return (
    <Layout>
      <SEO
        title={`${localizedTitle} | ${t('simulationPage.seoTitleSuffix', 'Simulare Interactivă Fizică - PULS')}`}
        description={localizedDescription || t('simulationPage.seoDescription', 'Simulare interactivă pentru {title}. Explorează concepte fizice prin simulări educaționale interactive.', { title: localizedTitle })}
        keywords={`${localizedTitle}, simulare fizică, simulare interactivă, fizică educațională, ${localizedTitle.toLowerCase()}`}
        image="/res/icons/New-logo.png"
        type="article"
      />
      <section className="simulation-page">
        <div className="simulation-content">
          <button
            type="button"
            className="simulation-back-btn"
            onClick={handleBack}
          >
            <span className="icon" aria-hidden="true">
              ←
            </span>
            <span className="label">{t('simulationPage.backToList', 'Înapoi la simulări')}</span>
          </button>
          <header className="simulation-header">
            {localizedEyebrow && <p className="eyebrow">{localizedEyebrow}</p>}
            <h1>{localizedTitle}</h1>
            {localizedDescription && <p>{localizedDescription}</p>}
          </header>

          <div className="simulation-frame" ref={frameRef}>
            <iframe
              ref={iframeRef}
              src={iframeSrcWithLang}
              title={localizedTitle}
              loading="lazy"
              allow="fullscreen"
              scrolling="auto"
              style={{ height: previewHeight }}
              onLoad={handleIframeLoad}
            />
            <button
              type="button"
              className="simulation-fullscreen-btn"
              onClick={handleToggleFullscreen}
              aria-label={t('simulationPage.toggleFullscreen', 'Comută modul fullscreen')}
              data-active={isFullscreen}
            >
              <svg viewBox="0 0 60 60" role="img" aria-hidden="true">
                {isFullscreen ? (
                  <path d="M22 12h-8v8h6v-2h2zM38 12v6h2v2h6v-8zM20 34h-6v8h8v-6h-2zM40 36v6h8v-8h-6v2z" />
                ) : (
                  <path d="M24 10H10v14h6V16h8zM40 10v6h8v8h6V10zM16 40h-6v14h14v-6h-8zM48 48h-8v6h14V40h-6z" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default SimulationPage;

