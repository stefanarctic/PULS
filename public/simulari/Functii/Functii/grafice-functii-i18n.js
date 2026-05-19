/**
 * EN: only updates document title/lang from catalog (?lang=en). Does not delay other scripts.
 */
(function () {
  try {
    const lang = new URLSearchParams(location.search).get("lang");
    if (lang !== "en" || !window.runSimulatorI18nBoot) return;
    window.runSimulatorI18nBoot({ slug: "grafice-functii" }).catch(() => {});
  } catch (_) {
    /* ignore */
  }
})();
