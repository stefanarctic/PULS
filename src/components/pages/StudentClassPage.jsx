import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '../Layout';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { fetchClass, fetchClassAssignments } from '../../lib/teacherClasses';
import { simulationsConfig } from '@/data/simulations';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import '../../scss/components/_teacher-dashboard.scss';

function simulationRouteForSlug(slug) {
  const s = simulationsConfig.find((x) => x.slug === slug);
  return s?.route || '/simulari';
}

const StudentClassPage = () => {
  const { classId } = useParams();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [resolvedIndices, setResolvedIndices] = useState({});
  const [legacyIndicesDone, setLegacyIndicesDone] = useState(true);
  const [error, setError] = useState('');

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
          <Link to="/clasa" className="teacher-dashboard-back">
            <ArrowLeft size={18} />
            Clasele mele
          </Link>
          <h1 className="teacher-dashboard-title">{classData.name}</h1>
          {classData.description ? <p className="teacher-dashboard-muted">{classData.description}</p> : null}

          <h2 className="teacher-dashboard-h2">Teme</h2>
          {assignments.length === 0 ? (
            <p className="teacher-dashboard-muted">Nicio temă încă.</p>
          ) : (
            <div className="teacher-dashboard-student-assignments">
              {assignments.map((as) => (
                <article key={as.id} className="teacher-dashboard-card student-assignment-card">
                  <header>
                    <h3>{as.title}</h3>
                    {as.dueDate?.toDate && (
                      <p className="teacher-dashboard-due">
                        Termen: {as.dueDate.toDate().toLocaleString('ro-RO')}
                      </p>
                    )}
                  </header>
                  <ol className="teacher-dashboard-assignment-items">
                    {(as.items || []).map((it, idx) => (
                      <li key={idx}>
                        {it.type === 'problem' && (() => {
                          const idx =
                            typeof it.index === 'number'
                              ? it.index
                              : resolvedIndices[`p:${String(it.problemId ?? '').trim()}`];
                          if (idx == null) {
                            return (
                              <span className="teacher-dashboard-muted">
                                {legacyIndicesDone ? 'Problemă indisponibilă.' : 'Problemă (se încarcă…)'}
                              </span>
                            );
                          }
                          return (
                            <Link to={`/probleme/${idx}`}>
                              Problemă <ExternalLink size={14} />
                            </Link>
                          );
                        })()}
                        {it.type === 'grila' && (() => {
                          const idx =
                            typeof it.index === 'number'
                              ? it.index
                              : resolvedIndices[`g:${String(it.grilaId ?? '').trim()}`];
                          if (idx == null) {
                            return (
                              <span className="teacher-dashboard-muted">
                                {legacyIndicesDone ? 'Grilă indisponibilă.' : 'Grilă (se încarcă…)'}
                              </span>
                            );
                          }
                          return (
                            <Link to={`/probleme/grile/${idx}`}>
                              Grilă <ExternalLink size={14} />
                            </Link>
                          );
                        })()}
                        {it.type === 'simulation' && (
                          <Link to={simulationRouteForSlug(it.slug)}>
                            Simulare: {simulationsConfig.find((s) => s.slug === it.slug)?.title || it.slug}{' '}
                            <ExternalLink size={14} />
                          </Link>
                        )}
                        {it.type === 'text' && <div className="teacher-dashboard-text-block">{it.body}</div>}
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentClassPage;
