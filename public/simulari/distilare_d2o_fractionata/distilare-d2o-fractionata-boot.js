(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot) {
      console.error('[distilare-d2o-fractionata-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'distilare-d2o-fractionata' })
      .then(() => {
        const s = document.createElement('script');
        s.src = '/simulari/distilare_d2o_fractionata/script.js';
        document.body.appendChild(s);
      })
      .catch((e) => console.warn('[distilare-d2o-fractionata-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
