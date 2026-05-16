(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) return;
    window
      .runSimulatorI18nBoot({ slug: 'plan-inclinat' })
      .then(() => window.loadScriptsSequential(['script.js']))
      .catch((e) => console.warn('[plan-inclinat-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
