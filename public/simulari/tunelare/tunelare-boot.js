(function () {
  function renderTheoryMath() {
    const root = document.querySelector('.theory-section');
    if (!root || typeof renderMathInElement !== 'function') return;
    renderMathInElement(root, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\(', right: '\\)', display: false },
      ],
      throwOnError: false,
    });
  }

  function boot() {
    if (!window.runSimulatorI18nBoot || !window.loadScriptsSequential) {
      console.error('[tunelare-boot] simulator-i18n-runtime.js must load first');
      return;
    }
    window
      .runSimulatorI18nBoot({ slug: 'tunelare-cuantica' })
      .then(() => {
        renderTheoryMath();
        return window.loadScriptsSequential(['script.js']);
      })
      .catch((e) => console.warn('[tunelare-boot]', e));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
