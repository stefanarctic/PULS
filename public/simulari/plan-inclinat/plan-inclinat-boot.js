(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot) {
      console.error('[plan-inclinat-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'plan-inclinat' })
      .then(() => {
        if (!window.loadScriptsSequential) {
          const s = document.createElement('script');
          s.src = '/simulari/plan-inclinat/script.js';
          document.body.appendChild(s);
          return;
        }
        return window.loadScriptsSequential(['/simulari/plan-inclinat/script.js']);
      })
      .catch((e) => console.warn('[plan-inclinat-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
