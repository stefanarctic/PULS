(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) {
      console.error('[pendul-amortizat-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'pendul-amortizat' })
      .then(() => window.loadScriptsSequential(['Oscilatie-intretinuta.js', 'Tema.js']))
      .catch((e) => console.warn('[pendul-amortizat-boot]', e));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
