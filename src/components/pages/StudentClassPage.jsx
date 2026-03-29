import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '../Layout';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { fetchClass, fetchClassAssignments, leaveStudentClass } from '../../lib/teacherClasses';
import { simulationsConfig } from '@/data/simulations';
import { ArrowLeft, ExternalLink, UserMinus } from 'lucide-react';
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
          }
          return;
        }
        const [c, a] = await Promise.all([fetchClass(classId), fetchClassAssignments(classId)]);
        if (!cancelled) {
          setClassData(c);
          setAssignments(a);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError('Nu s-a putut încărca clasa.');
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

  return (
    <Layout>
      <div className="teacher-dashboard">
        <div className="teacher-dashboard-inner">
          <div className="teacher-dashboard-student-class-head">
            <Link to="/clasa" className="teacher-dashboard-back">
              <ArrowLeft size={18} />
              Clasele mele
            </Link>
            <button
              type="button"
              className="teacher-dashboard-leave-class-btn"
              disabled={leavingClass}
              onClick={handleLeaveClass}
            >
              <UserMinus size={18} aria-hidden />
              {leavingClass ? 'Se iese…' : 'Ieși din clasă'}
            </button>
          </div>
          <h1 className="teacher-dashboard-title">{classData.name}</h1>
          {classData.description ? <p className="teacher-dashboard-muted">{classData.description}</p> : null}

          <h2 className="teacher-dashboard-h2">Teme</h2>
          {assignments.length === 0 ? (
            <p className="teacher-dashboard-muted">Nicio temă încă.</p>
          ) : (
            <div className="teacher-dashboard-student-assignments">
              {assignments.map((as) => {
                const sub = submissionsByAssignment[as.id];
                const itemCount = (as.items || []).length;
                const dueSt = studentAssignmentDueStatus({
                  dueDate: as.dueDate,
                  submission: sub,
                  itemCount,
                });
                return (
                  <article key={as.id} className="teacher-dashboard-card student-assignment-card">
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
