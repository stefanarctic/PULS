(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) {
      console.error('[eli-np-laser-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'eli-np-laser' })
      .then(() => window.loadScriptsSequential(['/simulari/eli-np-laser/script.js']))
      .catch((e) => console.warn('[eli-np-laser-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
