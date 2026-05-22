(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot) {
      console.error('[constelatii-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'constelatii' })
      .then(() => {
        const s = document.createElement('script');
        s.type = 'module';
        s.src = '/simulari/constelatii/script.js';
        document.body.appendChild(s);
      })
      .catch((e) => console.warn('[constelatii-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
