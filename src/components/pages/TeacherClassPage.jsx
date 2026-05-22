import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '../Layout';
import { useTeacher } from '../../hooks/useTeacher';
import {
  fetchClass,
  fetchClassMembers,
  fetchClassAssignments,
  fetchJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  updateClassMeta,
  deleteClassCascade,
  removeMember,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from '../../lib/teacherClasses';
import { getClassInviteUrl } from '../../lib/classInviteUrl';
import { fetchGrile } from '../../features/grile/grileSlice';
import { simulationsConfig } from '@/data/simulations';
import {
  ArrowLeft,
  Trash2,
  Users,
  ClipboardList,
  Plus,
  X,
  GripVertical,
  Copy,
  Share2,
  UserPlus,
} from 'lucide-react';
import { copyToClipboard } from '../../lib/copyToClipboard';
import { fetchSubmissionsMapForAssignment, studentAssignmentDueStatus } from '../../lib/assignmentProgress';
import { translateClassOrAssignmentError } from '../../i18n/classErrors';
import { useI18n } from '../../i18n/LanguageContext';
import '../../scss/components/_teacher-dashboard.scss';

const emptyItem = (type) => {
  switch (type) {
    case 'problem':
      return { type: 'problem', problemId: '' };
    case 'grila':
      return { type: 'grila', grilaId: '' };
    case 'simulation':
      return { type: 'simulation', slug: simulationsConfig[0]?.slug || 'pendul-simplu' };
    case 'text':
      return { type: 'text', body: '' };
    default:
      return { type: 'text', body: '' };
  }
};

const TeacherClassPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, localizedPath, lang } = useI18n();
  const TCH = 'classes.teacherClass';
  const AS = 'classes.assignmentStatus';
  const TA = 'classes.teacherAssignment';

  const assignmentStatusLabels = useMemo(
    () => ({
      done: t(`${AS}.done`, 'Tema făcută'),
      overdue: t(`${AS}.overdue`, 'Tema nefăcută (termen depășit)'),
      inProgress: t(`${AS}.inProgress`, 'În lucru'),
      notStarted: t(`${AS}.notStarted`, 'De început'),
    }),
    [t, AS],
  );

  const localeTag = lang === 'en' ? 'en-GB' : 'ro-RO';

  const { isApprovedTeacher, loading: authLoading, user } = useTeacher();
  const problems = useSelector((s) => s.problems.value || []);
  const grile = useSelector((s) => s.grile.value || []);
  const grileStatus = useSelector((s) => s.grile.status);

  const [classData, setClassData] = useState(null);
  const [members, setMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);

  const [assignmentDraft, setAssignmentDraft] = useState(null);
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [submissionsByAssignment, setSubmissionsByAssignment] = useState({});
  const assignmentPanelRef = useRef(null);
  const copyFeedbackTimerRef = useRef(null);
  const shareFeedbackTimerRef = useRef(null);

  const handleCopyClassCode = async () => {
    if (!classId) return;
    const ok = await copyToClipboard(classId);
    if (!ok) return;
    if (copyFeedbackTimerRef.current) clearTimeout(copyFeedbackTimerRef.current);
    setLinkCopied(false);
    setCodeCopied(true);
    copyFeedbackTimerRef.current = setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleShareInviteLink = async () => {
    if (!classId) return;
    const url = getClassInviteUrl(classId);
    const ok = await copyToClipboard(url);
    if (!ok) return;
    if (shareFeedbackTimerRef.current) clearTimeout(shareFeedbackTimerRef.current);
    setCodeCopied(false);
    setLinkCopied(true);
    shareFeedbackTimerRef.current = setTimeout(() => setLinkCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current) clearTimeout(copyFeedbackTimerRef.current);
      if (shareFeedbackTimerRef.current) clearTimeout(shareFeedbackTimerRef.current);
    };
  }, []);

  const loadAll = useCallback(async () => {
    if (!classId || !user?.uid) return;
    setLoading(true);
    setLoadError('');
    try {
      const [c, m, a, jr] = await Promise.all([
        fetchClass(classId),
        fetchClassMembers(classId),
        fetchClassAssignments(classId),
        fetchJoinRequests(classId),
      ]);
      if (!c || c.teacherId !== user?.uid) {
        setLoadError(t(`${TCH}.notFoundOrForbidden`, 'Clasa nu există sau nu ai permisiune.'));
        setClassData(null);
        return;
      }
      setClassData(c);
      setEditName(c.name || '');
      setEditDesc(c.description || '');
      setMembers(m);
      setAssignments(a);
      setJoinRequests(jr);
    } catch (e) {
      console.error(e);
      setLoadError(t(`${TCH}.loadFailed`, 'Eroare la încărcare.'));
    } finally {
      setLoading(false);
    }
  }, [classId, user?.uid, t, TCH]);

  useEffect(() => {
    if (!classId || !assignments.length) {
      setSubmissionsByAssignment({});
      return;
    }
    let cancelled = false;
    (async () => {
      const out = {};
      try {
        for (const a of assignments) {
          out[a.id] = await fetchSubmissionsMapForAssignment(classId, a.id);
        }
        if (!cancelled) setSubmissionsByAssignment(out);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [classId, assignments]);

  useEffect(() => {
    if (authLoading) return;
    if (!isApprovedTeacher) {
      navigate(localizedPath('/'));
      return;
    }
    if (user?.uid) loadAll();
  }, [authLoading, isApprovedTeacher, user?.uid, loadAll, navigate, localizedPath]);

  useEffect(() => {
    if (grileStatus === 'idle') {
      dispatch(fetchGrile());
    }
  }, [dispatch, grileStatus]);

  useEffect(() => {
    if (assignmentDraft && assignmentPanelRef.current) {
      assignmentPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [assignmentDraft]);

  const sortedProblems = useMemo(
    () => [...problems].sort((a, b) => (a.titlu || '').localeCompare(b.titlu || '')),
    [problems]
  );

  const openNewAssignment = () => {
    setAssignmentDraft({
      id: null,
      title: '',
      dueDate: '',
      items: [],
    });
  };

  const openEditAssignment = (a) => {
    const due = a.dueDate?.toDate
      ? a.dueDate.toDate().toISOString().slice(0, 16)
      : '';
    const rawItems = Array.isArray(a.items) ? [...a.items] : [];
    const items = rawItems.map((it) => {
      if (it.type === 'problem' && typeof it.index === 'number' && !String(it.problemId || '').trim()) {
        const p = sortedProblems.find((x) => x.index === it.index);
        return p ? { ...it, problemId: p.id } : it;
      }
      if (it.type === 'grila' && typeof it.index === 'number' && !String(it.grilaId || '').trim()) {
        const g = grile.find((x) => x.index === it.index);
        return g ? { ...it, grilaId: g.id } : it;
      }
      return it;
    });
    setAssignmentDraft({
      id: a.id,
      title: a.title || '',
      dueDate: due,
      items,
    });
  };

  const saveMeta = async (e) => {
    e.preventDefault();
    if (!classId) return;
    setSavingMeta(true);
    try {
      await updateClassMeta(classId, { name: editName, description: editDesc });
      await loadAll();
    } catch (err) {
      console.error(err);
      alert(t(`${TCH}.saveMetaFailed`, 'Nu s-a putut salva.'));
    } finally {
      setSavingMeta(false);
    }
  };

  const handleRemoveMember = async (studentUid) => {
    if (!window.confirm(t(`${TCH}.confirmRemoveMember`, 'Elimini acest elev din clasă?'))) return;
    try {
      await removeMember(classId, studentUid);
      await loadAll();
    } catch (err) {
      console.error(err);
      alert(t(`${TCH}.deleteAssignmentFailed`, 'Eroare.'));
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm(t(`${TCH}.confirmDeleteAssignment`, 'Ștergi această temă?'))) return;
    try {
      await deleteAssignment(classId, assignmentId);
      await loadAll();
    } catch (err) {
      console.error(err);
      alert(t(`${TCH}.deleteAssignmentFailed`, 'Eroare.'));
    }
  };

  const handleDeleteClass = async () => {
    if (!window.confirm(t(`${TCH}.confirmDeleteClass`, 'Ștergi definitiv această clasă? Toate temele și înscrierile vor fi eliminate. Acțiunea nu poate fi anulată.'))) {
      return;
    }
    setDeleting(true);
    try {
      await deleteClassCascade(classId);
      navigate(localizedPath('/profesor'));
    } catch (err) {
      console.error(err);
      alert(t(`${TCH}.deleteClassFailed`, 'Eroare la ștergerea clasei.'));
    } finally {
      setDeleting(false);
    }
  };

  const handleApproveJoin = async (studentUid) => {
    try {
      await approveJoinRequest(classId, studentUid);
      await loadAll();
    } catch (err) {
      console.error(err);
      alert(t(`${TCH}.approveFailed`, 'Nu s-a putut aproba cererea.'));
    }
  };

  const handleRejectJoin = async (studentUid) => {
    if (!window.confirm(t(`${TCH}.confirmRejectRequest`, 'Respingi această cerere de intrare?'))) return;
    try {
      await rejectJoinRequest(classId, studentUid);
      await loadAll();
    } catch (err) {
      console.error(err);
      alert(t(`${TCH}.rejectFailed`, 'Nu s-a putut respinge cererea.'));
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="teacher-dashboard-loading">
          <div className="spinner" />
          <p>{t(`${TCH}.loading`, 'Se încarcă...')}</p>
        </div>
      </Layout>
    );
  }

  if (!isApprovedTeacher || loadError || !classData) {
    return (
      <Layout>
        <div className="teacher-dashboard-error-screen">
          <p>{loadError || t(`${TCH}.accessDenied`, 'Acces interzis.')}</p>
          <Link to={localizedPath('/profesor')}>{t(`${TCH}.backDashboard`, 'Înapoi la panou profesor')}</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="teacher-dashboard">
        <div className="teacher-dashboard-inner">
          <Link to={localizedPath('/profesor')} className="teacher-dashboard-back">
            <ArrowLeft size={18} />
            {t(`${TCH}.backAllClasses`, 'Toate clasele')}
          </Link>

          <header className="teacher-dashboard-header">
            <h1 className="teacher-dashboard-title">{classData.name}</h1>
            <div className="teacher-dashboard-code teacher-dashboard-code--with-copy">
              <span className="teacher-dashboard-code-label">{t(`${TCH}.entryCodeLabel`, 'Cod intrare elevi (ID clasă):')}</span>
              <span className="teacher-dashboard-code-value">
                <code className="teacher-dashboard-code-id">{classId}</code>
                <span className="teacher-dashboard-code-actions">
                  <button
                    type="button"
                    className="teacher-dashboard-copy-btn"
                    onClick={handleCopyClassCode}
                    aria-label={t(`${TCH}.copyCodeAria`, 'Copiază codul clasei în clipboard')}
                    title={t(`${TCH}.copyCodeTitle`, 'Copiază codul clasei (ID pentru intrare)')}
                  >
                    <Copy size={18} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    className="teacher-dashboard-copy-btn"
                    onClick={handleShareInviteLink}
                    aria-label={t(`${TCH}.copyInviteAria`, 'Copiază linkul de invitație în clasă')}
                    title={t(`${TCH}.copyInviteTitle`, 'Link invitație (elevii trimit cerere)')}
                  >
                    <Share2 size={18} strokeWidth={2} />
                  </button>
                </span>
                {(codeCopied || linkCopied) && (
                  <span className="teacher-dashboard-code-copied">
                    {codeCopied
                      ? t(`${TCH}.codeCopiedMsg`, 'Codul clasei a fost copiat în clipboard.')
                      : t(`${TCH}.linkCopiedMsg`, 'Linkul de invitație a fost copiat în clipboard.')}
                  </span>
                )}
              </span>
            </div>
          </header>

          <section className="teacher-dashboard-card">
            <h2>{t(`${TCH}.detailsHeading`, 'Detalii clasă')}</h2>
            <form onSubmit={saveMeta} className="teacher-dashboard-form">
              <label>
                {t(`${TCH}.name`, 'Nume')}
                <input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={120} />
              </label>
              <label>
                {t(`${TCH}.description`, 'Descriere')}
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} maxLength={500} />
              </label>
              <button type="submit" className="teacher-dashboard-btn primary" disabled={savingMeta}>
                {savingMeta ? t(`${TCH}.save`, 'Salvează...') : t(`${TCH}.saveIdle`, 'Salvează detaliile')}
              </button>
            </form>
            <div className="teacher-dashboard-danger-zone">
              <button
                type="button"
                className="teacher-dashboard-btn danger"
                onClick={handleDeleteClass}
                disabled={deleting}
              >
                {deleting ? t(`${TCH}.deletingClass`, 'Se șterge...') : t(`${TCH}.deleteClass`, 'Șterge clasă')}
              </button>
            </div>
          </section>

          <section className="teacher-dashboard-card">
            <h2>
              <UserPlus size={22} /> {t(`${TCH}.joinRequests`, 'Cereri de intrare ({count})', { count: joinRequests.length })}
            </h2>
            {joinRequests.length === 0 ? (
              <p className="teacher-dashboard-muted">{t(`${TCH}.noJoinRequests`, 'Nicio cerere în așteptare.')}</p>
            ) : (
              <ul className="teacher-dashboard-join-request-list">
                {joinRequests.map((r) => {
                  const ts = r.requestedAt?.toDate
                    ? r.requestedAt.toDate()
                    : r.requestedAt?.seconds
                      ? new Date(r.requestedAt.seconds * 1000)
                      : null;
                  const when = ts ? ts.toLocaleString(localeTag, { dateStyle: 'short', timeStyle: 'short' }) : '';
                  return (
                    <li key={r.studentUid} className="teacher-dashboard-join-request-row">
                      <div>
                        <span className="teacher-dashboard-join-request-name">{r.studentName || r.studentUid}</span>
                        {when ? (
                          <span className="teacher-dashboard-muted teacher-dashboard-join-request-when">
                            {' '}
                            · {when}
                          </span>
                        ) : null}
                      </div>
                      <div className="teacher-dashboard-join-request-actions">
                        <button
                          type="button"
                          className="teacher-dashboard-btn primary small"
                          onClick={() => handleApproveJoin(r.studentUid)}
                        >
                          {t('adminDashboard.teacherRequests.approve', 'Aprobă')}
                        </button>
                        <button
                          type="button"
                          className="teacher-dashboard-btn danger small"
                          onClick={() => handleRejectJoin(r.studentUid)}
                        >
                          {t('adminDashboard.teacherRequests.reject', 'Respinge')}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="teacher-dashboard-card">
            <h2>
              <Users size={22} /> {t(`${TCH}.studentsHeading`, 'Elevi ({count})', { count: members.length })}
            </h2>
            {members.length === 0 ? (
              <p className="teacher-dashboard-muted">{t(`${TCH}.noStudents`, 'Niciun elev încă. Distribuie codul sau linkul de mai sus.')}</p>
            ) : (
              <ul className="teacher-dashboard-member-list">
                {members.map((m) => (
                  <li key={m.id}>
                    <span>{m.studentName || m.id}</span>
                    <button
                      type="button"
                      className="teacher-dashboard-icon-btn"
                      onClick={() => handleRemoveMember(m.id)}
                      title={t(`${TCH}.confirmRemoveMember`, 'Elimină din clasă')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="teacher-dashboard-card">
            <div className="teacher-dashboard-row">
              <h2>
                <ClipboardList size={22} /> {t(`${TCH}.assignmentsHeading`, 'Teme')}
              </h2>
              <button
                type="button"
                className="teacher-dashboard-btn primary"
                onClick={openNewAssignment}
                disabled={!!assignmentDraft}
              >
                <Plus size={18} />
                {t(`${TCH}.newAssignment`, 'Temă nouă')}
              </button>
            </div>

            {assignmentDraft && (
              <div ref={assignmentPanelRef}>
                <AssignmentEditorPanel
                  draft={assignmentDraft}
                  setDraft={setAssignmentDraft}
                  classId={classId}
                  userId={user.uid}
                  sortedProblems={sortedProblems}
                  grile={grile}
                  onSaved={loadAll}
                  assignmentSaving={assignmentSaving}
                  setAssignmentSaving={setAssignmentSaving}
                  t={t}
                  taPrefix={TA}
                />
              </div>
            )}

            {assignments.length === 0 && !assignmentDraft ? (
              <p className="teacher-dashboard-muted">{t(`${TCH}.noAssignments`, 'Nicio temă încă.')}</p>
            ) : assignments.length > 0 ? (
              <ul className="teacher-dashboard-assignment-list">
                {assignments.map((a) => {
                  const subsMap = submissionsByAssignment[a.id] || {};
                  const itemCount = (a.items || []).length;
                  return (
                    <li key={a.id}>
                      <div className="teacher-dashboard-assignment-main">
                        <div className="teacher-dashboard-assignment-title-block">
                          <strong>{a.title}</strong>
                          {a.dueDate?.toDate && (
                            <span className="teacher-dashboard-muted">
                              {t(`${TCH}.duePrefix`, ' · Termen:')}{' '}
                              {a.dueDate.toDate().toLocaleString(localeTag)}
                            </span>
                          )}
                        </div>
                        <div className="teacher-dashboard-assignment-actions">
                          <button
                            type="button"
                            className="teacher-dashboard-link-btn"
                            onClick={() => openEditAssignment(a)}
                            disabled={!!assignmentDraft}
                          >
                            {t(`${TCH}.edit`, 'Editează')}
                          </button>
                          <button
                            type="button"
                            className="teacher-dashboard-link-btn danger"
                            onClick={() => handleDeleteAssignment(a.id)}
                            disabled={!!assignmentDraft}
                          >
                            {t(`${TCH}.delete`, 'Șterge')}
                          </button>
                        </div>
                      </div>
                      {members.length > 0 && (
                        <div className="teacher-hw-progress">
                          <p className="teacher-hw-progress-title">{t(`${TCH}.studentProgressHeading`, 'Progres elevi')}</p>
                          <ul className="teacher-hw-progress-list">
                            {members.map((m) => {
                              const sub = subsMap[m.studentUid];
                              const st = studentAssignmentDueStatus({
                                dueDate: a.dueDate,
                                submission: sub,
                                itemCount,
                                labels: assignmentStatusLabels,
                              });
                              const avg =
                                sub?.allDone && sub.averageScore10 != null
                                  ? t(`${TCH}.averageScore`, 'Medie: {n}/10', { n: sub.averageScore10 })
                                  : '';
                              return (
                                <li key={m.id} className="teacher-hw-progress-item">
                                  <span className="teacher-hw-progress-name">{m.studentName || m.id}</span>
                                  <span className="teacher-hw-progress-meta">
                                    {st.label}
                                    {avg ? ` · ${avg}` : ''}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>
        </div>
      </div>
    </Layout>
  );
};

function AssignmentEditorPanel({
  draft,
  setDraft,
  classId,
  userId,
  sortedProblems,
  grile,
  onSaved,
  assignmentSaving,
  setAssignmentSaving,
  t,
  taPrefix,
}) {
  const TA = taPrefix;
  const [title, setTitle] = useState(draft.title);
  const [dueDate, setDueDate] = useState(draft.dueDate);
  const [items, setItems] = useState(draft.items || []);

  useEffect(() => {
    setTitle(draft.title);
    setDueDate(draft.dueDate);
    setItems(draft.items || []);
  }, [draft]);

  const addItem = (type) => {
    setItems((prev) => [...prev, emptyItem(type)]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const moveItem = (index, dir) => {
    setItems((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const patchItem = (index, patch) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const validateItems = () => {
    for (const it of items) {
      if (it.type === 'problem') {
        const pid = String(it.problemId || '').trim();
        if (!pid) return t(`${TA}.valPickProblem`, 'Alege o problemă.');
        const p = sortedProblems.find((x) => String(x.id) === pid);
        if (!p || typeof p.index !== 'number')
          return t(`${TA}.valProblemIndex`, 'Problemă invalidă (lipsește indexul în date).');
      }
      if (it.type === 'grila') {
        const gid = String(it.grilaId || '').trim();
        if (!gid) return t(`${TA}.valPickGrila`, 'Alege o grilă.');
        const g = grile.find((x) => String(x.id) === gid);
        if (!g || typeof g.index !== 'number')
          return t(`${TA}.valGrilaIndex`, 'Grilă invalidă (lipsește indexul în date).');
      }
      if (it.type === 'simulation' && !String(it.slug || '').trim())
        return t(`${TA}.valSimulation`, 'Alege o simulare.');
      if (it.type === 'text' && !String(it.body || '').trim())
        return t(`${TA}.valText`, 'Textul nu poate fi gol.');
    }
    return '';
  };

  const handleSave = async () => {
    const err = validateItems();
    if (err) {
      alert(err);
      return;
    }
    if (!String(title).trim()) {
      alert(t(`${TA}.valTitle`, 'Introdu titlul temei.'));
      return;
    }
    const cleanItems = items.map((it) => {
      if (it.type === 'problem') {
        const p = sortedProblems.find((x) => String(x.id) === String(it.problemId).trim());
        return { type: 'problem', index: p.index };
      }
      if (it.type === 'grila') {
        const g = grile.find((x) => String(x.id) === String(it.grilaId).trim());
        return { type: 'grila', index: g.index };
      }
      if (it.type === 'simulation') return { type: 'simulation', slug: String(it.slug).trim() };
      return { type: 'text', body: String(it.body).trim() };
    });
    const due = dueDate ? new Date(dueDate) : null;
    setAssignmentSaving(true);
    try {
      if (draft.id) {
        await updateAssignment(classId, draft.id, {
          title: title.trim(),
          items: cleanItems,
          dueDate: due,
        });
      } else {
        await createAssignment(classId, userId, {
          title: title.trim(),
          items: cleanItems,
          dueDate: due,
        });
      }
      setDraft(null);
      await onSaved();
    } catch (e) {
      console.error(e);
      alert(t(`${TA}.saveFailed`, 'Nu s-a putut salva tema.'));
    } finally {
      setAssignmentSaving(false);
    }
  };

  return (
    <div className="teacher-assignment-inline">
      <div className="teacher-assignment-inline-head">
        <h3 className="teacher-assignment-inline-title">
          {draft.id ? t(`${TA}.editTitle`, 'Editează tema') : t(`${TA}.newTitle`, 'Temă nouă')}
        </h3>
        <button
          type="button"
          className="teacher-assignment-inline-close"
          onClick={() => setDraft(null)}
          aria-label={t(`${TA}.closeAria`, 'Închide')}
        >
          <X size={20} />
        </button>
      </div>

      <div className="teacher-assignment-inline-grid">
        <label className="teacher-dashboard-block-label">
          {t(`${TA}.titleLabel`, 'Titlu')}
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        </label>
        <label className="teacher-dashboard-block-label">
          {t(`${TA}.dueLabel`, 'Termen limită (opțional)')}
          <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
      </div>

      <div className="teacher-assignment-inline-section">
        <span className="teacher-assignment-inline-label">{t(`${TA}.contentLabel`, 'Conținut temă')}</span>
        <div className="teacher-dashboard-add-buttons teacher-assignment-add-row">
          <button type="button" className="teacher-dashboard-btn small" onClick={() => addItem('problem')}>
            {t(`${TA}.addProblem`, '+ Problemă')}
          </button>
          <button type="button" className="teacher-dashboard-btn small" onClick={() => addItem('grila')}>
            {t(`${TA}.addGrila`, '+ Grilă')}
          </button>
          <button type="button" className="teacher-dashboard-btn small" onClick={() => addItem('simulation')}>
            {t(`${TA}.addSimulation`, '+ Simulare')}
          </button>
          <button type="button" className="teacher-dashboard-btn small" onClick={() => addItem('text')}>
            {t(`${TA}.addText`, '+ Text')}
          </button>
        </div>
      </div>

      <div className="teacher-dashboard-items teacher-assignment-items-scroll">
        {items.length === 0 && (
          <p className="teacher-dashboard-muted">{t(`${TA}.emptyBlocks`, 'Adaugă blocuri cu butoanele de mai sus.')}</p>
        )}
        {items.map((it, index) => (
          <div key={`${index}-${it.type}`} className="teacher-dashboard-item-block">
            <div className="teacher-dashboard-item-block-head">
              <GripVertical size={18} className="muted" />
              <span className="teacher-dashboard-item-type">{it.type}</span>
              <button type="button" className="teacher-dashboard-icon-btn" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                ↑
              </button>
              <button
                type="button"
                className="teacher-dashboard-icon-btn"
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
              >
                ↓
              </button>
              <button type="button" className="teacher-dashboard-icon-btn" onClick={() => removeItem(index)}>
                <Trash2 size={18} />
              </button>
            </div>
            {it.type === 'problem' && (
              <label>
                {t(`${TA}.problem`, 'Problemă')}
                <select value={it.problemId} onChange={(e) => patchItem(index, { problemId: e.target.value })}>
                  <option value="">{t(`${TA}.choose`, '— alege —')}</option>
                  {sortedProblems.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.titlu?.slice(0, 80) || p.id}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {it.type === 'grila' && (
              <label>
                {t(`${TA}.grila`, 'Grilă')}
                <select value={it.grilaId} onChange={(e) => patchItem(index, { grilaId: e.target.value })}>
                  <option value="">{t(`${TA}.choose`, '— alege —')}</option>
                  {grile.map((g) => (
                    <option key={g.id} value={g.id}>
                      {(g.intrebare || '').slice(0, 80) || g.id}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {it.type === 'simulation' && (
              <label>
                {t(`${TA}.simulation`, 'Simulare')}
                <select value={it.slug} onChange={(e) => patchItem(index, { slug: e.target.value })}>
                  {simulationsConfig.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {it.type === 'text' && (
              <label>
                {t(`${TA}.text`, 'Text')}
                <textarea value={it.body} onChange={(e) => patchItem(index, { body: e.target.value })} rows={4} />
              </label>
            )}
          </div>
        ))}
      </div>

      <div className="teacher-assignment-inline-actions">
        <button type="button" className="teacher-dashboard-btn" onClick={() => setDraft(null)}>
          {t(`${TA}.discard`, 'Renunță')}
        </button>
        <button type="button" className="teacher-dashboard-btn primary" onClick={handleSave} disabled={assignmentSaving}>
          {assignmentSaving ? t(`${TA}.saving`, 'Se salvează...') : t(`${TA}.save`, 'Salvează tema')}
        </button>
      </div>
    </div>
  );
}

export default TeacherClassPage;
