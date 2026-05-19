/**
 * EN UI from /translations/simulatoare.en.json (simulators.toti-izotopii), then script.js.
 */
(function () {
  async function start() {
    if (typeof window.runSimulatorI18nBoot === "function") {
      await window.runSimulatorI18nBoot({ slug: "toti-izotopii" });
    }
    const bundle = window.__SIMULATOR_UI_I18N__;
    if (bundle?.theory?.linkHref) {
      const a = document.querySelector(".theory-more a");
      if (a) a.setAttribute("href", bundle.theory.linkHref);
    }
    const s = document.createElement("script");
    s.src = "script.js";
    document.body.appendChild(s);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
