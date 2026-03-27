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
        const memberRef = doc(db, 'classes', classId, 'members', user.uid);
        const memberSnap = await getDoc(memberRef);
        if (!memberSnap.exists()) {
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
                        {it.type === 'problem' && (
                          <Link to={`/probleme/${it.problemId}`}>
                            Problemă <ExternalLink size={14} />
                          </Link>
                        )}
                        {it.type === 'grila' && (
                          <Link to={`/probleme/grile/${it.grilaId}`}>
                            Grilă <ExternalLink size={14} />
                          </Link>
                        )}
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
