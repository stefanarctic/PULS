/**
 * Loads EN strings from /translations/simulatoare.en.json when ?lang=en, then runs the module simulator.
 */
(async function () {
  const lang = new URLSearchParams(location.search).get("lang");
  if (lang === "en" && window.runSimulatorI18nBoot) {
    await window.runSimulatorI18nBoot({ slug: "legaturi-atomi" });
  }
  await import("./script.js");
})();
