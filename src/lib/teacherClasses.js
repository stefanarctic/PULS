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
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './firebase';

export async function createClass(teacherId, name, description = '') {
  const classRef = doc(collection(db, 'classes'));
  const newClassId = classRef.id;

  try {
    await setDoc(classRef, {
      teacherId,
      name: String(name).trim(),
      description: String(description || '').trim(),
      createdAt: Timestamp.now(),
    });

    await updateDoc(doc(db, 'users', teacherId), {
      ownedClasses: arrayUnion(newClassId),
    });
  } catch (e) {
    try {
      await deleteDoc(classRef);
    } catch (_) {
      /* ignore */
    }
    if (e?.code === 'permission-denied') {
      throw new Error(
        'Permisiuni insuficiente. Verifică regulile Firestore și că ai teacherStatus „approved”.'
      );
    }
    throw e;
  }

  return { classId: newClassId };
}

function sortClassesByCreatedAtDesc(rows) {
  return [...rows].sort((a, b) => {
    const ta =
      a.createdAt?.toMillis?.() ??
      (typeof a.createdAt?.seconds === 'number' ? a.createdAt.seconds * 1000 : 0);
    const tb =
      b.createdAt?.toMillis?.() ??
      (typeof b.createdAt?.seconds === 'number' ? b.createdAt.seconds * 1000 : 0);
    return tb - ta;
  });
}

/** Doar where(teacherId) — fără index compus; sortare createdAt în client. */
export async function fetchTeacherClasses(teacherId) {
  const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return sortClassesByCreatedAtDesc(rows);
}

export async function fetchClass(classId) {
  const ref = doc(db, 'classes', classId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/** Elevi cu joinedClasses care conțin această clasă (fără profesorul clasei în listă). */
export async function fetchClassMembers(classId) {
  const classSnap = await getDoc(doc(db, 'classes', classId));
  const teacherId = classSnap.exists() ? classSnap.data().teacherId : null;

  const q = query(collection(db, 'users'), where('joinedClasses', 'array-contains', classId));
  const snap = await getDocs(q);
  return snap.docs
    .filter((d) => d.id !== teacherId)
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        studentUid: d.id,
        studentName: data.name || data.alias || d.id,
      };
    });
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
  const userRef = doc(db, 'users', studentUid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return [];
  const joined = snap.data().joinedClasses;
  if (!Array.isArray(joined) || joined.length === 0) return [];
  return joined.map((classId) => ({
    classId,
    joinedAt: null,
  }));
}

/**
 * Token = ID document Firestore al clasei.
 */
export async function joinClassWithCode(userId, tokenRaw, _studentName) {
  const classId = String(tokenRaw).trim();
  if (classId.length < 4) {
    throw new Error('Codul prea scurt.');
  }
  const classSnap = await getDoc(doc(db, 'classes', classId));
  if (!classSnap.exists()) {
    throw new Error('Cod invalid sau clasă inexistentă.');
  }
  const { teacherId } = classSnap.data();
  if (teacherId === userId) {
    throw new Error('Ești profesorul acestei clase; nu te poți înscrie ca elev.');
  }

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const existing = userSnap.exists() ? userSnap.data().joinedClasses : [];
  if (Array.isArray(existing) && existing.includes(classId)) {
    throw new Error('Ești deja înscris la această clasă.');
  }

  await updateDoc(userRef, {
    joinedClasses: arrayUnion(classId),
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
  const subsSnap = await getDocs(
    collection(db, 'classes', classId, 'assignments', assignmentId, 'submissions')
  );
  let batch = writeBatch(db);
  let n = 0;
  for (const s of subsSnap.docs) {
    batch.delete(s.ref);
    n++;
    if (n >= 450) {
      await batch.commit();
      batch = writeBatch(db);
      n = 0;
    }
  }
  if (n > 0) await batch.commit();
  await deleteDoc(doc(db, 'classes', classId, 'assignments', assignmentId));
}

export async function updateClassMeta(classId, { name, description }) {
  const data = {};
  if (name != null) data.name = String(name).trim();
  if (description != null) data.description = String(description).trim();
  await updateDoc(doc(db, 'classes', classId), data);
}

export async function removeMember(classId, studentUid) {
  await updateDoc(doc(db, 'users', studentUid), {
    joinedClasses: arrayRemove(classId),
  });
}

/** Elevul iese singur din clasă (elimină classId din joinedClasses). */
export async function leaveStudentClass(userId, classId) {
  return removeMember(classId, userId);
}

export async function getJoinRequestForUser(classId, userId) {
  const snap = await getDoc(doc(db, 'classes', classId, 'joinRequests', userId));
  if (!snap.exists()) return null;
  return { studentUid: snap.id, ...snap.data() };
}

export async function fetchJoinRequests(classId) {
  const q = query(
    collection(db, 'classes', classId, 'joinRequests'),
    orderBy('requestedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    studentUid: d.id,
    ...d.data(),
  }));
}

/**
 * Cerere de intrare în clasă (pending până aprobă profesorul).
 */
export async function requestJoinClass(userId, classId, studentName) {
  const cid = String(classId).trim();
  if (cid.length < 4) {
    throw new Error('Codul prea scurt.');
  }
  const classSnap = await getDoc(doc(db, 'classes', cid));
  if (!classSnap.exists()) {
    throw new Error('Cod invalid sau clasă inexistentă.');
  }
  const { teacherId } = classSnap.data();
  if (teacherId === userId) {
    throw new Error('Ești profesorul acestei clase; nu poți trimite cerere ca elev.');
  }

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  const existing = userSnap.exists() ? userSnap.data().joinedClasses : [];
  if (Array.isArray(existing) && existing.includes(cid)) {
    throw new Error('Ești deja înscris la această clasă.');
  }

  const reqRef = doc(db, 'classes', cid, 'joinRequests', userId);
  const reqSnap = await getDoc(reqRef);
  if (reqSnap.exists()) {
    throw new Error('Ai deja o cerere în așteptare pentru această clasă.');
  }

  const name = String(studentName || '').trim() || 'Elev';
  await setDoc(reqRef, {
    requestedAt: Timestamp.now(),
    studentName: name,
  });
  return cid;
}

export async function approveJoinRequest(classId, studentUid) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'users', studentUid), {
    joinedClasses: arrayUnion(classId),
  });
  batch.delete(doc(db, 'classes', classId, 'joinRequests', studentUid));
  await batch.commit();
}

export async function rejectJoinRequest(classId, studentUid) {
  await deleteDoc(doc(db, 'classes', classId, 'joinRequests', studentUid));
}

export async function deleteClassCascade(classId) {
  const classRef = doc(db, 'classes', classId);
  const classSnap = await getDoc(classRef);
  if (!classSnap.exists()) return;
  const teacherId = classSnap.data().teacherId;

  const joinReqSnap = await getDocs(collection(db, 'classes', classId, 'joinRequests'));
  let jbatch = writeBatch(db);
  let jn = 0;
  for (const jr of joinReqSnap.docs) {
    jbatch.delete(jr.ref);
    jn++;
    if (jn >= 450) {
      await jbatch.commit();
      jbatch = writeBatch(db);
      jn = 0;
    }
  }
  if (jn > 0) await jbatch.commit();

  const assignmentsSnap = await getDocs(collection(db, 'classes', classId, 'assignments'));
  let batch = writeBatch(db);
  let n = 0;
  for (const d of assignmentsSnap.docs) {
    const subsSnap = await getDocs(collection(db, 'classes', classId, 'assignments', d.id, 'submissions'));
    for (const s of subsSnap.docs) {
      batch.delete(s.ref);
      n++;
      if (n >= 450) {
        await batch.commit();
        batch = writeBatch(db);
        n = 0;
      }
    }
    batch.delete(d.ref);
    n++;
    if (n >= 450) {
      await batch.commit();
      batch = writeBatch(db);
      n = 0;
    }
  }
  batch.delete(classRef);
  await batch.commit();

  const usersSnap = await getDocs(
    query(collection(db, 'users'), where('joinedClasses', 'array-contains', classId))
  );
  let ub = writeBatch(db);
  let k = 0;
  for (const u of usersSnap.docs) {
    ub.update(u.ref, { joinedClasses: arrayRemove(classId) });
    k++;
    if (k >= 450) {
      await ub.commit();
      ub = writeBatch(db);
      k = 0;
    }
  }
  if (k > 0) await ub.commit();

  await updateDoc(doc(db, 'users', teacherId), {
    ownedClasses: arrayRemove(classId),
  });
}
