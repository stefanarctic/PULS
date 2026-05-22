/** Maps legacy Firestore milestone rows (Romanian title only) to stable keys. */
export const LEGACY_MILESTONE_TITLE_TO_KEY = {
    'Prima problemă rezolvată': 'solved_first',
    'Rezolvător dedicat': 'solved_5',
    'Maestru al rezolvării': 'solved_10',
    'Expert în rezolvări': 'solved_25',
    'Legenda rezolvărilor': 'solved_50',
    'Maestru suprem': 'solved_100',
    'Începător în fizică': 'added_first',
    Avansat: 'added_5',
    Maestru: 'added_10',
    'Creator prolific': 'added_25',
    'Arhitect al problemelor': 'added_50',
    'Scor perfect': 'perfect_1',
    Perfecționist: 'perfect_5',
    'Maestru al perfecțiunii': 'perfect_10',
    'Excelență academică': 'avg_90',
    'Geniu al fizicii': 'avg_95',
    'Perfecțiune absolută': 'avg_100',
    'Prima simulare': 'sim_first',
    'Explorator de simulări': 'sim_5',
    'Maestru al simulărilor': 'sim_10',
};

export function getMilestoneKey(ach) {
    if (ach?.key) return ach.key;
    if (ach?.title) return LEGACY_MILESTONE_TITLE_TO_KEY[ach.title] || null;
    return null;
}

const PREFIX = 'profilePage.achievementMilestones';

/**
 * @param {object} ach — milestone achievement from Firestore or calculator
 * @param {function} t — i18n t()
 */
export function translateMilestone(ach, t) {
    const k = getMilestoneKey(ach);
    if (!k) {
        return { title: ach.title, description: ach.description };
    }
    return {
        title: t(`${PREFIX}.${k}.title`, ach.title),
        description: t(`${PREFIX}.${k}.description`, ach.description),
    };
}
