(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot) {
      console.error('[instalatie-schimb-izotopic-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'instalatie-schimb-izotopic' })
      .then(() => {
        const s = document.createElement('script');
        s.src = '/simulari/instalatie_schimb_izotopic/script.js';
        document.body.appendChild(s);
      })
      .catch((e) => console.warn('[instalatie-schimb-izotopic-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
