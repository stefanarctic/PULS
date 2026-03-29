import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const TOKEN_BYTES = 24;

export function generateTeacherInviteToken() {
  const arr = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getTeacherInviteUrl(token) {
  if (token == null || token === '') return '';
  const t = encodeURIComponent(String(token).trim());
  const base =
    typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  return `${base}/invite-teacher?t=${t}`;
}

/**
 * Creează invitație (apelat doar de admin; regulile Firestore verifică isAdmin).
 */
export async function createTeacherInvite(adminUid, options = {}) {
  const token = generateTeacherInviteToken();
  const daysValid = typeof options.daysValid === 'number' ? options.daysValid : 14;
  const expiresAt = Timestamp.fromMillis(Date.now() + daysValid * 24 * 60 * 60 * 1000);
  const ref = doc(db, 'teacherInvites', token);
  await setDoc(ref, {
    createdAt: serverTimestamp(),
    expiresAt,
    createdByUid: adminUid || null,
  });
  return { token, url: getTeacherInviteUrl(token) };
}

/**
 * Marchează invitația, apoi setează teacherStatus pending (validat în reguli).
 */
export async function redeemTeacherInvite(uid, token) {
  const trimmed = String(token || '').trim();
  if (trimmed.length < 32) {
    throw new Error('Link de invitație invalid.');
  }
  const inviteRef = doc(db, 'teacherInvites', trimmed);
  const userRef = doc(db, 'users', uid);

  // O singură tranzacție: regulile Firestore văd invitația încă „neconsumată” la evaluare,
  // deci trebuie validTeacherInviteUnredeemed în rules — nu putem face invite apoi user în două pași
  // cu verificare doar pe redeemedByUid.
  await runTransaction(db, async (transaction) => {
    const invSnap = await transaction.get(inviteRef);
    if (!invSnap.exists()) {
      throw new Error('Invitația nu există sau a expirat.');
    }
    const d = invSnap.data();

    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) {
      throw new Error('Profilul nu există.');
    }
    const ts = userSnap.data().teacherStatus || 'none';
    if (ts !== 'none' && ts !== 'rejected') {
      throw new Error('Nu poți trimite cererea în starea curentă a contului.');
    }

    // Invitație deja marcată de același user (ex. flux vechi în două pași) — doar completăm users
    if (d.redeemedByUid) {
      if (d.redeemedByUid !== uid) {
        throw new Error('Această invitație a fost deja folosită.');
      }
      transaction.update(userRef, {
        teacherStatus: 'pending',
        inviteFromId: trimmed,
      });
      return;
    }

    const exp = d.expiresAt?.toMillis?.() ?? 0;
    if (exp < Date.now()) {
      throw new Error('Invitația a expirat.');
    }

    transaction.update(inviteRef, {
      redeemedByUid: uid,
      redeemedAt: serverTimestamp(),
    });
    transaction.update(userRef, {
      teacherStatus: 'pending',
      inviteFromId: trimmed,
    });
  });
}

export async function fetchTeacherInvitePreview(token) {
  const trimmed = String(token || '').trim();
  if (trimmed.length < 32) return { ok: false, reason: 'invalid' };
  try {
    const snap = await getDoc(doc(db, 'teacherInvites', trimmed));
    if (!snap.exists()) return { ok: false, reason: 'missing' };
    const d = snap.data();
    const exp = d.expiresAt?.toMillis?.() ?? 0;
    if (exp < Date.now()) return { ok: false, reason: 'expired' };
    if (d.redeemedByUid) return { ok: false, reason: 'used' };
    return { ok: true };
  } catch {
    return { ok: false, reason: 'missing' };
  }
}
