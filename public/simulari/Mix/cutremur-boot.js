(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) {
      console.error('[cutremur-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'seism' })
      .then(() => window.loadScriptsSequential(['Cutremur.js', 'Tema.js']))
      .catch((e) => console.warn('[cutremur-boot]', e));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
