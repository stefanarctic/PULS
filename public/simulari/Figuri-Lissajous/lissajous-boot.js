(function () {
  function boot() {
    if (!window.runSimulatorI18nBoot) {
      console.error('[lissajous-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    const chainSrcs = [
      'https://d3js.org/d3.v7.min.js',
      '/simulari/Figuri-Lissajous/script.js',
      '/simulari/Figuri-Lissajous/melodie.js',
      '/simulari/Figuri-Lissajous/zoom.js',
      '/simulari/Figuri-Lissajous/createPoint.js',
      '/simulari/Figuri-Lissajous/math.js',
      '/simulari/Figuri-Lissajous/logs.js',
      '/simulari/Figuri-Lissajous/clock.js',
    ];

    const run = window.loadScriptsSequential
      ? window.loadScriptsSequential(chainSrcs)
      : chainSrcs.reduce(
          (p, src) =>
            p.then(
              () =>
                new Promise((resolve, reject) => {
                  const s = document.createElement('script');
                  s.src = src;
                  s.onload = () => resolve();
                  s.onerror = () => reject(new Error('Failed to load ' + src));
                  document.body.appendChild(s);
                }),
            ),
          Promise.resolve(),
        );

    window
      .runSimulatorI18nBoot({ slug: 'figuri-lissajous' })
      .then(() => run)
      .catch((e) => console.warn('[lissajous-boot]', e));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
