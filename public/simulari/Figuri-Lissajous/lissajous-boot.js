(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) {
      console.error('[lissajous-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    const chain = window
      .runSimulatorI18nBoot({ slug: 'figuri-lissajous' })
      .then(() =>
        window.loadScriptsSequential([
          'https://d3js.org/d3.v7.min.js',
          'script.js',
          'melodie.js',
          'zoom.js',
          'createPoint.js',
          'math.js',
          'logs.js',
          'clock.js',
        ]),
      )
      .catch((e) => console.warn('[lissajous-boot]', e));

    return chain;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
