/**
 * URL path localization driven by `routing` inside `site.en.json`.
 * Code keeps linking with Romanian canonical paths; `localizedPath()` maps them under /en/…
 */

const emptyRouting = {};

export function normalizePathname(pathname) {
  if (pathname == null || pathname === "") return "/";
  let p = String(pathname);
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

export function splitPathQueryHash(path) {
  const s = typeof path === "string" ? path : "";
  const qi = s.indexOf("?");
  const hi = s.indexOf("#");
  let pathEnd = s.length;
  if (qi >= 0) pathEnd = Math.min(pathEnd, qi);
  if (hi >= 0 && hi < pathEnd) pathEnd = Math.min(pathEnd, hi);
  const pathnameOnly = normalizePathname(s.slice(0, pathEnd));
  const rest = s.slice(pathEnd);
  return [pathnameOnly, rest];
}

function prefixWithSlashDir(seg) {
  const n = normalizePathname(seg);
  return n.endsWith("/") ? n : `${n}/`;
}

/**
 * Map a normalized Romanian pathname to its English UI pathname (no /en prefix).
 */
export function romanianPathToEnglishPath(normalizedRomanianPathname, routing) {
  const r = routing ?? emptyRouting;
  const pm = r.pathMap ?? {};
  const p = normalizedRomanianPathname;
  const exact = pm[p];
  if (exact) return normalizePathname(exact);

  const prefs = [...(r.pathPrefixes ?? [])].sort((a, b) => b.ro.length - a.ro.length);
  for (const { ro, en } of prefs) {
    const roNorm = normalizePathname(ro);
    const roPref = prefixWithSlashDir(roNorm);
    if (p === roNorm || p.startsWith(roPref)) {
      const suffix = p === roNorm ? "" : p.slice(roPref.length);
      const enNorm = normalizePathname(en);
      const enPref = prefixWithSlashDir(enNorm);
      const joined = suffix ? `${enPref}${suffix}` : enNorm;
      return normalizePathname(joined);
    }
  }
  return p;
}

/**
 * Map stripped UI pathname (Romanian URL or English URL, never with /en) back to Romanian canonical.
 */
export function pathnameWithoutLocaleToRomanian(normalizedUiPathname, routing) {
  return englishPathToRomanianPath(normalizedUiPathname, routing);
}

export function englishPathToRomanianPath(normalizedEnglishOrMixedPathname, routing) {
  const r = routing ?? emptyRouting;
  const pm = r.pathMap ?? {};
  const p = normalizedEnglishOrMixedPathname;

  if (Object.prototype.hasOwnProperty.call(pm, p)) return p;

  const reverseExact = {};
  for (const [roK, enV] of Object.entries(pm)) {
    reverseExact[normalizePathname(enV)] = normalizePathname(roK);
  }
  if (reverseExact[p]) return reverseExact[p];

  const prefs = [...(r.pathPrefixes ?? [])].sort((a, b) => b.en.length - a.en.length);
  for (const { ro, en } of prefs) {
    const enNorm = normalizePathname(en);
    const enPref = prefixWithSlashDir(enNorm);
    if (p === enNorm || p.startsWith(enPref)) {
      const suffix = p === enNorm ? "" : p.slice(enPref.length);
      const roNorm = normalizePathname(ro);
      const roPref = prefixWithSlashDir(roNorm);
      const joined = suffix ? `${roPref}${suffix}` : roNorm;
      return normalizePathname(joined);
    }
  }

  return p;
}

/** Relative RR path segments e.g. `simulare/foo` → `simulation/foo` */
export function romanianRelativeRouteToEnglish(relativeRomanianSansLeadingSlash, routing) {
  const norm = normalizePathname(relativeRomanianSansLeadingSlash);
  return romanianPathToEnglishPath(norm, routing).replace(/^\//, "");
}
