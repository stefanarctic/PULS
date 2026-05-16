/**
 * Maps known Romanian error strings from class/join/assignment APIs to i18n keys.
 * @param {string} message
 * @param {(key: string, fallback: string) => string} t
 * @returns {string}
 */
export function translateClassOrAssignmentError(message, t) {
  if (!message || typeof message !== 'string') return message;
  const pairs = [
    ['Codul prea scurt.', 'classes.errors.codeTooShort'],
    ['Cod invalid sau clasă inexistentă.', 'classes.errors.invalidCode'],
    ['Ești profesorul acestei clase; nu te poți înscrie ca elev.', 'classes.errors.cannotJoinAsStudentTeacher'],
    ['Ești deja înscris la această clasă.', 'classes.errors.alreadyEnrolled'],
    ['Ești profesorul acestei clase; nu poți trimite cerere ca elev.', 'classes.errors.cannotRequestAsTeacher'],
    ['Ai deja o cerere în așteptare pentru această clasă.', 'classes.errors.pendingRequestExists'],
    ['Permisiuni insuficiente. Verifică regulile Firestore și că ai teacherStatus „approved”.', 'classes.errors.insufficientPermissions'],
    ['Tema nu există.', 'classes.errors.assignmentNotFound'],
    ['Elementul din temă nu corespunde.', 'classes.errors.assignmentItemMismatch'],
    ['Simularea nu corespunde acestei teme.', 'classes.errors.simulationMismatch'],
  ];
  for (const [ro, key] of pairs) {
    if (message === ro) return t(key, ro);
  }
  return message;
}
