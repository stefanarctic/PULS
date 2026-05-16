/**
 * Shared EN loader for physics simulator iframes when ?lang=en.
 * Catalog: /translations/simulatoare.en.json → simulators.<slug>
 */
(function () {
  const CATALOG_URL = '/translations/simulatoare.en.json';

  let catalogPromise = null;

  function getCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetch(CATALOG_URL)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
    }
    return catalogPromise;
  }

  function resolvePath(obj, path) {
    if (!path || !obj) return undefined;
    return path.split('.').reduce((cur, key) => cur?.[key], obj);
  }

  function applyDomTranslations(bundle) {
    if (!bundle) return;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const p = el.getAttribute('data-i18n');
      const val = resolvePath(bundle, p);
      if (typeof val === 'string') el.textContent = val;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const p = el.getAttribute('data-i18n-aria');
      const val = resolvePath(bundle, p);
      if (typeof val === 'string') el.setAttribute('aria-label', val);
    });
    if (bundle.documentTitle) document.title = bundle.documentTitle;
    const hl = bundle.htmlLang || bundle.meta?.locale;
    if (hl) document.documentElement.lang = hl;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.body.appendChild(s);
    });
  }

  async function runSimulatorI18nBoot(opts) {
    const slug = opts?.slug;
    const lang = new URLSearchParams(location.search).get('lang');
    window.__SIMULATOR_UI_I18N__ = null;
    window.__PENDUL_SIMPLU_I18N = null;

    if (lang !== 'en' || !slug) return null;

    let bundle = null;
    try {
      const cat = await getCatalog();
      bundle = cat?.simulators?.[slug] ?? null;
    } catch (e) {
      console.warn('[simulator i18n]', e);
    }

    window.__SIMULATOR_UI_I18N__ = bundle;
    if (slug === 'pendul-simplu') window.__PENDUL_SIMPLU_I18N = bundle;

    applyDomTranslations(bundle);
    return bundle;
  }

  async function loadScriptsSequential(srcs) {
    for (const src of srcs) await loadScript(src);
  }

  /** Resolve string from current simulator bundle (?lang=en); otherwise returns fallback (RO UI). */
  window.simLbl = function simLbl(path, fallback) {
    const v = resolvePath(window.__SIMULATOR_UI_I18N__, path);
    return typeof v === 'string' ? v : fallback;
  };

  window.runSimulatorI18nBoot = runSimulatorI18nBoot;
  window.loadScriptsSequential = loadScriptsSequential;
})();
