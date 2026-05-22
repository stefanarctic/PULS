/**
 * Energy in circuits: EN bundle from catalog, then script.js
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
        await window.runSimulatorI18nBoot({ slug: 'energie-circuite' });
      }
    } catch (e) {
      console.warn('[energie-circuite-boot]', e);
    }
    try {
      await loadScript('script.js');
    } catch (e) {
      console.error('[energie-circuite-boot]', e);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
