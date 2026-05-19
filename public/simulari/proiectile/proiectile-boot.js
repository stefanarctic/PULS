(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot) {
      console.error('[proiectile-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'proiectile' })
      .then(() => {
        if (!window.loadScriptsSequential) {
          const s = document.createElement('script');
          s.src = '/simulari/proiectile/app.js';
          document.body.appendChild(s);
          return;
        }
        return window.loadScriptsSequential(['/simulari/proiectile/app.js']);
      })
      .catch((e) => console.warn('[proiectile-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
