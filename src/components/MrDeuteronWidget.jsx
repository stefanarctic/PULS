import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, X } from "lucide-react";
import { MR_DEUTERON_URL } from "@/data/mrDeuteron";
import "../scss/components/_mr-deuteron-widget.scss";

const AVATAR_SRC = "/res/mr-deuteron-avatar.png";

function bodyLock() {
  const prev = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = prev;
  };
}

const FAB_ALT = "Mr. Deuteron — asistent D₂O și fizică nucleară";

export default function MrDeuteronWidget() {
  const [open, setOpen] = useState(false);
  const [fs, setFs] = useState(false);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);

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
    const t = setTimeout(() => closeBtnRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, [open]);

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
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    setOpen(false);
  };

  const modal = open
    ? createPortal(
        <div
          className="mr-deuteron-overlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            className="mr-deuteron-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Mr. Deuteron — chat D₂O și fizică nucleară"
          >
            <div className="mr-deuteron-panel__frame-wrap">
              <div className="mr-deuteron-panel__toolbar">
                <button
                  type="button"
                  className="mr-deuteron-toolbar-btn"
                  onClick={toggleFs}
                  title={fs ? "Ieși din ecran complet" : "Ecran complet"}
                  aria-label={fs ? "Ieși din ecran complet" : "Ecran complet"}
                >
                  {fs ? <Minimize2 size={16} strokeWidth={2.25} /> : <Maximize2 size={16} strokeWidth={2.25} />}
                </button>
                <button
                  type="button"
                  ref={closeBtnRef}
                  className="mr-deuteron-toolbar-btn"
                  onClick={close}
                  title="Închide"
                  aria-label="Închide fereastra"
                >
                  <X size={16} strokeWidth={2.25} />
                </button>
              </div>
              <iframe
                title="Mr. Deuteron — chat D₂O"
                className="mr-deuteron-iframe"
                src={MR_DEUTERON_URL}
                allow="clipboard-read; clipboard-write; fullscreen"
                referrerPolicy="no-referrer-when-downgrade"
              />
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
        onClick={() => setOpen(true)}
        title={FAB_ALT}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <img
          className="mr-deuteron-fab__avatar"
          src={AVATAR_SRC}
          alt={FAB_ALT}
          draggable={false}
        />
      </button>
      {modal}
    </>
  );
}
