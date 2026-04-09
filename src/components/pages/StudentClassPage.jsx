import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '../Layout';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { fetchClass, fetchClassAssignments, fetchClassMembers, leaveStudentClass } from '../../lib/teacherClasses';
import { simulationsConfig } from '@/data/simulations';
import {
  ArrowLeft,
  ClipboardList,
  ExternalLink,
  GraduationCap,
  UserMinus,
  Users,
} from 'lucide-react';
import {
  homeworkQueryString,
  fetchAssignmentSubmission,
  checkTierFromScore10,
  studentAssignmentDueStatus,
} from '../../lib/assignmentProgress';
import { AssignmentCheckIcon } from '../AssignmentCheckIcon';
import HomeworkTextSubmitModal from '../HomeworkTextSubmitModal';
import '../../scss/components/_teacher-dashboard.scss';

function simulationRouteForSlug(slug) {
  const s = simulationsConfig.find((x) => x.slug === slug);
  return s?.route || '/simulari';
}

function itemDisplayTier(itemType, itemState) {
  if (!itemState?.done) return 'empty';
  if (itemType === 'simulation') return 'sim';
  if (itemType === 'grila') {
    if (itemState.score10 >= 10) return 'good';
    return 'fail';
  }
  return checkTierFromScore10(itemState.score10);
}

function displayInitials(name) {
  const parts = String(name || '?')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Culoare stabilă pentru avatar din UID (paletă inspirată de Classroom). */
function avatarHueClass(uid) {
  if (!uid) return 'student-classroom-avatar--h0';
  let h = 0;
  for (let i = 0; i < uid.length; i++) h = (h + uid.charCodeAt(i) * (i + 1)) % 6;
  return `student-classroom-avatar--h${h}`;
}

function scrollToSection(id, e) {
  const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
  if (!el) return;
  e.preventDefault();
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

const StudentClassPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [resolvedIndices, setResolvedIndices] = useState({});
  const [legacyIndicesDone, setLegacyIndicesDone] = useState(true);
  const [error, setError] = useState('');
  const [submissionsByAssignment, setSubmissionsByAssignment] = useState({});
  const [textModal, setTextModal] = useState(null);
  const [leavingClass, setLeavingClass] = useState(false);
  const [classmates, setClassmates] = useState([]);
  const [teacherDisplayName, setTeacherDisplayName] = useState(null);

  const refreshSubmissions = useCallback(async () => {
    if (!user?.uid || !classId || !assignments.length) return;
    const next = {};
    await Promise.all(
      assignments.map(async (a) => {
        const sub = await fetchAssignmentSubmission(classId, a.id, user.uid);
        next[a.id] = sub;
      }),
    );
    setSubmissionsByAssignment(next);
  }, [user?.uid, classId, assignments]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid || !classId) {
      if (user === null) setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const joined = userSnap.exists() ? userSnap.data().joinedClasses : [];
        const isInClass = Array.isArray(joined) && joined.includes(classId);
        if (!isInClass) {
          if (!cancelled) {
            setError('Nu ești înscris la această clasă.');
            setClassData(null);
            setClassmates([]);
            setTeacherDisplayName(null);
          }
          return;
        }
        const [c, a, members] = await Promise.all([
          fetchClass(classId),
          fetchClassAssignments(classId),
          fetchClassMembers(classId),
        ]);
        if (!cancelled) {
          setClassData(c);
          setAssignments(a);
          const sortedPeers = [...members].sort((x, y) =>
            String(x.studentName || '').localeCompare(String(y.studentName || ''), 'ro', {
              sensitivity: 'base',
            }),
          );
          setClassmates(sortedPeers);
          if (c?.teacherId) {
            try {
              const tSnap = await getDoc(doc(db, 'users', c.teacherId));
              if (!cancelled && tSnap.exists()) {
                const td = tSnap.data();
                setTeacherDisplayName(td.name || td.alias || null);
              } else if (!cancelled) setTeacherDisplayName(null);
            } catch (_) {
              if (!cancelled) setTeacherDisplayName(null);
            }
          } else if (!cancelled) setTeacherDisplayName(null);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError('Nu s-a putut încărca clasa.');
          setClassmates([]);
          setTeacherDisplayName(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, classId]);

  useEffect(() => {
    let cancelled = false;
    if (!assignments.length || !user?.uid || !classId) {
      if (!assignments.length && user?.uid) setSubmissionsByAssignment({});
      return;
    }
    (async () => {
      const next = {};
      await Promise.all(
        assignments.map(async (a) => {
          const sub = await fetchAssignmentSubmission(classId, a.id, user.uid);
          if (!cancelled) next[a.id] = sub;
        }),
      );
      if (!cancelled) setSubmissionsByAssignment(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [assignments, user?.uid, classId]);

  /** Teme vechi: items cu problemId/grilaId (ID Firestore); rutele folosesc index numeric. */
  useEffect(() => {
    if (!assignments.length) {
      setResolvedIndices({});
      setLegacyIndicesDone(true);
      return;
    }
    const needP = new Set();
    const needG = new Set();
    for (const as of assignments) {
      for (const it of as.items || []) {
        if (it.type === 'problem' && typeof it.index !== 'number' && it.problemId != null) {
          needP.add(String(it.problemId).trim());
        }
        if (it.type === 'grila' && typeof it.index !== 'number' && it.grilaId != null) {
          needG.add(String(it.grilaId).trim());
        }
      }
    }
    if (needP.size === 0 && needG.size === 0) {
      setResolvedIndices({});
      setLegacyIndicesDone(true);
      return;
    }
    let cancelled = false;
    setLegacyIndicesDone(false);
    (async () => {
      const next = {};
      for (const id of needP) {
        try {
          const snap = await getDoc(doc(db, 'problems', id));
          if (snap.exists()) {
            const idx = snap.data().index;
            if (typeof idx === 'number') next[`p:${id}`] = idx;
          }
        } catch (_) {
          /* ignore */
        }
      }
      for (const id of needG) {
        try {
          const snap = await getDoc(doc(db, 'grile', id));
          if (snap.exists()) {
            const idx = snap.data().index;
            if (typeof idx === 'number') next[`g:${id}`] = idx;
          }
        } catch (_) {
          /* ignore */
        }
      }
      if (!cancelled) {
        setResolvedIndices(next);
        setLegacyIndicesDone(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assignments]);

  const handleLeaveClass = async () => {
    if (!user?.uid || !classId) return;
    const ok = window.confirm(
      'Sigur vrei să ieși din această clasă? Nu vei mai vedea temele aici; poți reintra mai târziu cu codul de la profesor.'
    );
    if (!ok) return;
    setLeavingClass(true);
    try {
      await leaveStudentClass(user.uid, classId);
      navigate('/clasa');
    } catch (e) {
      console.error(e);
      window.alert('Nu s-a putut ieși din clasă. Încearcă din nou.');
    } finally {
      setLeavingClass(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="teacher-dashboard-loading">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="teacher-dashboard-inner teacher-dashboard-narrow">
          <p>Autentifică-te pentru a vedea tema.</p>
          <Link to="/profil">Profil</Link>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="teacher-dashboard-loading">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  if (error || !classData) {
    return (
      <Layout>
        <div className="teacher-dashboard-error-screen">
          <p>{error || 'Clasă indisponibilă.'}</p>
          <Link to="/clasa">Înapoi la clasele mele</Link>
        </div>
      </Layout>
    );
  }

  const peerCount = classmates.length;
  const assignmentCount = assignments.length;

  return (
    <Layout>
      <div className="teacher-dashboard student-classroom-page">
        <div className="student-classroom-shell">
          <header className="student-classroom-banner">
            <div className="student-classroom-banner-toolbar">
              <Link to="/clasa" className="student-classroom-back">
                <ArrowLeft size={18} aria-hidden />
                Clasele mele
              </Link>
              <button
                type="button"
                className="student-classroom-leave"
                disabled={leavingClass}
                onClick={handleLeaveClass}
              >
                <UserMinus size={18} aria-hidden />
                {leavingClass ? 'Se iese…' : 'Părăsește clasa'}
              </button>
            </div>
            <div className="student-classroom-banner-hero">
              <div className="student-classroom-banner-copy">
                <p className="student-classroom-kicker">Clasa ta</p>
                <h1 className="student-classroom-title">{classData.name}</h1>
                {classData.description ? (
                  <p className="student-classroom-description">{classData.description}</p>
                ) : null}
                <div className="student-classroom-banner-chips" aria-label="Rezumat clasă">
                  <a
                    href="#student-classroom-work"
                    className="student-classroom-stat-chip"
                    onClick={(e) => scrollToSection('student-classroom-work', e)}
                  >
                    <span className="student-classroom-stat-chip-icon" aria-hidden>
                      <ClipboardList size={17} strokeWidth={2} />
                    </span>
                    <span className="student-classroom-stat-chip-text">
                      <span className="student-classroom-stat-chip-value">{assignmentCount}</span>
                      <span className="student-classroom-stat-chip-label">
                        {assignmentCount === 1 ? 'temă' : 'teme'}
                      </span>
                    </span>
                  </a>
                  <a
                    href="#student-classroom-people"
                    className="student-classroom-stat-chip"
                    onClick={(e) => scrollToSection('student-classroom-people', e)}
                  >
                    <span className="student-classroom-stat-chip-icon" aria-hidden>
                      <Users size={17} strokeWidth={2} />
                    </span>
                    <span className="student-classroom-stat-chip-text">
                      <span className="student-classroom-stat-chip-value">{peerCount}</span>
                      <span className="student-classroom-stat-chip-label">
                        {peerCount === 1 ? 'coleg' : 'colegi'}
                      </span>
                    </span>
                  </a>
                  {teacherDisplayName ? (
                    <div className="student-classroom-stat-chip student-classroom-stat-chip--teacher">
                      <span className="student-classroom-stat-chip-icon" aria-hidden>
                        <GraduationCap size={17} strokeWidth={2} />
                      </span>
                      <span className="student-classroom-stat-chip-text student-classroom-stat-chip-text--stack">
                        <span className="student-classroom-stat-chip-sublabel">Profesor</span>
                        <span className="student-classroom-stat-chip-teacher-name" title={teacherDisplayName}>
                          {teacherDisplayName}
                        </span>
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <div className="student-classroom-layout">
            <div className="student-classroom-main" id="student-classroom-work">
              <div className="student-classroom-section-title">
                <span className="student-classroom-section-icon" aria-hidden>
                  <ClipboardList size={22} strokeWidth={1.75} />
                </span>
                <div>
                  <h2 className="student-classroom-h2">Lucrări de curs</h2>
                  <p className="student-classroom-section-sub">
                    Temele publicate de profesor apar aici, cu termene și status.
                  </p>
                </div>
              </div>

              {assignments.length === 0 ? (
                <div className="student-classroom-empty-work">
                  <ClipboardList size={40} strokeWidth={1.1} aria-hidden />
                  <p className="student-classroom-empty-title">Nicio temă încă</p>
                  <p className="student-classroom-empty-desc">
                    Când profesorul publică o lucrare, o vei vedea în această listă.
                  </p>
                </div>
              ) : (
                <div className="teacher-dashboard-student-assignments student-classroom-assignments">
                  {assignments.map((as) => {
                const sub = submissionsByAssignment[as.id];
                const itemCount = (as.items || []).length;
                const dueSt = studentAssignmentDueStatus({
                  dueDate: as.dueDate,
                  submission: sub,
                  itemCount,
                });
                return (
                  <article
                    key={as.id}
                    className="teacher-dashboard-card student-assignment-card student-classroom-work-card"
                  >
                    <header className="student-assignment-card-header">
                      <div>
                        <h3>{as.title}</h3>
                        {as.dueDate?.toDate && (
                          <p className="teacher-dashboard-due">
                            Termen: {as.dueDate.toDate().toLocaleString('ro-RO')}
                          </p>
                        )}
                      </div>
                      <div className="student-assignment-summary">
                        <span
                          className={`student-assignment-status student-assignment-status--${dueSt.variant}`}
                        >
                          {dueSt.label}
                        </span>
                        {sub?.allDone && sub.averageScore10 != null && (
                          <span className="student-assignment-average">
                            Medie temă: <strong>{sub.averageScore10}</strong> / 10
                            {dueSt.lateDone ? ' (după termen)' : ''}
                          </span>
                        )}
                      </div>
                    </header>
                    <ol className="teacher-dashboard-assignment-items student-assignment-items">
                      {(as.items || []).map((it, idx) => {
                        const itemState = sub?.items?.[String(idx)];
                        const tier = itemDisplayTier(it.type, itemState);
                        const hwQs = homeworkQueryString(classId, as.id, idx);
                        const tierTitle =
                          it.type === 'simulation'
                            ? itemState?.done
                              ? 'Vizitat'
                              : 'Nevizitat'
                            : it.type === 'grila'
                              ? itemState?.done
                                ? itemState.score10 >= 10
                                  ? 'Corect'
                                  : 'Greșit'
                                : 'Nerezolvată'
                              : itemState?.done && itemState.score10 != null
                                ? `Notă ${itemState.score10}/10`
                                : 'Neevaluată';

                        return (
                          <li key={idx} className="student-assignment-item-row">
                            <AssignmentCheckIcon tier={tier} title={tierTitle} className="student-assignment-check" />
                            <span className="student-assignment-item-body">
                              {it.type === 'problem' &&
                                (() => {
                                  const pidx =
                                    typeof it.index === 'number'
                                      ? it.index
                                      : resolvedIndices[`p:${String(it.problemId ?? '').trim()}`];
                                  if (pidx == null) {
                                    return (
                                      <span className="teacher-dashboard-muted">
                                        {legacyIndicesDone ? 'Problemă indisponibilă.' : 'Problemă (se încarcă…)'}
                                      </span>
                                    );
                                  }
                                  return (
                                    <Link to={`/probleme/${pidx}?${hwQs}`}>
                                      Problemă <ExternalLink size={14} />
                                    </Link>
                                  );
                                })()}
                              {it.type === 'grila' &&
                                (() => {
                                  const gidx =
                                    typeof it.index === 'number'
                                      ? it.index
                                      : resolvedIndices[`g:${String(it.grilaId ?? '').trim()}`];
                                  if (gidx == null) {
                                    return (
                                      <span className="teacher-dashboard-muted">
                                        {legacyIndicesDone ? 'Grilă indisponibilă.' : 'Grilă (se încarcă…)'}
                                      </span>
                                    );
                                  }
                                  return (
                                    <Link to={`/probleme/grile/${gidx}?${hwQs}`}>
                                      Grilă <ExternalLink size={14} />
                                    </Link>
                                  );
                                })()}
                              {it.type === 'simulation' && (
                                <Link to={`${simulationRouteForSlug(it.slug)}?${hwQs}`}>
                                  Simulare:{' '}
                                  {simulationsConfig.find((s) => s.slug === it.slug)?.title || it.slug}{' '}
                                  <ExternalLink size={14} />
                                </Link>
                              )}
                              {it.type === 'text' && (
                                <div className="student-assignment-text-wrap">
                                  <div className="teacher-dashboard-text-block">{it.body}</div>
                                  <button
                                    type="button"
                                    className="teacher-dashboard-link-btn student-assignment-resolve-btn"
                                    onClick={() =>
                                      setTextModal({
                                        assignmentId: as.id,
                                        itemIndex: idx,
                                        body: it.body || '',
                                      })
                                    }
                                  >
                                    Rezolvă (trimite la AI)
                                  </button>
                                </div>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ol>
                  </article>
                );
              })}
                </div>
              )}
            </div>

            <aside
              className="student-classroom-aside"
              id="student-classroom-people"
              aria-label="Oameni din clasă"
            >
              <div className="student-classroom-people-card">
                <div className="student-classroom-people-head">
                  <Users size={22} strokeWidth={1.75} aria-hidden />
                  <h2 className="student-classroom-people-h2">Oameni</h2>
                </div>

                {classData.teacherId ? (
                  <div className="student-classroom-people-block">
                    <p className="student-classroom-people-label">Profesor</p>
                    <div className="student-classroom-peer-row student-classroom-peer-row--teacher">
                      <div
                        className={`student-classroom-avatar ${avatarHueClass(classData.teacherId)} student-classroom-avatar--lg`}
                        aria-hidden
                      >
                        {displayInitials(teacherDisplayName || 'P')}
                      </div>
                      <div className="student-classroom-peer-info">
                        <span className="student-classroom-peer-name">
                          {teacherDisplayName || 'Profesor'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="student-classroom-people-block">
                  <p className="student-classroom-people-label">
                    Colegi ({peerCount})
                  </p>
                  {peerCount === 0 ? (
                    <p className="student-classroom-peers-empty">
                      Nu sunt încă elevi afișați aici. Dacă tocmai te-ai înscris, reîncarcă pagina în câteva
                      momente.
                    </p>
                  ) : (
                    <ul className="student-classroom-peers">
                      {classmates.map((m) => {
                        const isSelf = m.studentUid === user.uid;
                        return (
                          <li
                            key={m.studentUid}
                            className={`student-classroom-peer-row${isSelf ? ' student-classroom-peer-row--self' : ''}`}
                          >
                            <div
                              className={`student-classroom-avatar ${avatarHueClass(m.studentUid)}`}
                              aria-hidden
                            >
                              {displayInitials(m.studentName)}
                            </div>
                            <div className="student-classroom-peer-info">
                              <span className="student-classroom-peer-name">{m.studentName}</span>
                              {isSelf ? (
                                <span className="student-classroom-you-badge">Tu</span>
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </aside>
          </div>

          {textModal && (
            <HomeworkTextSubmitModal
              open
              teacherText={textModal.body}
              classId={classId}
              assignmentId={textModal.assignmentId}
              itemIndex={textModal.itemIndex}
              onClose={() => setTextModal(null)}
              onSaved={refreshSubmissions}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentClassPage;
