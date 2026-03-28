import { doc, getDoc, setDoc, collection, getDocs, Timestamp, deleteField } from 'firebase/firestore';
import { db } from './firebase';

/** @param {URLSearchParams} searchParams */
export function parseHomeworkParams(searchParams) {
  const classId = searchParams.get('hwClass');
  const assignmentId = searchParams.get('hwAssignment');
  const itemRaw = searchParams.get('hwItem');
  if (!classId?.trim() || !assignmentId?.trim() || itemRaw == null || itemRaw === '') return null;
  const itemIndex = parseInt(itemRaw, 10);
  if (!Number.isFinite(itemIndex) || itemIndex < 0) return null;
  return { classId: classId.trim(), assignmentId: assignmentId.trim(), itemIndex };
}

export function homeworkQueryString(classId, assignmentId, itemIndex) {
  return new URLSearchParams({
    hwClass: classId,
    hwAssignment: assignmentId,
    hwItem: String(itemIndex),
  }).toString();
}

/**
 * @param {number} obtained
 * @param {number} max
 * @returns {number|null}
 */
export function score10FromObtainedMax(obtained, max) {
  if (!Number.isFinite(obtained) || !Number.isFinite(max) || max <= 0) return null;
  const s = (obtained / max) * 10;
  return Math.min(10, Math.max(0, Math.round(s * 10) / 10));
}

/**
 * @param {number|null|undefined} score10
 * @returns {'empty'|'fail'|'mid'|'good'|'perfect'}
 */
export function checkTierFromScore10(score10) {
  if (score10 == null || !Number.isFinite(score10)) return 'empty';
  const s = Math.round(score10);
  if (s < 6) return 'fail';
  if (s <= 7) return 'mid';
  if (s <= 9) return 'good';
  return 'perfect';
}

export async function fetchAssignmentSubmission(classId, assignmentId, studentUid) {
  const ref = doc(db, 'classes', classId, 'assignments', assignmentId, 'submissions', studentUid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data();
}

export async function fetchSubmissionsMapForAssignment(classId, assignmentId) {
  const snap = await getDocs(
    collection(db, 'classes', classId, 'assignments', assignmentId, 'submissions')
  );
  return Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]));
}

function computeAverageAndAllDone(assignmentItems, itemsMap) {
  let sum = 0;
  let n = 0;
  let allDone = true;
  for (let i = 0; i < assignmentItems.length; i++) {
    const it = assignmentItems[i];
    const st = itemsMap[String(i)];
    if (!st?.done) {
      allDone = false;
    }
    if (!st?.done || it.type === 'simulation') continue;
    if (st.score10 == null || !Number.isFinite(st.score10)) continue;
    sum += st.score10;
    n++;
  }
  const averageScore10 = n > 0 ? Math.round((sum / n) * 10) / 10 : null;
  return { averageScore10, allDone };
}

/**
 * @param {object} params
 * @param {string} params.classId
 * @param {string} params.assignmentId
 * @param {string} params.studentUid
 * @param {number} params.itemIndex
 * @param {'problem'|'grila'|'simulation'|'text'} params.itemType
 * @param {object} params.patch — { done?, score10?, gradedAt? }
 * @param {string|null} [params.expectedSimulationSlug]
 */
export async function recordAssignmentItemProgress({
  classId,
  assignmentId,
  studentUid,
  itemIndex,
  itemType,
  patch,
  expectedSimulationSlug = null,
}) {
  const assignmentRef = doc(db, 'classes', classId, 'assignments', assignmentId);
  const subRef = doc(db, 'classes', classId, 'assignments', assignmentId, 'submissions', studentUid);

  const [asSnap, subSnap] = await Promise.all([getDoc(assignmentRef), getDoc(subRef)]);
  if (!asSnap.exists()) {
    throw new Error('Tema nu există.');
  }
  const assignmentData = asSnap.data();
  const assignmentItems = Array.isArray(assignmentData.items) ? assignmentData.items : [];

  const itemAt = assignmentItems[itemIndex];
  if (!itemAt || itemAt.type !== itemType) {
    throw new Error('Elementul din temă nu corespunde.');
  }
  if (itemType === 'simulation' && expectedSimulationSlug) {
    if (String(itemAt.slug || '').trim() !== String(expectedSimulationSlug).trim()) {
      throw new Error('Simularea nu corespunde acestei teme.');
    }
  }

  const prev = subSnap.exists() ? subSnap.data() : {};
  const prevItems = prev.items && typeof prev.items === 'object' ? { ...prev.items } : {};
  const itemKey = String(itemIndex);
  const existing = prev.items?.[itemKey] && typeof prev.items[itemKey] === 'object' ? prev.items[itemKey] : {};

  const mergedItem = {
    ...existing,
    type: itemType,
    ...patch,
  };

  prevItems[itemKey] = mergedItem;

  const { averageScore10, allDone } = computeAverageAndAllDone(assignmentItems, prevItems);

  let completedAt;
  if (allDone) {
    completedAt = prev.completedAt || Timestamp.now();
  }

  const payload = {
    studentUid,
    updatedAt: Timestamp.now(),
    items: prevItems,
    averageScore10,
    allDone,
  };

  if (allDone) {
    payload.completedAt = completedAt;
  } else {
    payload.completedAt = deleteField();
  }

  await setDoc(subRef, payload, { merge: true });
}

/**
 * @param {object} params
 * @param {import('firebase/firestore').Timestamp|null|undefined} params.dueDate
 * @param {object|null|undefined} params.submission
 * @param {number} params.itemCount
 */
export function studentAssignmentDueStatus({ dueDate, submission, itemCount }) {
  const now = new Date();
  const due = dueDate?.toDate ? dueDate.toDate() : null;
  const overdue = due != null && due.getTime() < now.getTime();
  const allDone = submission?.allDone === true;
  if (allDone) {
    return {
      label: 'Tema făcută',
      variant: 'done',
      overdue,
      lateDone: !!(due && submission?.completedAt?.toDate && submission.completedAt.toDate() > due),
    };
  }
  if (overdue) {
    return {
      label: 'Tema nefăcută (termen depășit)',
      variant: 'overdue',
      overdue: true,
      lateDone: false,
    };
  }
  const doneCount = submission?.items ? Object.values(submission.items).filter((x) => x?.done).length : 0;
  return {
    label: itemCount > 0 && doneCount > 0 ? 'În lucru' : 'De început',
    variant: 'pending',
    overdue: false,
    lateDone: false,
  };
}
