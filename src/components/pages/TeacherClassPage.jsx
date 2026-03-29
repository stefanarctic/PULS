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
        setLoadError('Clasa nu există sau nu ai permisiune.');
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
      setLoadError('Eroare la încărcare.');
    } finally {
      setLoading(false);
    }
  }, [classId, user?.uid]);

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
      navigate('/');
      return;
    }
    if (user?.uid) loadAll();
  }, [authLoading, isApprovedTeacher, user?.uid, loadAll, navigate]);

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
      alert('Nu s-a putut salva.');
    } finally {
      setSavingMeta(false);
    }
  };

  const handleRemoveMember = async (studentUid) => {
    if (!window.confirm('Elimini acest elev din clasă?')) return;
    try {
      await removeMember(classId, studentUid);
      await loadAll();
    } catch (err) {
      console.error(err);
      alert('Eroare.');
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Ștergi această temă?')) return;
    try {
      await deleteAssignment(classId, assignmentId);
      await loadAll();
    } catch (err) {
      console.error(err);
      alert('Eroare.');
    }
  };

  const handleDeleteClass = async () => {
    if (
      !window.confirm(
        'Ștergi definitiv această clasă? Toate temele și înscrierile vor fi eliminate. Acțiunea nu poate fi anulată.'
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await deleteClassCascade(classId);
      navigate('/profesor');
    } catch (err) {
      console.error(err);
      alert('Eroare la ștergerea clasei.');
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
      alert('Nu s-a putut aproba cererea.');
    }
  };

  const handleRejectJoin = async (studentUid) => {
    if (!window.confirm('Respingi această cerere de intrare?')) return;
    try {
      await rejectJoinRequest(classId, studentUid);
      await loadAll();
    } catch (err) {
      console.error(err);
      alert('Nu s-a putut respinge cererea.');
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="teacher-dashboard-loading">
          <div className="spinner" />
          <p>Se încarcă...</p>
        </div>
      </Layout>
    );
  }

  if (!isApprovedTeacher || loadError || !classData) {
    return (
      <Layout>
        <div className="teacher-dashboard-error-screen">
          <p>{loadError || 'Acces interzis.'}</p>
          <Link to="/profesor">Înapoi la panou profesor</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="teacher-dashboard">
        <div className="teacher-dashboard-inner">
          <Link to="/profesor" className="teacher-dashboard-back">
            <ArrowLeft size={18} />
            Toate clasele
          </Link>

          <header className="teacher-dashboard-header">
            <h1 className="teacher-dashboard-title">{classData.name}</h1>
            <div className="teacher-dashboard-code teacher-dashboard-code--with-copy">
              <span className="teacher-dashboard-code-label">Cod intrare elevi (ID clasă):</span>
              <span className="teacher-dashboard-code-value">
                <code className="teacher-dashboard-code-id">{classId}</code>
                <span className="teacher-dashboard-code-actions">
                  <button
                    type="button"
                    className="teacher-dashboard-copy-btn"
                    onClick={handleCopyClassCode}
                    aria-label="Copiază codul clasei în clipboard"
                    title="Copiază codul clasei (ID pentru intrare)"
                  >
                    <Copy size={18} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    className="teacher-dashboard-copy-btn"
                    onClick={handleShareInviteLink}
                    aria-label="Copiază linkul de invitație în clasă"
                    title="Link invitație (elevii trimit cerere)"
                  >
                    <Share2 size={18} strokeWidth={2} />
                  </button>
                </span>
                {(codeCopied || linkCopied) && (
                  <span className="teacher-dashboard-code-copied">
                    {codeCopied
                      ? 'Codul clasei a fost copiat în clipboard.'
                      : 'Linkul de invitație a fost copiat în clipboard.'}
                  </span>
                )}
              </span>
            </div>
          </header>

          <section className="teacher-dashboard-card">
            <h2>Detalii clasă</h2>
            <form onSubmit={saveMeta} className="teacher-dashboard-form">
              <label>
                Nume
                <input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={120} />
              </label>
              <label>
                Descriere
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} maxLength={500} />
              </label>
              <button type="submit" className="teacher-dashboard-btn primary" disabled={savingMeta}>
                {savingMeta ? 'Salvează...' : 'Salvează detaliile'}
              </button>
            </form>
            <div className="teacher-dashboard-danger-zone">
              <button
                type="button"
                className="teacher-dashboard-btn danger"
                onClick={handleDeleteClass}
                disabled={deleting}
              >
                {deleting ? 'Se șterge...' : 'Șterge clasă'}
              </button>
            </div>
          </section>

          <section className="teacher-dashboard-card">
            <h2>
              <UserPlus size={22} /> Cereri de intrare ({joinRequests.length})
            </h2>
            {joinRequests.length === 0 ? (
              <p className="teacher-dashboard-muted">Nicio cerere în așteptare.</p>
            ) : (
              <ul className="teacher-dashboard-join-request-list">
                {joinRequests.map((r) => {
                  const ts = r.requestedAt?.toDate
                    ? r.requestedAt.toDate()
                    : r.requestedAt?.seconds
                      ? new Date(r.requestedAt.seconds * 1000)
                      : null;
                  const when = ts
                    ? ts.toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short' })
                    : '';
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
                          Aprobă
                        </button>
                        <button
                          type="button"
                          className="teacher-dashboard-btn danger small"
                          onClick={() => handleRejectJoin(r.studentUid)}
                        >
                          Respinge
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
              <Users size={22} /> Elevi ({members.length})
            </h2>
            {members.length === 0 ? (
              <p className="teacher-dashboard-muted">Niciun elev încă. Distribuie codul sau linkul de mai sus.</p>
            ) : (
              <ul className="teacher-dashboard-member-list">
                {members.map((m) => (
                  <li key={m.id}>
                    <span>{m.studentName || m.id}</span>
                    <button
                      type="button"
                      className="teacher-dashboard-icon-btn"
                      onClick={() => handleRemoveMember(m.id)}
                      title="Elimină din clasă"
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
                <ClipboardList size={22} /> Teme
              </h2>
              <button
                type="button"
                className="teacher-dashboard-btn primary"
                onClick={openNewAssignment}
                disabled={!!assignmentDraft}
              >
                <Plus size={18} />
                Temă nouă
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
                />
              </div>
            )}

            {assignments.length === 0 && !assignmentDraft ? (
              <p className="teacher-dashboard-muted">Nicio temă încă.</p>
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
                              {' '}
                              · Termen: {a.dueDate.toDate().toLocaleString('ro-RO')}
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
                            Editează
                          </button>
                          <button
                            type="button"
                            className="teacher-dashboard-link-btn danger"
                            onClick={() => handleDeleteAssignment(a.id)}
                            disabled={!!assignmentDraft}
                          >
                            Șterge
                          </button>
                        </div>
                      </div>
                      {members.length > 0 && (
                        <div className="teacher-hw-progress">
                          <p className="teacher-hw-progress-title">Progres elevi</p>
                          <ul className="teacher-hw-progress-list">
                            {members.map((m) => {
                              const sub = subsMap[m.studentUid];
                              const st = studentAssignmentDueStatus({
                                dueDate: a.dueDate,
                                submission: sub,
                                itemCount,
                              });
                              const avg =
                                sub?.allDone && sub.averageScore10 != null
                                  ? `Medie: ${sub.averageScore10}/10`
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
}) {
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
        if (!pid) return 'Alege o problemă.';
        const p = sortedProblems.find((x) => String(x.id) === pid);
        if (!p || typeof p.index !== 'number') return 'Problemă invalidă (lipsește indexul în date).';
      }
      if (it.type === 'grila') {
        const gid = String(it.grilaId || '').trim();
        if (!gid) return 'Alege o grilă.';
        const g = grile.find((x) => String(x.id) === gid);
        if (!g || typeof g.index !== 'number') return 'Grilă invalidă (lipsește indexul în date).';
      }
      if (it.type === 'simulation' && !String(it.slug || '').trim()) return 'Alege o simulare.';
      if (it.type === 'text' && !String(it.body || '').trim()) return 'Textul nu poate fi gol.';
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
      alert('Introdu titlul temei.');
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
      alert('Nu s-a putut salva tema.');
    } finally {
      setAssignmentSaving(false);
    }
  };

  return (
    <div className="teacher-assignment-inline">
      <div className="teacher-assignment-inline-head">
        <h3 className="teacher-assignment-inline-title">{draft.id ? 'Editează tema' : 'Temă nouă'}</h3>
        <button type="button" className="teacher-assignment-inline-close" onClick={() => setDraft(null)} aria-label="Închide">
          <X size={20} />
        </button>
      </div>

      <div className="teacher-assignment-inline-grid">
        <label className="teacher-dashboard-block-label">
          Titlu
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
        </label>
        <label className="teacher-dashboard-block-label">
          Termen limită (opțional)
          <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
      </div>

      <div className="teacher-assignment-inline-section">
        <span className="teacher-assignment-inline-label">Conținut temă</span>
        <div className="teacher-dashboard-add-buttons teacher-assignment-add-row">
          <button type="button" className="teacher-dashboard-btn small" onClick={() => addItem('problem')}>
            + Problemă
          </button>
          <button type="button" className="teacher-dashboard-btn small" onClick={() => addItem('grila')}>
            + Grilă
          </button>
          <button type="button" className="teacher-dashboard-btn small" onClick={() => addItem('simulation')}>
            + Simulare
          </button>
          <button type="button" className="teacher-dashboard-btn small" onClick={() => addItem('text')}>
            + Text
          </button>
        </div>
      </div>

      <div className="teacher-dashboard-items teacher-assignment-items-scroll">
        {items.length === 0 && <p className="teacher-dashboard-muted">Adaugă blocuri cu butoanele de mai sus.</p>}
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
                Problemă
                <select value={it.problemId} onChange={(e) => patchItem(index, { problemId: e.target.value })}>
                  <option value="">— alege —</option>
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
                Grilă
                <select value={it.grilaId} onChange={(e) => patchItem(index, { grilaId: e.target.value })}>
                  <option value="">— alege —</option>
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
                Simulare
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
                Text
                <textarea value={it.body} onChange={(e) => patchItem(index, { body: e.target.value })} rows={4} />
              </label>
            )}
          </div>
        ))}
      </div>

      <div className="teacher-assignment-inline-actions">
        <button type="button" className="teacher-dashboard-btn" onClick={() => setDraft(null)}>
          Renunță
        </button>
        <button type="button" className="teacher-dashboard-btn primary" onClick={handleSave} disabled={assignmentSaving}>
          {assignmentSaving ? 'Se salvează...' : 'Salvează tema'}
        </button>
      </div>
    </div>
  );
}

export default TeacherClassPage;
