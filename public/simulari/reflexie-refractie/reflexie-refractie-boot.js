(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) {
      console.error('[reflexie-refractie-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'reflexie-refractie' })
      .then(() => window.loadScriptsSequential(['script.js']))
      .catch((e) => console.warn('[reflexie-refractie-boot]', e));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
