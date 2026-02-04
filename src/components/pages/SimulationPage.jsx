import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useAchievements } from "../../hooks/useAchievements";
import SEO from "../SEO";

const SimulationPage = ({
  id,
  title,
  description,
  iframeSrc,
  eyebrow = "Simulare interactivă",
  maxHeight
}) => {
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [user, setUser] = useState(null);
  const { checkAchievements } = useAchievements();
  const navigate = useNavigate();

  // Monitorizează starea de autentificare
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  // Salvează simularea accesată în Firebase
  useEffect(() => {
    if (!user?.uid || !id || !title) return;

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
          s => s.id === id || (s.title === title && s.id === id)
        );

        const simulationVisited = {
          id: id,
          title: title,
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
        
        // Verifică achievements după ce s-a salvat simularea
        try {
          await checkAchievements({ simulationsVisited: currentSimulationsVisited });
        } catch (error) {
          console.error('Error checking achievements:', error);
          // Nu aruncăm eroarea pentru a nu afecta salvarea simulării
        }
      } catch (error) {
        console.error('❌ Error saving simulation visited:', error);
      }
    };

    saveSimulationVisited();
  }, [user?.uid, id, title, checkAchievements]);

  const handleBack = () => {
    // Dacă există istoric de navigare, mergem înapoi, altfel revenim la lista de simulări
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/simulari");
    }
  };

  const handleToggleFullscreen = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    if (!isFullscreen) {
      const requestFullscreen =
        iframe.requestFullscreen ||
        iframe.webkitRequestFullscreen ||
        iframe.mozRequestFullscreen ||
        iframe.msRequestFullscreen;

      if (requestFullscreen) {
        requestFullscreen.call(iframe);
      } else {
        window.open(iframeSrc, "_blank");
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

    let mutationObserver;
    let resizeObserver;

    const resizeIframe = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;

        const { body, documentElement } = doc;
        const height = Math.max(
          body?.scrollHeight || 0,
          body?.offsetHeight || 0,
          documentElement?.clientHeight || 0,
          documentElement?.scrollHeight || 0,
          documentElement?.offsetHeight || 0
        );

        if (height) {
          iframe.style.height = `${height}px`;
        }
      } catch (error) {
        console.warn("Nu pot ajusta înălțimea iframe-ului:", error);
      }
    };

    const handleLoad = () => {
      resizeIframe();

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      const body = doc?.body;
      if (!body) return;

      mutationObserver = new MutationObserver(resizeIframe);
      mutationObserver.observe(body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      if ("ResizeObserver" in window) {
        resizeObserver = new ResizeObserver(resizeIframe);
        resizeObserver.observe(body);
      }

      iframe.contentWindow?.addEventListener("resize", resizeIframe);
    };

    iframe.addEventListener("load", handleLoad);

    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(Boolean(fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      iframe.removeEventListener("load", handleLoad);
      iframe.contentWindow?.removeEventListener("resize", resizeIframe);
      mutationObserver?.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, [iframeSrc]);

  return (
    <Layout>
      <SEO
        title={`${title} | Simulare Interactivă Fizică - PULS`}
        description={description || `Simulare interactivă pentru ${title}. Explorează concepte fizice prin simulări educaționale interactive.`}
        keywords={`${title}, simulare fizică, simulare interactivă, fizică educațională, ${title.toLowerCase()}`}
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
            <span className="label">Înapoi la simulări</span>
          </button>
          <header className="simulation-header">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </header>

          <div className="simulation-frame">
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              title={title}
              loading="lazy"
              allow="fullscreen"
              scrolling="no"
              style={{maxHeight: maxHeight ? maxHeight : '150vh'}}
            />
            <button
              type="button"
              className="simulation-fullscreen-btn"
              onClick={handleToggleFullscreen}
              aria-label="Comută modul fullscreen"
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

