import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, X } from "lucide-react";
import {
  MR_DEUTERON_ORIGIN,
  buildMrDeuteronEmbeddedUrl,
} from "@/data/mrDeuteron";
import { useI18n } from "@/i18n/LanguageContext";
import "../scss/components/_mr-deuteron-widget.scss";

const AVATAR_SRC = "/res/mr-deuteron-avatar.png";

function bodyLock() {
  const prev = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = prev;
  };
}

export default function MrDeuteronWidget() {
  const { lang, t } = useI18n();

  /** Fixed when opening the panel so iframe is not rebuilt on site language toggle (child uses LANGUAGE_CHANGE instead). */
  const [iframeSrc, setIframeSrc] = useState("");
  const [open, setOpen] = useState(false);
  const [fs, setFs] = useState(false);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);
  const iframeRef = useRef(null);

  const fabTitle = useMemo(
    () => t("mrDeuteron.fabTitle", "Mr. Deuteron — asistent D₂O și fizică nucleară"),
    [t]
  );

  useEffect(() => {
    if (!open) return undefined;
    return bodyLock();
  }, [open]);

  const onFsChange = useCallback(() => {
    setFs(Boolean(document.fullscreenElement));
  }, []);

  useEffect(() => {
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [onFsChange]);

  useEffect(() => {
    if (!open) return;
    const focusTimerId = setTimeout(() => closeBtnRef.current?.focus(), 100);
    return () => clearTimeout(focusTimerId);
  }, [open]);

  /** Sync with iframe app: URL `?lang=` on first load + live updates via postMessage. */
  const postLanguageToIframe = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    try {
      win.postMessage({ type: "LANGUAGE_CHANGE", lang }, MR_DEUTERON_ORIGIN);
    } catch {
      /* noop */
    }
  }, [lang]);

  useEffect(() => {
    if (!open || !iframeSrc) return undefined;
    postLanguageToIframe();
    return undefined;
  }, [iframeSrc, lang, open, postLanguageToIframe]);

  const closePanel = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    setOpen(false);
    setIframeSrc("");
  }, []);

  const openPanel = useCallback(() => {
    setIframeSrc(buildMrDeuteronEmbeddedUrl(lang));
    setOpen(true);
  }, [lang]);

  const toggleFs = useCallback(() => {
    const el = panelRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        closePanel();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closePanel]);

  const modal = open
    ? createPortal(
        <div
          className="mr-deuteron-overlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePanel();
          }}
        >
          <div
            className="mr-deuteron-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t(
              "mrDeuteron.dialogAriaLabel",
              "Mr. Deuteron — chat D₂O și fizică nucleară"
            )}
          >
            <div className="mr-deuteron-panel__frame-wrap">
              <div className="mr-deuteron-panel__toolbar">
                <button
                  type="button"
                  className="mr-deuteron-toolbar-btn"
                  onClick={toggleFs}
                  title={fs ? t("mrDeuteron.exitFullscreen", "Ieși din ecran complet") : t("mrDeuteron.enterFullscreen", "Ecran complet")}
                  aria-label={fs ? t("mrDeuteron.exitFullscreen", "Ieși din ecran complet") : t("mrDeuteron.enterFullscreen", "Ecran complet")}
                >
                  {fs ? <Minimize2 size={16} strokeWidth={2.25} /> : <Maximize2 size={16} strokeWidth={2.25} />}
                </button>
                <button
                  type="button"
                  ref={closeBtnRef}
                  className="mr-deuteron-toolbar-btn"
                  onClick={closePanel}
                  title={t("mrDeuteron.closePanel", "Închide")}
                  aria-label={t("mrDeuteron.closePanel", "Închide fereastra")}
                >
                  <X size={16} strokeWidth={2.25} />
                </button>
              </div>
              {iframeSrc ? (
                <iframe
                  ref={iframeRef}
                  title={t("mrDeuteron.iframeTitle", "Mr. Deuteron — chat D₂O")}
                  className="mr-deuteron-iframe"
                  src={iframeSrc}
                  onLoad={postLanguageToIframe}
                  allow="clipboard-read; clipboard-write; fullscreen"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : null}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        type="button"
        className="mr-deuteron-fab"
        onClick={openPanel}
        title={fabTitle}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <img
          className="mr-deuteron-fab__avatar"
          src={AVATAR_SRC}
          alt={t(
            "mrDeuteron.fabAlt",
            "Mr. Deuteron — asistent D₂O și fizică nucleară"
          )}
          draggable={false}
        />
      </button>
      {modal}
    </>
  );
}
