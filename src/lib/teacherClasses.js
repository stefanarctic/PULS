import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  writeBatch,
  Timestamp,
  deleteField,
  collectionGroup,
} from 'firebase/firestore';
import { db } from './firebase';

function randomJoinCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < length; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

export async function createClass(teacherId, name, description = '') {
  const maxAttempts = 8;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const joinCode = randomJoinCode(6);
    const codeRef = doc(db, 'classJoinCodes', joinCode);
    const codeSnap = await getDoc(codeRef);
    if (codeSnap.exists()) {
      continue;
    }

    const classRef = doc(collection(db, 'classes'));
    const newClassId = classRef.id;

    try {
      await setDoc(classRef, {
        teacherId,
        name: String(name).trim(),
        description: String(description || '').trim(),
        joinCode,
        createdAt: Timestamp.now(),
      });
      await setDoc(codeRef, { classId: newClassId });
      return { classId: newClassId, joinCode };
    } catch (e) {
      try {
        await deleteDoc(classRef);
      } catch (_) {
        /* ignore cleanup failure */
      }
      if (e?.code === 'permission-denied') {
        throw new Error(
          'Permisiuni insuficiente. Verifică în Firebase că regulile pentru classes și classJoinCodes sunt publicate și că ai teacherStatus „approved”.'
        );
      }
      throw e;
    }
  }
  throw new Error('Nu s-a putut genera un cod unic de clasă. Încearcă din nou.');
}

export async function fetchTeacherClasses(teacherId) {
  const q = query(
    collection(db, 'classes'),
    where('teacherId', '==', teacherId),
    orderBy('createdAt', 'desc')
  );
  try {
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    if (e?.code === 'failed-precondition') {
      throw new Error(
        'Index Firestore lipsă pentru clase (teacherId + createdAt). Rulează deploy la indexe sau creează indexul din linkul din consola Firebase.'
      );
    }
    throw e;
  }
}

export async function fetchClass(classId) {
  const ref = doc(db, 'classes', classId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function fetchClassMembers(classId) {
  const snap = await getDocs(collection(db, 'classes', classId, 'members'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchClassAssignments(classId) {
  const q = query(
    collection(db, 'classes', classId, 'assignments'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchStudentEnrollments(studentUid) {
  const q = query(
    collectionGroup(db, 'members'),
    where('studentUid', '==', studentUid),
    orderBy('joinedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const classId = d.ref.parent.parent.id;
    return { classId, memberId: d.id, ...d.data() };
  });
}

export async function joinClassWithCode(userId, joinCodeRaw, studentName) {
  const joinCode = String(joinCodeRaw).trim().toUpperCase();
  if (joinCode.length < 4) {
    throw new Error('Codul prea scurt.');
  }
  const codeRef = doc(db, 'classJoinCodes', joinCode);
  const codeSnap = await getDoc(codeRef);
  if (!codeSnap.exists()) {
    throw new Error('Cod invalid sau clasă inexistentă.');
  }
  const { classId } = codeSnap.data();
  const memberRef = doc(db, 'classes', classId, 'members', userId);
  const existing = await getDoc(memberRef);
  if (existing.exists()) {
    throw new Error('Ești deja înscris la această clasă.');
  }
  await setDoc(memberRef, {
    joinedAt: Timestamp.now(),
    joinCode,
    studentUid: userId,
    studentName: String(studentName || '').trim(),
  });

  await updateDoc(memberRef, {
    joinCode: deleteField(),
    studentUid: userId,
    joinedAt: Timestamp.now(),
    studentName: String(studentName || '').trim(),
  });
  return classId;
}

export async function createAssignment(classId, teacherId, payload) {
  const ref = collection(db, 'classes', classId, 'assignments');
  const docRef = await addDoc(ref, {
    title: String(payload.title).trim(),
    createdAt: Timestamp.now(),
    teacherId,
    items: payload.items || [],
    dueDate: payload.dueDate ? Timestamp.fromDate(payload.dueDate) : null,
  });
  return docRef.id;
}

export async function updateAssignment(classId, assignmentId, payload) {
  const ref = doc(db, 'classes', classId, 'assignments', assignmentId);
  const data = {};
  if (payload.title != null) data.title = String(payload.title).trim();
  if (payload.items != null) data.items = payload.items;
  if (payload.dueDate !== undefined) {
    data.dueDate = payload.dueDate ? Timestamp.fromDate(payload.dueDate) : null;
  }
  await updateDoc(ref, data);
}

export async function deleteAssignment(classId, assignmentId) {
  await deleteDoc(doc(db, 'classes', classId, 'assignments', assignmentId));
}

export async function updateClassMeta(classId, { name, description }) {
  const data = {};
  if (name != null) data.name = String(name).trim();
  if (description != null) data.description = String(description).trim();
  await updateDoc(doc(db, 'classes', classId), data);
}

export async function removeMember(classId, studentUid) {
  await deleteDoc(doc(db, 'classes', classId, 'members', studentUid));
}

export async function deleteClassCascade(classId, joinCode) {
  const membersSnap = await getDocs(collection(db, 'classes', classId, 'members'));
  const assignmentsSnap = await getDocs(collection(db, 'classes', classId, 'assignments'));
  const batch = writeBatch(db);
  membersSnap.forEach((d) => batch.delete(d.ref));
  assignmentsSnap.forEach((d) => batch.delete(d.ref));
  batch.delete(doc(db, 'classes', classId));
  batch.delete(doc(db, 'classJoinCodes', joinCode));
  await batch.commit();
}
