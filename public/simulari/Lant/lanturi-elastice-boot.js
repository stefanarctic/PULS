(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot) {
      console.error('[lanturi-elastice-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'lanturi-elastice' })
      .then(() => {
        if (!window.loadScriptsSequential) {
          const s = document.createElement('script');
          s.src = '/simulari/Lant/main.js';
          document.body.appendChild(s);
          return;
        }
        return window.loadScriptsSequential(['/simulari/Lant/main.js']);
      })
      .catch((e) => console.warn('[lanturi-elastice-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
