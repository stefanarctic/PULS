import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { fetchStudentEnrollments, fetchClass } from '../../lib/teacherClasses';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  KeyRound,
  School,
  Sparkles,
} from 'lucide-react';
import '../../scss/components/_teacher-dashboard.scss';

function formatJoined(ts) {
  if (!ts?.toDate) return null;
  try {
    return ts.toDate().toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

const StudentClassesPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const enrollments = await fetchStudentEnrollments(user.uid);
        const enriched = await Promise.all(
          enrollments.map(async (e) => {
            const c = await fetchClass(e.classId);
            return {
              classId: e.classId,
              joinedAt: e.joinedAt,
              className: c?.name || 'Clasă',
            };
          })
        );
        if (!cancelled) setRows(enriched);
      } catch (e) {
        console.error(e);
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const hasClasses = rows.length > 0;
  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => (a.className || '').localeCompare(b.className || '', 'ro')),
    [rows]
  );

  if (authLoading) {
    return (
      <Layout>
        <div className="teacher-dashboard student-classes-page">
          <div className="student-classes-loading">
            <div className="spinner" />
            <p>Se încarcă clasele...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="teacher-dashboard student-classes-page">
          <div className="student-classes-inner">
            <div className="student-classes-guest-card">
              <School className="student-classes-guest-icon" strokeWidth={1.25} />
              <h1 className="student-classes-guest-title">Clasele mele</h1>
              <p className="student-classes-guest-text">
                Autentifică-te pentru a vedea clasele la care ești înscris și temele primite de la profesor.
              </p>
              <Link to="/profil" className="student-classes-btn student-classes-btn--primary">
                Mergi la profil
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="teacher-dashboard student-classes-page">
        <header className="student-classes-hero">
          <div className="student-classes-inner student-classes-hero-inner">
            <div className="student-classes-hero-badge">
              <Sparkles size={14} />
              <span>Elev</span>
            </div>
            <h1 className="student-classes-title">
              <span className="student-classes-title-icon" aria-hidden>
                <School size={36} strokeWidth={1.5} />
              </span>
              Clasele mele
            </h1>
            <p className="student-classes-lead">
              Aici apar clasele la care te-ai înscris cu codul de la profesor. Deschide o clasă pentru a vedea temele.
            </p>
            <div className="student-classes-hero-actions">
              <button
                type="button"
                className="student-classes-btn student-classes-btn--primary"
                onClick={() => navigate('/clasa/intra')}
              >
                <KeyRound size={18} />
                Intră cu cod în clasă
              </button>
              <Link to="/profil" className="student-classes-btn student-classes-btn--ghost">
                <GraduationCap size={18} />
                Ești profesor? Panoul e în profil
              </Link>
            </div>
          </div>
        </header>

        <div className="student-classes-inner student-classes-body">
          {loading ? (
            <div className="student-classes-panel student-classes-panel--loading">
              <div className="spinner" />
              <p>Se încarcă lista...</p>
            </div>
          ) : !hasClasses ? (
            <div className="student-classes-empty">
              <div className="student-classes-empty-visual">
                <BookOpen className="student-classes-empty-book" strokeWidth={1.25} />
              </div>
              <h2 className="student-classes-empty-title">Încă nu ești înscris la nicio clasă</h2>
              <p className="student-classes-empty-desc">
                Când profesorul îți dă un cod (de obicei scurt, din litere și cifre), folosește butonul de mai sus sau
                intră direct aici pentru a te alătura.
              </p>
              <button
                type="button"
                className="student-classes-btn student-classes-btn--primary student-classes-btn--lg"
                onClick={() => navigate('/clasa/intra')}
              >
                <KeyRound size={20} />
                Introdu codul clasei
              </button>
            </div>
          ) : (
            <>
              <div className="student-classes-section-head">
                <h2 className="student-classes-h2">Clase înscrise ({rows.length})</h2>
                <button
                  type="button"
                  className="student-classes-link-btn"
                  onClick={() => navigate('/clasa/intra')}
                >
                  + Altă clasă
                </button>
              </div>
              <ul className="student-classes-grid">
                {sortedRows.map((r) => {
                  const joined = formatJoined(r.joinedAt);
                  return (
                    <li key={r.classId}>
                      <Link to={`/clasa/${r.classId}`} className="student-classes-card">
                        <div className="student-classes-card-top">
                          <span className="student-classes-card-icon" aria-hidden>
                            <School size={22} />
                          </span>
                          <ChevronRight className="student-classes-card-arrow" size={22} />
                        </div>
                        <h3 className="student-classes-card-name">{r.className}</h3>
                        {joined && (
                          <p className="student-classes-card-meta">
                            <CalendarDays size={14} aria-hidden />
                            Înscris din {joined}
                          </p>
                        )}
                        <span className="student-classes-card-cta">
                          Vezi temele
                          <ArrowRight size={16} />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentClassesPage;
