/**
 * Lightweight helpers for grafice-simple i18n (uses window.simLbl from simulator-i18n-runtime.js).
 */
(function () {
  window.gsT = function gsT(path, roFallback) {
    return typeof window.simLbl === "function" ? window.simLbl(path, roFallback) : roFallback;
  };
  window.gsFmt = function gsFmt(path, roTemplate, vars) {
    let s = window.gsT(path, roTemplate);
    if (vars) {
      for (const [k, val] of Object.entries(vars)) {
        s = s.split(k).join(String(val));
      }
    }
    return s;
  };
})();
