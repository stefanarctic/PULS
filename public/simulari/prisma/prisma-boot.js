(function () {
  function typesetMeasurementPanel() {
    if (!window.MathJax || typeof window.MathJax.typesetPromise !== 'function') {
      return Promise.resolve();
    }
    const root = document.getElementById('measurement-values') || document.body;
    return window.MathJax.typesetPromise([root]).catch((e) => {
      console.warn('[prisma-boot] MathJax typeset', e);
    });
  }

  /**
   * Traducerile EN înlocuiesc textContent după (sau înainte de) prima trecere MathJax,
   * deci rămân literal \(...\). Așteptăm startup-ul MathJax apoi typeset pe panoul teoretic.
   */
  function whenMathJaxTypesetDone() {
    const run = () => typesetMeasurementPanel();

    if (window.MathJax?.startup?.promise) {
      return window.MathJax.startup.promise.then(run);
    }

    return new Promise((resolve) => {
      const deadline = Date.now() + 25000;
      (function poll() {
        if (window.MathJax?.startup?.promise) {
          window.MathJax.startup.promise.then(run).then(resolve);
        } else if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
          run().then(resolve);
        } else if (Date.now() > deadline) {
          resolve();
        } else {
          setTimeout(poll, 40);
        }
      })();
    });
  }

  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) {
      console.error('[prisma-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'prisma' })
      .then(() => window.loadScriptsSequential(['prisma.js']))
      .then(() => whenMathJaxTypesetDone())
      .catch((e) => console.warn('[prisma-boot]', e));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
