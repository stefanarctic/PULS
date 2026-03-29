import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../Layout';
import { useTeacher } from '../../hooks/useTeacher';
import { fetchTeacherClasses, createClass } from '../../lib/teacherClasses';
import { copyToClipboard } from '../../lib/copyToClipboard';
import { getClassInviteUrl } from '../../lib/classInviteUrl';
import { GraduationCap, Plus, ChevronRight, Copy, Share2 } from 'lucide-react';
import '../../scss/components/_teacher-dashboard.scss';

const TeacherDashboard = () => {
  const { isApprovedTeacher, loading, user } = useTeacher();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [listError, setListError] = useState('');
  const [copiedClassId, setCopiedClassId] = useState(null);
  const [sharedLinkClassId, setSharedLinkClassId] = useState(null);
  const copyFeedbackTimerRef = useRef(null);
  const shareFeedbackTimerRef = useRef(null);

  const handleCopyClassCode = async (classId) => {
    const ok = await copyToClipboard(classId);
    if (!ok) return;
    if (copyFeedbackTimerRef.current) clearTimeout(copyFeedbackTimerRef.current);
    if (shareFeedbackTimerRef.current) clearTimeout(shareFeedbackTimerRef.current);
    setSharedLinkClassId(null);
    setCopiedClassId(classId);
    copyFeedbackTimerRef.current = setTimeout(() => setCopiedClassId(null), 2000);
  };

  const handleShareInviteLink = async (classId) => {
    const url = getClassInviteUrl(classId);
    const ok = await copyToClipboard(url);
    if (!ok) return;
    if (shareFeedbackTimerRef.current) clearTimeout(shareFeedbackTimerRef.current);
    if (copyFeedbackTimerRef.current) clearTimeout(copyFeedbackTimerRef.current);
    setCopiedClassId(null);
    setSharedLinkClassId(classId);
    shareFeedbackTimerRef.current = setTimeout(() => setSharedLinkClassId(null), 2000);
  };

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current) clearTimeout(copyFeedbackTimerRef.current);
      if (shareFeedbackTimerRef.current) clearTimeout(shareFeedbackTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!loading && !isApprovedTeacher) {
      navigate('/');
    }
  }, [loading, isApprovedTeacher, navigate]);

  useEffect(() => {
    if (!user?.uid || !isApprovedTeacher) return;
    let cancelled = false;
    setLoadingList(true);
    setListError('');
    fetchTeacherClasses(user.uid)
      .then((list) => {
        if (!cancelled) setClasses(list);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setListError('Nu s-au putut încărca clasele.');
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, isApprovedTeacher]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError('Introdu numele clasei.');
      return;
    }
    if (!user?.uid) return;
    setCreating(true);
    try {
      const { classId } = await createClass(user.uid, trimmed, description);
      setName('');
      setDescription('');
      navigate(`/profesor/clasa/${classId}`);
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Eroare la crearea clasei.');
    } finally {
      setCreating(false);
    }
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="teacher-dashboard-loading">
          <div className="spinner" />
          <p>Se încarcă...</p>
        </div>
      </Layout>
    );
  }

  if (!isApprovedTeacher) {
    return null;
  }

  return (
    <Layout>
      <div className="teacher-dashboard">
        <div className="teacher-dashboard-inner">
          <h1 className="teacher-dashboard-title">
            <GraduationCap size={36} aria-hidden />
            <span>Panou profesor</span>
          </h1>

          <section className="teacher-dashboard-card">
            <h2>Clasă nouă</h2>
            <form className="teacher-dashboard-form" onSubmit={handleCreate}>
              <label>
                Nume clasă
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex. Fizică XA"
                  maxLength={120}
                />
              </label>
              <label>
                Descriere (opțional)
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  maxLength={500}
                />
              </label>
              {formError && <p className="teacher-dashboard-error">{formError}</p>}
              <button type="submit" className="teacher-dashboard-btn primary" disabled={creating}>
                {creating ? 'Se creează...' : (
                  <>
                    <Plus size={18} />
                    Creează clasă
                  </>
                )}
              </button>
            </form>
          </section>

          <section className="teacher-dashboard-card">
            <h2>Clasele tale</h2>
            {loadingList ? (
              <p>Se încarcă lista...</p>
            ) : listError ? (
              <p className="teacher-dashboard-error">{listError}</p>
            ) : classes.length === 0 ? (
              <p className="teacher-dashboard-muted">Nu ai încă clase. Creează una mai sus.</p>
            ) : (
              <ul className="teacher-dashboard-class-list">
                {classes.map((c) => (
                  <li key={c.id}>
                    <div className="teacher-dashboard-class-row">
                      <Link to={`/profesor/clasa/${c.id}`} className="teacher-dashboard-class-link">
                        <span className="teacher-dashboard-class-name">{c.name}</span>
                        <span className="teacher-dashboard-class-code">
                          Cod: {c.id}
                          {copiedClassId === c.id && (
                            <span className="teacher-dashboard-code-copied"> Copiat!</span>
                          )}
                          {sharedLinkClassId === c.id && copiedClassId !== c.id && (
                            <span className="teacher-dashboard-code-copied"> Link copiat!</span>
                          )}
                        </span>
                        <ChevronRight size={20} />
                      </Link>
                      <span className="teacher-dashboard-code-actions teacher-dashboard-code-actions--row">
                        <button
                          type="button"
                          className="teacher-dashboard-copy-btn teacher-dashboard-copy-btn--row"
                          onClick={() => handleCopyClassCode(c.id)}
                          aria-label={`Copiază codul clasei ${c.name || c.id}`}
                        >
                          <Copy size={18} strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          className="teacher-dashboard-copy-btn teacher-dashboard-copy-btn--row"
                          onClick={() => handleShareInviteLink(c.id)}
                          aria-label={`Copiază linkul de invitație pentru ${c.name || c.id}`}
                          title="Link invitație"
                        >
                          <Share2 size={18} strokeWidth={2} />
                        </button>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
