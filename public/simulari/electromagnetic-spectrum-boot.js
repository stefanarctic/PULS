(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot) {
      console.error('[electromagnetic-spectrum-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'spectru-electromagnetic' })
      .then(() => {
        const s = document.createElement('script');
        s.src = '/simulari/electromagnetic-spectrum-app.js';
        document.body.appendChild(s);
      })
      .catch((e) => console.warn('[electromagnetic-spectrum-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
