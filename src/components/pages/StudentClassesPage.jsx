import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { fetchStudentEnrollments, fetchClass } from '../../lib/teacherClasses';
import { useI18n } from '../../i18n/LanguageContext';
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

function formatJoined(ts, lang) {
  if (!ts?.toDate) return null;
  try {
    const loc = lang === 'en' ? 'en-GB' : 'ro-RO';
    return ts.toDate().toLocaleDateString(loc, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

const StudentClassesPage = () => {
  const { t, lang, localizedPath } = useI18n();
  const SL = 'classes.studentList';
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [teacherStatus, setTeacherStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) {
        setLoading(false);
        setTeacherStatus(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const ts = snap.exists() ? snap.data().teacherStatus || 'none' : 'none';
        if (!cancelled) setTeacherStatus(ts);
      } catch (e) {
        console.error(e);
        if (!cancelled) setTeacherStatus('none');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (teacherStatus !== 'approved') return;
    navigate(localizedPath('/profesor'), { replace: true });
  }, [teacherStatus, navigate, localizedPath]);

  useEffect(() => {
    if (!user?.uid || teacherStatus === null || teacherStatus === 'approved') return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const enrollments = await fetchStudentEnrollments(user.uid);
        const enriched = await Promise.all(
          enrollments.map(async (e) => {
            const c = await fetchClass(e.classId);
            if (c?.teacherId === user.uid) return null;
            return {
              classId: e.classId,
              joinedAt: e.joinedAt,
              className: c?.name || t(`${SL}.classFallback`, 'Clasă'),
            };
          })
        );
        if (!cancelled) setRows(enriched.filter(Boolean));
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
  }, [user, teacherStatus, t, SL]);

  const hasClasses = rows.length > 0;
  const collator = lang === 'en' ? 'en' : 'ro';
  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => (a.className || '').localeCompare(b.className || '', collator)),
    [rows, collator],
  );

  if (authLoading) {
    return (
      <Layout>
        <div className="teacher-dashboard student-classes-page">
          <div className="student-classes-loading">
            <div className="spinner" />
            <p>{t(`${SL}.loadingClasses`, 'Se încarcă clasele...')}</p>
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
              <h1 className="student-classes-guest-title">{t(`${SL}.title`, 'Clasele mele')}</h1>
              <p className="student-classes-guest-text">
                {t(
                  `${SL}.guestText`,
                  'Autentifică-te pentru a vedea clasele la care ești înscris și temele primite de la profesor.'
                )}
              </p>
              <Link to={localizedPath('/profil')} className="student-classes-btn student-classes-btn--primary">
                {t(`${SL}.goProfile`, 'Mergi la profil')}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (teacherStatus === null) {
    return (
      <Layout>
        <div className="teacher-dashboard student-classes-page">
          <div className="student-classes-loading">
            <div className="spinner" />
            <p>{t(`${SL}.loading`, 'Se încarcă...')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (teacherStatus === 'approved') {
    return (
      <Layout>
        <div className="teacher-dashboard student-classes-page">
          <div className="student-classes-loading">
            <div className="spinner" />
            <p>{t(`${SL}.redirectTeacher`, 'Redirecționare la panoul profesor...')}</p>
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
              <span>{t(`${SL}.badgeStudent`, 'Elev')}</span>
            </div>
            <h1 className="student-classes-title">
              <span className="student-classes-title-icon" aria-hidden>
                <School size={36} strokeWidth={1.5} />
              </span>
              {t(`${SL}.title`, 'Clasele mele')}
            </h1>
            <p className="student-classes-lead">
              {t(
                `${SL}.lead`,
                'Aici apar clasele la care te-ai înscris cu codul de la profesor. Deschide o clasă pentru a vedea temele.'
              )}
            </p>
            <div className="student-classes-hero-actions">
              <button
                type="button"
                className="student-classes-btn student-classes-btn--primary"
                onClick={() => navigate(localizedPath('/clasa/intra'))}
              >
                <KeyRound size={18} />
                {t(`${SL}.joinWithCode`, 'Intră cu cod în clasă')}
              </button>
              <Link to={localizedPath('/profil')} className="student-classes-btn student-classes-btn--ghost">
                <GraduationCap size={18} />
                {t(`${SL}.teacherHint`, 'Ești profesor? Panoul e în profil')}
              </Link>
            </div>
          </div>
        </header>

        <div className="student-classes-inner student-classes-body">
          {loading ? (
            <div className="student-classes-panel student-classes-panel--loading">
              <div className="spinner" />
              <p>{t(`${SL}.loadingList`, 'Se încarcă lista...')}</p>
            </div>
          ) : !hasClasses ? (
            <div className="student-classes-empty">
              <div className="student-classes-empty-visual">
                <BookOpen className="student-classes-empty-book" strokeWidth={1.25} />
              </div>
              <h2 className="student-classes-empty-title">{t(`${SL}.emptyTitle`, 'Încă nu ești înscris la nicio clasă')}</h2>
              <p className="student-classes-empty-desc">
                {t(
                  `${SL}.emptyDesc`,
                  'Când profesorul îți dă un cod (de obicei scurt, din litere și cifre), folosește butonul de mai sus sau intră direct aici pentru a te alătura.'
                )}
              </p>
              <button
                type="button"
                className="student-classes-btn student-classes-btn--primary student-classes-btn--lg"
                onClick={() => navigate(localizedPath('/clasa/intra'))}
              >
                <KeyRound size={20} />
                {t(`${SL}.enterCode`, 'Introdu codul clasei')}
              </button>
            </div>
          ) : (
            <>
              <div className="student-classes-section-head">
                <h2 className="student-classes-h2">
                  {t(`${SL}.enrolledSection`, 'Clase înscrise ({count})', { count: rows.length })}
                </h2>
                <button
                  type="button"
                  className="student-classes-link-btn"
                  onClick={() => navigate(localizedPath('/clasa/intra'))}
                >
                  {t(`${SL}.anotherClass`, '+ Altă clasă')}
                </button>
              </div>
              <ul className="student-classes-grid">
                {sortedRows.map((r) => {
                  const joined = formatJoined(r.joinedAt, lang);
                  return (
                    <li key={r.classId}>
                      <Link
                        to={localizedPath(`/clasa/${r.classId}`)}
                        className="student-classes-card"
                      >
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
                            {t(`${SL}.joinedOn`, 'Înscris din {date}', { date: joined })}
                          </p>
                        )}
                        <span className="student-classes-card-cta">
                          {t(`${SL}.seeHomework`, 'Vezi temele')}
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
