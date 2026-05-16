(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) return;
    window
      .runSimulatorI18nBoot({ slug: 'coliziuni-inelastice' })
      .then(() => window.loadScriptsSequential(['ciocnire.js']))
      .catch((e) => console.warn('[coliziuni-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
