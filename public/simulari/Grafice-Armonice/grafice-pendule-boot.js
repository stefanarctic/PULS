/**
 * Grafice pendule: load EN bundle from catalog, then d3 + script.js + generatePoints + zoom2.
 */
(function () {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.body.appendChild(s);
    });
  }

  async function boot() {
    try {
      const lang = new URLSearchParams(location.search).get('lang');
      if (lang === 'en' && window.runSimulatorI18nBoot) {
        await window.runSimulatorI18nBoot({ slug: 'grafice-pendule' });
      }
    } catch (e) {
      console.warn('[grafice-pendule-boot]', e);
    }
    try {
      await loadScript('https://d3js.org/d3.v7.min.js');
      await loadScript('script.js');
      await loadScript('generatePoints.js');
      await loadScript('zoom2.js');
    } catch (e) {
      console.error('[grafice-pendule-boot]', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
