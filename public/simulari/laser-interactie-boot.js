(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) {
      console.error('[laser-interactie-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'laser-interactie' })
      .then(() => window.loadScriptsSequential(['/simulari/laser-interactie-app.js']))
      .catch((e) => console.warn('[laser-interactie-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
