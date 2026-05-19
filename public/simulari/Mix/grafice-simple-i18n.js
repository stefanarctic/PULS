/**
 * grafice-simple: load EN bundle (DOM + placeholders), exposes a readiness promise for intro logs.
 * Does not load other scripts dynamically — grafice.html keeps normal <script src> order below.
 */
(function () {
  function resolvePath(obj, path) {
    if (!path || !obj) return undefined;
    return path.split(".").reduce((cur, key) => cur?.[key], obj);
  }

  function applyPlaceholders() {
    const bundle = window.__SIMULATOR_UI_I18N__;
    if (!bundle) return;
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
      const key = el.getAttribute("data-i18n-ph");
      const val = resolvePath(bundle, key);
      if (typeof val === "string") el.placeholder = val;
    });
  }

  window.__graficeSimpleI18nPromise = (async () => {
    try {
      const lang = new URLSearchParams(location.search).get("lang");
      if (lang === "en" && window.runSimulatorI18nBoot) {
        await window.runSimulatorI18nBoot({ slug: "grafice-simple" });
        applyPlaceholders();
      }
    } catch (e) {
      console.warn("[grafice-simple-i18n]", e);
    }
  })();
})();
