import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '../Layout';
import { auth, db } from '../../lib/firebase';
import { fetchClass, requestJoinClass } from '../../lib/teacherClasses';
import { translateClassOrAssignmentError } from '../../i18n/classErrors';
import { useI18n } from '../../i18n/LanguageContext';
import { ArrowLeft, GraduationCap, KeyRound, LogIn, Sparkles, UserPlus } from 'lucide-react';
import '../../scss/components/_teacher-dashboard.scss';

const displayNameFromUser = (u) => u?.displayName || u?.email?.split('@')[0] || '';

const ClassJoinPage = () => {
  const { t, localizedPath } = useI18n();
  const J = 'classes.join';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteId = useMemo(() => {
    const raw = searchParams.get('invite');
    return raw ? String(raw).trim() : '';
  }, [searchParams]);

  const returnToPath = useMemo(() => {
    const path = inviteId ? `/clasa/intra?invite=${encodeURIComponent(inviteId)}` : '/clasa/intra';
    return localizedPath(path);
  }, [inviteId, localizedPath]);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [inviteClass, setInviteClass] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [inviteLoadError, setInviteLoadError] = useState('');
  const [userIsMember, setUserIsMember] = useState(false);
  const [userIsTeacher, setUserIsTeacher] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !inviteId) {
      setInviteClass(null);
      setInviteLoadError('');
      setUserIsMember(false);
      setUserIsTeacher(false);
      setHasPendingRequest(false);
      setSuccess('');
      setError('');
      return;
    }
    let cancelled = false;
    setLoadingInvite(true);
    setInviteLoadError('');
    setHasPendingRequest(false);
    setSuccess('');
    setError('');
    (async () => {
      try {
        const c = await fetchClass(inviteId);
        if (cancelled) return;
        if (!c) {
          setInviteLoadError(t(`${J}.invalidInvite`, 'Clasa din link nu există sau linkul nu e valid.'));
          setInviteClass(null);
          return;
        }
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const joined = userSnap.exists() ? userSnap.data().joinedClasses : [];
        const isIn = Array.isArray(joined) && joined.includes(inviteId);
        if (cancelled) return;
        setInviteClass(c);
        setUserIsMember(isIn);
        setUserIsTeacher(c.teacherId === user.uid);
      } catch (e) {
        console.error(e);
        if (!cancelled) setInviteLoadError(t(`${J}.loadInviteFailed`, 'Nu s-a putut încărca invitația.'));
      } finally {
        if (!cancelled) setLoadingInvite(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, inviteId, t, J]);

  const handleSubmitManual = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!user) {
      navigate(localizedPath('/profil'), { state: { returnTo: returnToPath } });
      return;
    }
    setSubmitting(true);
    try {
      await requestJoinClass(user.uid, code, displayNameFromUser(user));
      setSuccess(
        t(`${J}.successManual`, 'Cererea ta a fost trimisă. Profesorul trebuie să o aprobe înainte să poți accesa clasa.')
      );
      setCode('');
    } catch (err) {
      const raw = err?.message || '';
      setError(translateClassOrAssignmentError(raw, t) || t('classes.errors.genericRequest', 'Eroare la trimiterea cererii.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitInviteRequest = async () => {
    setError('');
    setSuccess('');
    if (!user || !inviteId) return;
    setSubmitting(true);
    try {
      await requestJoinClass(user.uid, inviteId, displayNameFromUser(user));
      setSuccess(
        t(`${J}.successInvite`, 'Cererea ta e în așteptare. Când profesorul te acceptă, vei vedea clasa la „Clasele mele”.')
      );
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('Ai deja o cerere')) {
        setHasPendingRequest(true);
      } else {
        setError(translateClassOrAssignmentError(msg, t) || msg || t('classes.errors.genericRequest', 'Eroare la trimiterea cererii.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="teacher-dashboard class-join-page">
          <div className="class-join-loading">
            <div className="spinner" />
            <p>{t(`${J}.loading`, 'Se încarcă...')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const showInvitePanel = Boolean(inviteId && user && inviteClass && !inviteLoadError);
  const teacherInviteReady = Boolean(showInvitePanel && !loadingInvite && userIsTeacher);

  const studentInviteHero = (
    <header className="class-join-hero">
      <div className="class-join-badge">
        <Sparkles size={14} />
        <span>{inviteId ? t(`${J}.inviteBadge`, 'Invitație') : t(`${J}.codeBadge`, 'Cod de la profesor')}</span>
      </div>
      <h1 className="class-join-title">
        <span className="class-join-title-icon" aria-hidden>
          {inviteId ? <UserPlus size={34} strokeWidth={1.5} /> : <KeyRound size={34} strokeWidth={1.5} />}
        </span>
        {t(`${J}.title`, 'Intră în clasă')}
      </h1>
      <p className="class-join-lead">
        {inviteId
          ? t(`${J}.leadInvite`, 'Ai primit un link de invitație. După autentificare, trimiți o cerere; profesorul trebuie să o aprobe înainte să ai acces.')
          : t(
              `${J}.leadCode`,
              'Introdu codul clasei (ID-ul din panoul profesorului). Se trimite o cerere de intrare — profesorul o aprobă înainte să poți accesa clasa.'
            )}
      </p>
    </header>
  );

  const footerStudent = (
    <p className="class-join-footer">
      <Link to={localizedPath('/clasa')}>{t(`${J}.footerLink`, 'Vezi clasele la care ești deja înscris →')}</Link>
    </p>
  );

  return (
    <Layout>
      <div className="teacher-dashboard class-join-page">
        <div className="class-join-inner">
          <Link
            to={localizedPath(teacherInviteReady ? '/profesor' : '/clasa')}
            className="class-join-back"
          >
            <ArrowLeft size={18} />
            {teacherInviteReady
              ? t(`${J}.backTeacher`, 'Înapoi la panou profesor')
              : t(`${J}.backStudent`, 'Înapoi la clasele mele')}
          </Link>

          {teacherInviteReady ? (
            <>
              <header className="class-join-hero class-join-hero--teacher">
                <div className="class-join-badge class-join-badge--teacher">
                  <GraduationCap size={14} />
                  <span>{t(`${J}.teacherHeroBadge`, 'Clasa ta')}</span>
                </div>
                <h1 className="class-join-title">
                  <span className="class-join-title-icon class-join-title-icon--teacher" aria-hidden>
                    <GraduationCap size={30} strokeWidth={1.75} />
                  </span>
                  {inviteClass.name}
                </h1>
                <p className="class-join-lead class-join-lead--teacher">
                  {t(
                    `${J}.teacherLead`,
                    'Acest link este pentru elevi — ei trimit o cerere ca să intre. Tu ești deja profesorul acestei clase; deschide clasa din panou ca să gestionezi invitațiile și temele.'
                  )}
                </p>
              </header>

              <div className="class-join-panel class-join-panel--teacher">
                <Link
                  to={localizedPath(`/profesor/clasa/${inviteId}`)}
                  className="student-classes-btn student-classes-btn--primary"
                >
                  <GraduationCap size={18} />
                  {t(`${J}.openTeacherPanel`, 'Deschide în panoul profesor')}
                </Link>
              </div>

              <p className="class-join-footer">
                <Link to={localizedPath('/profesor')}>{t(`${J}.teacherFooter`, 'Panou profesor →')}</Link>
              </p>
            </>
          ) : !user ? (
            <>
              {studentInviteHero}
              <div className="class-join-panel class-join-panel--guest">
                <p className="class-join-guest-text">
                  {inviteId
                    ? t(`${J}.guestInvite`, 'Pentru a accepta invitația, autentifică-te cu contul PULS (din profil).')
                    : t(
                        `${J}.guestCode`,
                        'Pentru a trimite o cerere de intrare, ai nevoie de cont. Te poți conecta sau înregistra din profil.'
                      )}
                </p>
                <Link
                  to={localizedPath('/profil')}
                  state={{ returnTo: returnToPath }}
                  className="student-classes-btn student-classes-btn--primary"
                >
                  <LogIn size={18} />
                  {t(`${J}.goProfile`, 'Mergi la profil')}
                </Link>
              </div>
              {footerStudent}
            </>
          ) : inviteId && loadingInvite ? (
            <>
              <header className="class-join-hero class-join-hero--compact">
                <div className="class-join-badge">
                  <Sparkles size={14} />
                  <span>{t(`${J}.inviteBadge`, 'Invitație')}</span>
                </div>
                <p className="class-join-lead class-join-lead--solo">{t(`${J}.inviteLoadingLead`, 'Se încarcă detaliile invitației…')}</p>
              </header>
              <div className="class-join-panel class-join-panel--guest">
                <div className="class-join-loading-inline">
                  <div className="spinner" />
                </div>
              </div>
              {footerStudent}
            </>
          ) : inviteId && inviteLoadError ? (
            <>
              <header className="class-join-hero class-join-hero--compact">
                <h1 className="class-join-title class-join-title--solo">{t(`${J}.inviteLoadingTitle`, 'Invitație')}</h1>
                <p className="class-join-lead">{t(`${J}.inviteErrorLead`, 'Nu am putut folosi acest link.')}</p>
              </header>
              <div className="class-join-panel class-join-panel--guest">
                <p className="class-join-error">{inviteLoadError}</p>
                <Link to={localizedPath('/clasa/intra')} className="student-classes-btn student-classes-btn--primary">
                  {t(`${J}.manualCode`, 'Intră cu cod manual')}
                </Link>
              </div>
              {footerStudent}
            </>
          ) : showInvitePanel && !userIsTeacher ? (
            <>
              {studentInviteHero}
              <div className="class-join-panel">
                {userIsMember ? (
                  <>
                    <p className="class-join-success">{t(`${J}.alreadyEnrolled`, 'Ești deja înscris la această clasă.')}</p>
                    <Link
                      to={localizedPath(`/clasa/${inviteId}`)}
                      className="student-classes-btn student-classes-btn--primary"
                    >
                      {t(`${J}.goToClass`, 'Mergi la clasă')}
                    </Link>
                  </>
                ) : hasPendingRequest ? (
                  <>
                    <p className="class-join-pending-lead">
                      {t(`${J}.pendingLead`, 'Ai deja o cerere în așteptare pentru {name}.', { name: inviteClass.name })}
                    </p>
                    <Link to={localizedPath('/clasa')} className="student-classes-btn student-classes-btn--primary">
                      {t(`${J}.seeMyClasses`, 'Vezi clasele mele')}
                    </Link>
                  </>
                ) : success ? (
                  <>
                    <p className="class-join-invite-lead">
                      {t(`${J}.inviteLead`, 'Ești invitat în clasa {name}.', { name: inviteClass.name })}
                    </p>
                    <p className="class-join-success">{success}</p>
                    <Link to={localizedPath('/clasa')} className="student-classes-btn student-classes-btn--primary">
                      {t(`${J}.seeMyClasses`, 'Vezi clasele mele')}
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="class-join-invite-lead">
                      {t(`${J}.inviteLead`, 'Ești invitat în clasa {name}.', { name: inviteClass.name })}
                      {inviteClass.description ? <span className="class-join-muted"> {inviteClass.description}</span> : null}
                    </p>
                    {error && <p className="class-join-error">{error}</p>}
                    <button
                      type="button"
                      className="student-classes-btn student-classes-btn--primary"
                      disabled={submitting}
                      onClick={handleSubmitInviteRequest}
                    >
                      <UserPlus size={18} />
                      {submitting ? t(`${J}.sending`, 'Se trimite...') : t(`${J}.sendRequest`, 'Trimite cerere de intrare')}
                    </button>
                  </>
                )}
              </div>
              {footerStudent}
            </>
          ) : (
            <>
              {studentInviteHero}
              <form className="class-join-panel class-join-form" onSubmit={handleSubmitManual}>
                <label className="class-join-label" htmlFor="class-code-input">
                  {t(`${J}.codeLabel`, 'Cod / ID clasă')}
                </label>
                <input
                  id="class-code-input"
                  className="class-join-input"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.trim())}
                  placeholder={t(`${J}.codePlaceholder`, 'lipește exact codul (ID-ul documentului)')}
                  autoComplete="off"
                  maxLength={64}
                  spellCheck={false}
                />
                <p className="class-join-hint">
                  {t(
                    `${J}.codeHint`,
                    'ID-ul este sensibil la litere mari/mici — lipește-l exact cum ți l-a trimis profesorul. Profesorul trebuie să îți aprobe cererea înainte să ai acces.'
                  )}
                </p>
                {error && <p className="class-join-error">{error}</p>}
                {success && <p className="class-join-success">{success}</p>}
                <button
                  type="submit"
                  className="student-classes-btn student-classes-btn--primary"
                  disabled={submitting || !code.trim()}
                >
                  <KeyRound size={18} />
                  {submitting ? t(`${J}.sending`, 'Se trimite...') : t(`${J}.submitRequest`, 'Trimite cererea de intrare')}
                </button>
              </form>
              {footerStudent}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ClassJoinPage;
