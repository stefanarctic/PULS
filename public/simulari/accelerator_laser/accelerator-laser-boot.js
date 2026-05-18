(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) {
      console.error('[accelerator-laser-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'accelerator-laser' })
      .then(() => window.loadScriptsSequential(['/simulari/accelerator_laser/script.js']))
      .catch((e) => console.warn('[accelerator-laser-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
