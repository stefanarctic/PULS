(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot) {
      console.error('[miscare-planete-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'miscare-planete' })
      .then(() => {
        const s = document.createElement('script');
        s.type = 'module';
        s.src = '/simulari/miscare_planete/main.js';
        document.body.appendChild(s);
      })
      .catch((e) => console.warn('[miscare-planete-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
