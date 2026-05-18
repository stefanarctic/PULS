/**
 * 4D Visualizer: EN bundle from catalog, then main.js
 */
(function () {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load " + src));
      document.body.appendChild(s);
    });
  }

  async function boot() {
    try {
      const lang = new URLSearchParams(location.search).get("lang");
      if (lang === "en" && window.runSimulatorI18nBoot) {
        await window.runSimulatorI18nBoot({ slug: "Vizualizator-4d" });
      }
    } catch (e) {
      console.warn("[vizualizator-4d-boot]", e);
    }
    try {
      await loadScript("js/main.js");
    } catch (e) {
      console.error("[vizualizator-4d-boot]", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
