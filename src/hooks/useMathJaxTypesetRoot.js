import { useEffect, useRef } from "react";

/** Dependențe goale stabile: efect doar la montare (un singur typeset). */
const MOUNT_ONLY_DEPS = [];

/**
 * Atașează un ref pe containerul cu formule MathJax și rulează o singură trecere
 * `typesetPromise([element])` — mult mai rapid decât zeci de <MathJaxRender /> care
 * parcurg tot documentul.
 *
 * @param {unknown} [watch] — dacă e furnizat, se re-rulează typeset la fiecare schimbare
 *   (ex. `JSON.stringify(visibleFormulasCount)` pentru încărcare progresivă).
 */
export function useMathJaxTypesetRoot(watch) {
  const ref = useRef(null);

  const deps = watch === undefined ? MOUNT_ONLY_DEPS : [watch];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let timeoutId;

    const scheduleTypeset = () => {
      if (cancelled) return;
      if (window.MathJax?.typesetPromise) {
        requestAnimationFrame(() => {
          if (cancelled || !el.isConnected) return;
          window.MathJax.typesetPromise([el]).catch(() => {});
        });
      } else {
        timeoutId = window.setTimeout(scheduleTypeset, 50);
      }
    };

    scheduleTypeset();

    let delayedId;
    if (watch !== undefined) {
      delayedId = window.setTimeout(() => {
        if (cancelled || !el.isConnected) return;
        window.MathJax?.typesetPromise?.([el])?.catch(() => {});
      }, 160);
    }

    return () => {
      cancelled = true;
      if (timeoutId) window.clearTimeout(timeoutId);
      if (delayedId) window.clearTimeout(delayedId);
    };
  }, deps);

  return ref;
}
