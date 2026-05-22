/**
 * Replace leading "PROBLEMA" with the localized catalog prefix (e.g. "PROBLEM" in English).
 * @param {string} raw
 * @param {function} t - i18n t()
 * @param {{ key?: string, fallbackPrefix?: string }} [opts]
 */
export function formatProblemTitlePrefix(raw, t, opts = {}) {
  const key = opts.key || 'communityPage.activityFeed.problemPrefix';
  const fb = opts.fallbackPrefix ?? 'PROBLEMA';
  if (!raw || typeof raw !== 'string') return raw;
  const prefix = t(key, fb);
  return raw.replace(/^PROBLEMA\b/i, prefix);
}
