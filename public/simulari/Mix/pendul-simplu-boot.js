/**
 * Pendul simplu: load EN bundle from catalog then Script-pendul.js + Tema.js.
 */
(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) {
      console.error('[pendul-simplu-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'pendul-simplu' })
      .then(() => window.loadScriptsSequential(['Script-pendul.js', 'Tema.js']))
      .catch((e) => console.warn('[pendul-simplu-boot]', e));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
