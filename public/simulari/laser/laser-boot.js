(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) {
      console.error('[laser-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'laser' })
      .then(() => window.loadScriptsSequential(['/simulari/laser/script.js']))
      .catch((e) => console.warn('[laser-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
