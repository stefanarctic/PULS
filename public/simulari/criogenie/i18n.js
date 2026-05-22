/** EN bundle via parent `simulator-i18n-runtime.js` (`?lang=en`). */
export function simT(path, roFallback) {
  if (typeof window !== "undefined" && typeof window.simLbl === "function") {
    return window.simLbl(path, roFallback);
  }
  return roFallback;
}
