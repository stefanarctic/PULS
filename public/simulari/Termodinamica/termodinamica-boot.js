(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot) {
      console.error('[termodinamica-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'termodinamica' })
      .then(() => {
        const s = document.createElement('script');
        s.src = '/simulari/Termodinamica/script.js';
        document.body.appendChild(s);
      })
      .catch((e) => console.warn('[termodinamica-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
