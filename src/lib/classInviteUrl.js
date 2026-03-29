/**
 * Link public pentru invitație în clasă (elevul trimite cerere pending din ClassJoinPage).
 */
export function getClassInviteUrl(classId) {
  if (classId == null || classId === '') return '';
  const id = encodeURIComponent(String(classId).trim());
  const base =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : '';
  return `${base}/clasa/intra?invite=${id}`;
}
