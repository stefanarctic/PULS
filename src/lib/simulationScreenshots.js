/**
 * Paths for Puppeteer-generated English thumbnails ({@link scripts/screenshot-simulations-en.js}).
 * Public URLs under /res/screenshots/en/… — no bundler import required.
 */

const EN_SCREENSHOT_PREFIX = "/res/screenshots/en";

/** Match scripts/screenshot-simulations-en.js slug → filename convention. */
export function englishScreenshotFilenameFromSlug(slug) {
  if (!slug || typeof slug !== "string") return "";
  const parts = slug.replace(/-/g, "_").split("_");
  const titleCase = parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("_");
  return `${titleCase}_Screenshot_en.png`;
}

export function englishSimulationScreenshotUrl(slug) {
  const fn = englishScreenshotFilenameFromSlug(slug);
  if (!fn) return null;
  return `${EN_SCREENSHOT_PREFIX}/${fn}`;
}

/** Resolve slug from SPA path like `/simulare/grafice-pendule` or localized EN path `/simulation/...` (basename not reliable). Prefer RO-style href when parsing. */
export function slugFromSimularePath(hrefOrPath) {
  if (!hrefOrPath || typeof hrefOrPath !== "string") return null;
  try {
    const u = hrefOrPath.startsWith("http")
      ? new URL(hrefOrPath).pathname
      : hrefOrPath.split("?")[0];
    const mRo = u.match(/\/(?:simulare)\/([^/?#]+)/);
    if (mRo) return decodeURIComponent(mRo[1]);
  } catch {
    /* noop */
  }
  return null;
}

/**
 * @param {string} roThumbUrl - Imported asset URL from Vite or any string URL
 * @param {string} slug - simulationsConfig.slug
 * @param {string} lang - 'ro' | 'en'
 */
export function pickSimulationThumb(roThumbUrl, slug, lang) {
  if (!roThumbUrl || lang !== "en" || !slug) return roThumbUrl;
  const url = englishSimulationScreenshotUrl(slug);
  return url || roThumbUrl;
}

/** When you only have a `/simulare/...` or full URL ending with `/simulare/foo`. */
export function pickSimulationThumbFromSimularePath(roThumbUrl, pathOrHref, lang) {
  const slug = slugFromSimularePath(pathOrHref);
  return pickSimulationThumb(roThumbUrl, slug, lang);
}
