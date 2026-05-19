/**
 * Periodic table iframe: Romanian by default; full English UI when parent passes ?lang=en.
 * Loads /translations/tabel-periodic.en.json before script.js runs.
 */
(function () {
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = function () {
        resolve();
      };
      s.onerror = function () {
        reject(new Error("Failed to load " + src));
      };
      document.head.appendChild(s);
    });
  }

  function resolvePath(obj, path) {
    if (!path || !obj) return undefined;
    return path.split(".").reduce(function (cur, key) {
      return cur == null ? cur : cur[key];
    }, obj);
  }

  /** Apply same rules as simulator-i18n-runtime (text + aria-label + title + document lang/title). */
  function applyDomTranslations(bundle) {
    if (!bundle) return;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var p = el.getAttribute("data-i18n");
      var val = resolvePath(bundle, p);
      if (typeof val === "string") el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      var p = el.getAttribute("data-i18n-aria");
      var val = resolvePath(bundle, p);
      if (typeof val === "string") el.setAttribute("aria-label", val);
    });
    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      var p = el.getAttribute("data-i18n-title");
      var val = resolvePath(bundle, p);
      if (typeof val === "string") el.setAttribute("title", val);
    });
    if (bundle.documentTitle) document.title = bundle.documentTitle;
    if (bundle.htmlLang) document.documentElement.lang = bundle.htmlLang;
  }

  /** Merge simulator catalog subtree (simulatoare.en.json) then full periodic-table patch. */
  async function mergeEnBundles() {
    var merged = {};
    try {
      var catRes = await fetch("/translations/simulatoare.en.json");
      if (catRes.ok) {
        var cat = await catRes.json();
        var base = cat && cat.simulators && cat.simulators["tabel-periodic"];
        if (base && typeof base === "object") Object.assign(merged, base);
      }
    } catch (_) {
      /* optional */
    }
    try {
      var trRes = await fetch("/translations/tabel-periodic.en.json");
      if (trRes.ok) {
        var tr = await trRes.json();
        if (tr && typeof tr === "object") Object.assign(merged, tr);
      }
    } catch (_) {
      /* optional */
    }
    window.__SIMULATOR_UI_I18N__ = merged;
    window.simLbl = function simLbl(path, fallback) {
      var v = resolvePath(window.__SIMULATOR_UI_I18N__, path);
      return typeof v === "string" ? v : fallback;
    };
    applyDomTranslations(merged);
  }

  async function boot() {
    var lang = new URLSearchParams(location.search).get("lang");
    window.__TABEL_LANG__ = lang === "en" ? "en" : "ro";

    try {
      if (lang === "en") await mergeEnBundles();
      else window.__SIMULATOR_UI_I18N__ = null;
    } catch (e) {
      console.warn("[tabel-periodic-boot]", e);
    }

    var isoSrc = lang === "en" ? "isotopes-en.js" : "isotopes.js";
    try {
      await loadScript(isoSrc);
    } catch (e) {
      console.error("[tabel-periodic-boot] isotopes:", e);
    }
    try {
      await loadScript("elements.js");
    } catch (e) {
      console.error("[tabel-periodic-boot] elements:", e);
    }
    try {
      await loadScript("script.js");
    } catch (e) {
      console.error("[tabel-periodic-boot] script:", e);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
