import { useLayoutEffect, useRef } from "react";

/** Dependențe goale stabile: efect doar la montare (un singur typeset). */
const MOUNT_ONLY_DEPS = [];

/** Re-typeset după schimbări de conținut (traduceri, încărcare progresivă). */
const WATCH_RETRY_DELAYS_MS = [0, 160, 480];

/**
 * @param {HTMLElement} element
 * @returns {Promise<void>}
 */
function typesetMathJaxElement(element) {
  const mj = window.MathJax;
  if (!mj?.typesetPromise || !element?.isConnected) {
    return Promise.resolve();
  }
  if (typeof mj.typesetClear === "function") {
    mj.typesetClear([element]);
  }
  const run = () => mj.typesetPromise([element]).catch(() => {});
  if (mj.startup?.promise) {
    return mj.startup.promise.then(run).catch(run);
  }
  return run();
}

/**
 * Atașează un ref pe containerul cu formule MathJax și rulează o singură trecere
 * `typesetPromise([element])` — mult mai rapid decât zeci de <MathJaxRender /> care
 * parcurg tot documentul.
 *
 * @param {unknown} [watch] — dacă e furnizat, se re-rulează typeset la fiecare schimbare
 *   (ex. fingerprint problemă / traducere EN).
 */
export function useMathJaxTypesetRoot(watch) {
  const ref = useRef(null);

  const deps = watch === undefined ? MOUNT_ONLY_DEPS : [watch];

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    /** @type {number[]} */
    const timeoutIds = [];

    const clearTimeouts = () => {
      for (const id of timeoutIds) {
        window.clearTimeout(id);
      }
      timeoutIds.length = 0;
    };

    const scheduleTypeset = (delayMs = 0) => {
      if (cancelled) return;
      const mj = window.MathJax;
      if (!mj?.typesetPromise) {
        const waitId = window.setTimeout(() => scheduleTypeset(delayMs), 50);
        timeoutIds.push(waitId);
        return;
      }

      const fire = () => {
        if (cancelled || !el.isConnected) return;
        typesetMathJaxElement(el);
      };

      if (delayMs > 0) {
        timeoutIds.push(window.setTimeout(fire, delayMs));
      } else {
        requestAnimationFrame(fire);
      }
    };

    const delays = watch === undefined ? [0] : WATCH_RETRY_DELAYS_MS;
    for (const delay of delays) {
      scheduleTypeset(delay);
    }

    return () => {
      cancelled = true;
      clearTimeouts();
    };
  }, deps);

  return ref;
}
