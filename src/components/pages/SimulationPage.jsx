import { useEffect, useRef, useState } from "react";
import Layout from "../Layout";

const SimulationPage = ({
  title,
  description,
  iframeSrc,
  eyebrow = "Simulare interactivă",
  maxHeight
}) => {
  const iframeRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      <section className="simulation-page">
        <div className="simulation-content">
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

