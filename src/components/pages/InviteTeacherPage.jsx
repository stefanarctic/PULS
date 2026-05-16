import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '../Layout';
import { auth, db } from '../../lib/firebase';
import { fetchTeacherInvitePreview, redeemTeacherInvite } from '../../lib/teacherInvite';
import { useI18n } from '../../i18n/LanguageContext';
import { ArrowRight, GraduationCap, LogIn, Sparkles } from 'lucide-react';
import '../../scss/components/_teacher-dashboard.scss';

const InviteTeacherPage = () => {
  const navigate = useNavigate();
  const { localizedPath } = useI18n();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => {
    const raw = searchParams.get('t');
    return raw ? String(raw).trim() : '';
  }, [searchParams]);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [inviteOk, setInviteOk] = useState(null);
  const [inviteLoadError, setInviteLoadError] = useState('');
  const [teacherStatus, setTeacherStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!token || token.length < 32) {
      setInviteOk(false);
      setInviteLoadError('');
      return;
    }
    let cancelled = false;
    setInviteLoadError('');
    (async () => {
      const prev = await fetchTeacherInvitePreview(token);
      if (cancelled) return;
      if (!prev.ok) {
        setInviteOk(false);
        if (prev.reason === 'expired') setInviteLoadError('Invitația a expirat.');
        else if (prev.reason === 'used') setInviteLoadError('Invitația a fost deja folosită.');
        else setInviteLoadError('Linkul nu este valid.');
        return;
      }
      setInviteOk(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (authLoading || user) return;
    if (!token) return;
    const redirect = encodeURIComponent(`/invite-teacher?t=${token}`);
    navigate(`${localizedPath('/profil')}?redirect=${redirect}`, { replace: true });
  }, [authLoading, user, token, navigate]);

  useEffect(() => {
    if (!user?.uid) {
      setTeacherStatus(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (cancelled) return;
        const ts = snap.exists() ? snap.data().teacherStatus || 'none' : 'none';
        setTeacherStatus(ts);
      } catch {
        if (!cancelled) setTeacherStatus('none');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const handleSubmit = async () => {
    if (!user?.uid || !token) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await redeemTeacherInvite(user.uid, token);
      setSubmitSuccess(true);
      setTeacherStatus('pending');
    } catch (e) {
      console.error(e);
      setSubmitError(e?.message || 'Nu s-a putut trimite cererea.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="teacher-dashboard student-classes-page invite-teacher-page">
          <div className="student-classes-loading">
            <div className="spinner" />
            <p>Se încarcă...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!token || token.length < 32) {
    return (
      <Layout>
        <div className="teacher-dashboard student-classes-page invite-teacher-page">
          <div className="student-classes-inner">
            <div className="student-classes-guest-card invite-teacher-card">
              <GraduationCap className="student-classes-guest-icon" strokeWidth={1.25} />
              <h1 className="student-classes-guest-title">Invitație profesor</h1>
              <p className="student-classes-guest-text">
                Lipsește tokenul din link. Folosește linkul complet primit de la administrator.
              </p>
              <Link to={localizedPath('/')} className="student-classes-btn student-classes-btn--primary">
                Acasă
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (user && inviteOk === false) {
    return (
      <Layout>
        <div className="teacher-dashboard student-classes-page invite-teacher-page">
          <div className="student-classes-inner">
            <div className="student-classes-guest-card invite-teacher-card">
              <GraduationCap className="student-classes-guest-icon" strokeWidth={1.25} />
              <h1 className="student-classes-guest-title">Invitație profesor</h1>
              <p className="student-classes-guest-text">
                {inviteLoadError || 'Linkul nu este valid sau a expirat.'}
              </p>
              <Link to={localizedPath('/profil')} className="student-classes-btn student-classes-btn--primary">
                Mergi la profil
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="teacher-dashboard student-classes-page invite-teacher-page">
          <div className="student-classes-inner">
            <div className="student-classes-guest-card invite-teacher-card">
              <LogIn className="student-classes-guest-icon" strokeWidth={1.25} />
              <h1 className="student-classes-guest-title">Autentificare</h1>
              <p className="student-classes-guest-text">
                Te redirecționăm la profil pentru a te conecta sau a-ți crea cont. După autentificare vei reveni
                aici la invitația profesor.
              </p>
              <div className="spinner" style={{ margin: '1rem auto' }} />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (inviteOk === null) {
    return (
      <Layout>
        <div className="teacher-dashboard student-classes-page invite-teacher-page">
          <div className="student-classes-loading">
            <div className="spinner" />
            <p>Se verifică invitația...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (teacherStatus === null) {
    return (
      <Layout>
        <div className="teacher-dashboard student-classes-page invite-teacher-page">
          <div className="student-classes-loading">
            <div className="spinner" />
            <p>Se încarcă profilul...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (teacherStatus === 'approved') {
    return (
      <Layout>
        <div className="teacher-dashboard student-classes-page invite-teacher-page">
          <div className="student-classes-inner">
            <div className="student-classes-guest-card invite-teacher-card">
              <Sparkles className="student-classes-guest-icon" strokeWidth={1.25} />
              <h1 className="student-classes-guest-title">Ești deja profesor</h1>
              <p className="student-classes-guest-text">Poți accesa panoul profesor din profil.</p>
              <Link to={localizedPath('/profesor')} className="student-classes-btn student-classes-btn--primary">
                Panou profesor
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (teacherStatus === 'pending' || submitSuccess) {
    return (
      <Layout>
        <div className="teacher-dashboard student-classes-page invite-teacher-page">
          <div className="student-classes-inner">
            <div className="student-classes-guest-card invite-teacher-card">
              <GraduationCap className="student-classes-guest-icon" strokeWidth={1.25} />
              <h1 className="student-classes-guest-title">Cerere înregistrată</h1>
              <p className="student-classes-guest-text">
                Cererea ta pentru cont profesor este în așteptare. Un administrator o va revizui în curând.
              </p>
              <Link to={localizedPath('/profil')} className="student-classes-btn student-classes-btn--primary">
                Înapoi la profil
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
      <div className="teacher-dashboard student-classes-page invite-teacher-page">
        <div className="student-classes-inner">
          <header className="student-classes-hero">
            <div className="student-classes-inner student-classes-hero-inner">
              <div className="student-classes-hero-badge">
                <Sparkles size={14} />
                <span>Invitație</span>
              </div>
              <h1 className="student-classes-guest-title invite-teacher-title">
                <span className="student-classes-title-icon" aria-hidden>
                  <GraduationCap size={36} strokeWidth={1.5} />
                </span>
                Cont profesor
              </h1>
              <p className="student-classes-guest-text invite-teacher-lead">
                Ai primit un link invitație. Poți trimite o cerere pentru a deveni profesor pe platformă; un
                administrator va aproba sau respinge cererea.
              </p>
            </div>
          </header>

          <div className="invite-teacher-actions">
            {teacherStatus === 'rejected' && (
              <p className="invite-teacher-warn">Cererea ta anterioară a fost respinsă. Poți trimite o cerere nouă cu această invitație.</p>
            )}
            {submitError && <p className="invite-teacher-error">{submitError}</p>}
            <button
              type="button"
              className="student-classes-btn student-classes-btn--primary student-classes-btn--lg"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Se trimite...' : 'Trimite cererea de cont profesor'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InviteTeacherPage;
