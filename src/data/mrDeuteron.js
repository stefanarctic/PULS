/** Asistentul Mr. Deuteron (D₂O & fizică nucleară) — aplicație Groq, vercel. */
export const MR_DEUTERON_ORIGIN = "https://mr-deuteron.vercel.app";

/** Base URL kept for callers that do not localize (bookmarking / redirects). Prefer {@link buildMrDeuteronEmbeddedUrl}. */
export const MR_DEUTERON_URL = `${MR_DEUTERON_ORIGIN}/`;

/**
 * Embed URL matching the app's `?lang=` + postMessage LANGUAGE_CHANGE contract.
 * @param {string} [langSite] Parent site language (`en` → English UI in iframe; anything else → `ro`).
 */
export function buildMrDeuteronEmbeddedUrl(langSite = "ro") {
  const code = langSite === "en" ? "en" : "ro";
  try {
    const u = new URL("/", MR_DEUTERON_ORIGIN);
    u.searchParams.set("lang", code);
    return u.href;
  } catch {
    return `${MR_DEUTERON_ORIGIN}/?lang=${encodeURIComponent(code)}`;
  }
}
