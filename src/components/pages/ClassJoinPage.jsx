import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import Layout from '../Layout';
import { auth } from '../../lib/firebase';
import { joinClassWithCode } from '../../lib/teacherClasses';
import { ArrowLeft, KeyRound, LogIn, Sparkles } from 'lucide-react';
import '../../scss/components/_teacher-dashboard.scss';

const ClassJoinPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!user) {
      navigate('/profil');
      return;
    }
    setSubmitting(true);
    try {
      const classId = await joinClassWithCode(user.uid, code, user.displayName || user.email?.split('@')[0] || '');
      setSuccess('Te-ai înscris cu succes!');
      setCode('');
      setTimeout(() => navigate(`/clasa/${classId}`), 800);
    } catch (err) {
      setError(err.message || 'Eroare la înscriere.');
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
            <p>Se încarcă...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="teacher-dashboard class-join-page">
        <div className="class-join-inner">
          <Link to="/clasa" className="class-join-back">
            <ArrowLeft size={18} />
            Înapoi la clasele mele
          </Link>

          <header className="class-join-hero">
            <div className="class-join-badge">
              <Sparkles size={14} />
              <span>Cod de la profesor</span>
            </div>
            <h1 className="class-join-title">
              <span className="class-join-title-icon" aria-hidden>
                <KeyRound size={34} strokeWidth={1.5} />
              </span>
              Intră în clasă
            </h1>
            <p className="class-join-lead">
              Introdu codul pe care ți l-a dat profesorul. Trebuie să fii autentificat cu cont PULS (din profil).
            </p>
          </header>

          {!user ? (
            <div className="class-join-panel class-join-panel--guest">
              <p className="class-join-guest-text">
                Pentru a te înscrie, ai nevoie de un cont. Te poți conecta sau înregistra din profil.
              </p>
              <Link to="/profil" className="student-classes-btn student-classes-btn--primary">
                <LogIn size={18} />
                Mergi la profil
              </Link>
            </div>
          ) : (
            <form className="class-join-panel class-join-form" onSubmit={handleSubmit}>
              <label className="class-join-label" htmlFor="class-code-input">
                Cod clasă
              </label>
              <input
                id="class-code-input"
                className="class-join-input"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ex. ABC123"
                autoComplete="off"
                maxLength={32}
                autoCapitalize="characters"
                spellCheck={false}
              />
              <p className="class-join-hint">Litere și cifre — fără spații.</p>
              {error && <p className="class-join-error">{error}</p>}
              {success && <p className="class-join-success">{success}</p>}
              <button
                type="submit"
                className="student-classes-btn student-classes-btn--primary"
                disabled={submitting || !code.trim()}
              >
                <KeyRound size={18} />
                {submitting ? 'Se înscrie...' : 'Intră în clasă'}
              </button>
            </form>
          )}

          <p className="class-join-footer">
            <Link to="/clasa">Vezi clasele la care ești deja înscris →</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ClassJoinPage;
