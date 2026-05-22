/**
 * Criogenie: load EN catalog, then ES module main.js
 */
(function () {
  async function boot() {
    try {
      const lang = new URLSearchParams(location.search).get("lang");
      if (lang === "en" && window.runSimulatorI18nBoot) {
        await window.runSimulatorI18nBoot({ slug: "criogenie" });
      }
    } catch (e) {
      console.warn("[criogenie-boot]", e);
    }
    try {
      await import("./main.js");
    } catch (e) {
      console.error("[criogenie-boot]", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
