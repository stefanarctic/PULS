import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, ClipboardList } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './Buttondet';
import { normalizeAnalyzeResponse } from '../lib/analyzeApiContract';
import { groqEvaluate } from '../lib/groqEvaluate';
import { auth } from '../lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { recordAssignmentItemProgress, score10FromObtainedMax } from '../lib/assignmentProgress';
import { translateClassOrAssignmentError } from '../i18n/classErrors';
import { useI18n } from '../i18n/LanguageContext';
import EvaluationResultsPanel from './EvaluationResultsPanel';
import '../scss/components/_problem-submit.scss';
import '../scss/components/_homework-text-modal.scss';

const fileToDataUri = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function formatAttemptDate(ts, lang) {
  if (!ts?.toDate) return '';
  try {
    const loc = lang === 'en' ? 'en-GB' : 'ro-RO';
    return ts.toDate().toLocaleString(loc);
  } catch {
    return '';
  }
}

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.teacherText
 * @param {string} props.classId
 * @param {string} props.assignmentId
 * @param {number} props.itemIndex
 * @param {object|null|undefined} props.itemSubmission — items[itemIndex] din submission Firestore
 * @param {() => void} [props.onSaved]
 */
const HomeworkTextSubmitModal = ({
  open,
  onClose,
  teacherText,
  classId,
  assignmentId,
  itemIndex,
  itemSubmission,
  onSaved,
}) => {
  const { t, lang } = useI18n();
  const HM = 'classes.homeworkModal';
  const [solutionText, setSolutionText] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const fileRef = useRef(null);

  const normalized = useMemo(() => {
    if (!apiResponse) return null;
    return normalizeAnalyzeResponse(/** @type {Record<string, unknown>} */ (apiResponse));
  }, [apiResponse]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setSolutionText('');
      setImages([]);
      setError(null);
      setApiResponse(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [open, assignmentId, itemIndex]);

  if (!open) return null;

  const attempts = Array.isArray(itemSubmission?.attempts)
    ? [...itemSubmission.attempts].sort((a, b) => {
        const ta = a.gradedAt?.toMillis?.() ?? 0;
        const tb = b.gradedAt?.toMillis?.() ?? 0;
        return tb - ta;
      })
    : [];

  const bestScore =
    Number.isFinite(itemSubmission?.score10) && itemSubmission.score10 != null
      ? itemSubmission.score10
      : null;

  const handleFiles = async (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const next = [];
    for (const f of files) {
      const previewUrl = await fileToDataUri(f);
      next.push({ file: f, previewUrl });
    }
    setImages((prev) => [...prev, ...next]);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImg = (i) => setImages((prev) => prev.filter((_, j) => j !== i));

  const triggerFileInput = () => fileRef.current?.click();

  const handleSubmit = async () => {
    if (!solutionText.trim() && images.length === 0) {
      setError(t(`${HM}.errorNeedContent`, 'Scrie soluția sau încarcă imagini.'));
      return;
    }
    if (!auth.currentUser) {
      setError(t(`${HM}.errorSignIn`, 'Autentifică-te.'));
      return;
    }
    setLoading(true);
    setError(null);
    setApiResponse(null);
    try {
      const problemText =
        t(`${HM}.evalPrompt`, 'Cerință (profesor):\n\n{task}\n\nEvaluează rezolvarea elevului la această cerință și acordă o notă de la 0 la 10.', {
          task: teacherText,
        });
      const result = await groqEvaluate({
        problemText,
        solutionText: solutionText.trim() || undefined,
        solutionPhotoDataUris: images.length ? images.map((x) => x.previewUrl) : undefined,
      });
      setApiResponse(result);

      const n = normalizeAnalyzeResponse(/** @type {Record<string, unknown>} */ (result));
      const score10 = n.ratingScore
        ? score10FromObtainedMax(n.ratingScore.obtained, n.ratingScore.max)
        : null;
      if (score10 === null || !Number.isFinite(score10)) {
        throw new Error(t(`${HM}.errorReadScore`, 'Nu s-a putut citi nota din răspunsul evaluatorului. Încearcă din nou.'));
      }

      const solutionPreview = (solutionText.trim() || t(`${HM}.imagesOnly`, '(doar imagini)')).slice(0, 600);
      await recordAssignmentItemProgress({
        classId,
        assignmentId,
        studentUid: auth.currentUser.uid,
        itemIndex,
        itemType: 'text',
        patch: {
          done: true,
          score10,
          gradedAt: Timestamp.now(),
          attemptLog: {
            score10,
            gradedAt: Timestamp.now(),
            solutionPreview,
            imageCount: images.length,
            ratingDisplay: n.ratingDisplay || '',
          },
        },
      });

      onSaved?.();
      setSolutionText('');
      setImages([]);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) {
      console.error(e);
      const raw = e instanceof Error ? e.message : '';
      setError(translateClassOrAssignmentError(raw, t) || raw || t(`${HM}.errorGeneric`, 'Eroare'));
      setApiResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setApiResponse(null);
    setError(null);
  };

  return (
    <div
      className="homework-text-modal-overlay homework-text-modal-overlay--eval"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hw-text-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="homework-text-modal homework-text-modal--eval" onClick={(e) => e.stopPropagation()}>
        <div className="homework-text-modal-head homework-text-modal-head--eval">
          <div>
            <h2 id="hw-text-title">{t(`${HM}.title`, 'Evaluator temă')}</h2>
            <p className="homework-text-modal-lead">
              {t(
                `${HM}.lead`,
                'Nota la temă folosește cel mai mare scor din toate încercările.'
              )}
            </p>
          </div>
          <button type="button" className="homework-text-modal-close" onClick={onClose} aria-label={t(`${HM}.closeAria`, 'Închide')}>
            <X size={22} />
          </button>
        </div>

        <div className="homework-text-modal-scroll">
          {bestScore != null && Number.isFinite(bestScore) ? (
            <div className="homework-text-modal-best-score" role="status">
              <span className="homework-text-modal-best-label">{t(`${HM}.bestLabel`, 'Cel mai bun scor (temă)')}</span>
              <span className="homework-text-modal-best-value">
                {bestScore} <span className="homework-text-modal-best-denom">/10</span>
              </span>
            </div>
          ) : null}

          {attempts.length > 0 ? (
            <section className="homework-text-modal-attempts" aria-label={t(`${HM}.attemptsSection`, 'Încercările tale anterioare')}>
              <h3 className="homework-text-modal-section-title">
                <ClipboardList size={18} aria-hidden /> {t(`${HM}.attemptsTitle`, 'Soluțiile tale (încercări)')}
              </h3>
              <ul className="homework-text-modal-attempt-list">
                {attempts.map((att, i) => (
                  <li key={i} className="homework-text-modal-attempt-card">
                    <div className="homework-text-modal-attempt-top">
                      <span className="homework-text-modal-attempt-score">
                        {Number.isFinite(att.score10) ? `${att.score10} / 10` : '—'}
                      </span>
                      <time className="homework-text-modal-attempt-time" dateTime={att.gradedAt?.toDate?.()?.toISOString?.()}>
                        {formatAttemptDate(att.gradedAt, lang)}
                      </time>
                    </div>
                    {att.ratingDisplay ? (
                      <div className="homework-text-modal-attempt-rating">
                        <MarkdownInline text={att.ratingDisplay} />
                      </div>
                    ) : null}
                    {att.solutionPreview ? (
                      <p className="homework-text-modal-attempt-preview">{att.solutionPreview}</p>
                    ) : null}
                    {att.imageCount > 0 ? (
                      <p className="homework-text-modal-attempt-meta">
                        {att.imageCount}{' '}
                        {att.imageCount === 1
                          ? t(`${HM}.imageOne`, 'imagine')
                          : t(`${HM}.imageOther`, 'imagini')}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="homework-text-modal-enunt homework-text-modal-enunt--eval">
            <strong>{t(`${HM}.requirement`, 'Cerință')}</strong>
            <div className="homework-text-modal-enunt-body homework-text-modal-enunt-body--tall">{teacherText}</div>
          </section>

          <div className="problema-detaliata-submit-card homework-modal-submit-shell">
            <div className="card-content">
              <div className="problem-submit">
                <div
                  className={`homework-eval-form-wrap ${apiResponse ? 'homework-eval-form-wrap--collapsed' : ''}`}
                >
                  <Card className="problem-submit-card homework-eval-card">
                    <CardHeader className="problem-submit-card-header">
                      <CardTitle className="problem-submit-card-title">
                        {t(`${HM}.solutionTitle`, 'Soluția ta')}
                        {images.length > 0 ? (
                          <Badge className="problem-submit-badge">
                            {images.length}{' '}
                            {images.length === 1
                              ? t(`${HM}.imageOne`, 'imagine')
                              : t(`${HM}.imageOther`, 'imagini')}
                          </Badge>
                        ) : null}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="problem-submit-card-content">
                      <div className="problem-submit-form-group">
                        <label className="problem-submit-label">{t(`${HM}.solutionTextLabel`, 'Text soluție')}</label>
                        <textarea
                          className="problem-submit-textarea"
                          placeholder={t(`${HM}.solutionPlaceholder`, 'Scrie soluția ta aici...')}
                          value={solutionText}
                          onChange={(e) => setSolutionText(e.target.value)}
                          rows={6}
                        />
                      </div>
                      <div className="problem-submit-divider">
                        <span className="problem-submit-divider-text">{t(`${HM}.or`, 'sau')}</span>
                      </div>
                      <div>
                        <label className="problem-submit-label">{t(`${HM}.imagesOptional`, 'Imagini (opțional)')}</label>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFiles}
                          className="problem-submit-file-input"
                        />
                        <Button type="button" onClick={triggerFileInput} className="problem-submit-upload-btn">
                          {t(`${HM}.addImages`, 'Adaugă imagini')}
                        </Button>
                        {images.length > 0 ? (
                          <div className="problem-submit-images-grid">
                            {images.map((img, index) => (
                              <div key={index} className="problem-submit-image-preview">
                                <img src={img.previewUrl} alt="" className="problem-submit-image" />
                                <Button
                                  type="button"
                                  onClick={() => removeImg(index)}
                                  className="problem-submit-remove-image-btn"
                                >
                                  {t(`${HM}.removeImage`, 'elimină')}
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="problem-submit-empty-state">{t(`${HM}.noImages`, 'Nicio imagine încărcată')}</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {error ? (
                    <div className="problem-submit-error">
                      <strong>{t(`${HM}.errorPrefix`, 'Eroare:')}</strong> {error}
                    </div>
                  ) : null}

                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="problem-submit-submit-btn homework-eval-submit"
                  >
                    {loading ? t(`${HM}.analyzing`, 'Se analizează soluția…') : t(`${HM}.analyze`, 'Analizează soluția')}
                  </Button>

                  {loading ? (
                    <div className="problem-submit-loading">
                      <p>{t(`${HM}.analyzingWait`, 'Se analizează soluția…')}</p>
                    </div>
                  ) : null}
                </div>

                {normalized ? (
                  <EvaluationResultsPanel normalized={normalized} onNewAnalysis={handleNewAnalysis} />
                ) : null}
              </div>
            </div>
          </div>

        </div>

        <div className="homework-text-modal-footer-actions">
          <button type="button" className="homework-text-modal-btn homework-text-modal-btn--secondary" onClick={onClose}>
            {t(`${HM}.footerClose`, 'Închide')}
          </button>
        </div>
      </div>
    </div>
  );
};

/** Randare ușoară markdown one-liner pentru ratingDisplay salvat */
function MarkdownInline({ text }) {
  const txt = String(text || '').trim();
  if (!txt) return null;
  if (txt.length > 280) {
    return <span className="homework-text-modal-md-inline">{txt.slice(0, 280)}…</span>;
  }
  return <span className="homework-text-modal-md-inline">{txt}</span>;
}

export default HomeworkTextSubmitModal;
