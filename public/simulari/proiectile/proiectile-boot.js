(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) return;
    window
      .runSimulatorI18nBoot({ slug: 'proiectile' })
      .then(() => window.loadScriptsSequential(['app.js']))
      .catch((e) => console.warn('[proiectile-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
