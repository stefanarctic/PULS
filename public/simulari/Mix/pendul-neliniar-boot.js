(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) {
      console.error('[pendul-neliniar-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'pendul-neliniar' })
      .then(() => window.loadScriptsSequential(['reprezentari3d_main.js', 'Tema.js']))
      .catch((e) => console.warn('[pendul-neliniar-boot]', e));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
