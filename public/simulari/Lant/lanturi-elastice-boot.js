(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) return;
    window
      .runSimulatorI18nBoot({ slug: 'lanturi-elastice' })
      .then(() => window.loadScriptsSequential(['main.js']))
      .catch((e) => console.warn('[lanturi-elastice-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
