import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { normalizeAnalyzeResponse } from '../lib/analyzeApiContract';
import { groqEvaluate } from '../lib/groqEvaluate';
import { auth } from '../lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { recordAssignmentItemProgress, score10FromObtainedMax } from '../lib/assignmentProgress';

const fileToDataUri = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.teacherText
 * @param {string} props.classId
 * @param {string} props.assignmentId
 * @param {number} props.itemIndex
 * @param {() => void} [props.onSaved]
 */
const HomeworkTextSubmitModal = ({
  open,
  onClose,
  teacherText,
  classId,
  assignmentId,
  itemIndex,
  onSaved,
}) => {
  const [solutionText, setSolutionText] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  if (!open) return null;

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

  const handleSubmit = async () => {
    if (!solutionText.trim() && images.length === 0) {
      setError('Scrie rezolvarea sau încarcă imagini.');
      return;
    }
    if (!auth.currentUser) {
      setError('Autentifică-te.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const problemText =
        `Cerință (profesor):\n\n${teacherText}\n\n` +
        'Evaluează rezolvarea elevului la această cerință și acordă o notă de la 0 la 10.';
      const result = await groqEvaluate({
        problemText,
        solutionText: solutionText.trim() || undefined,
        solutionPhotoDataUris: images.length ? images.map((x) => x.previewUrl) : undefined,
      });
      const n = normalizeAnalyzeResponse(/** @type {Record<string, unknown>} */ (result));
      const score10 = n.ratingScore
        ? score10FromObtainedMax(n.ratingScore.obtained, n.ratingScore.max)
        : null;
      if (score10 === null || !Number.isFinite(score10)) {
        throw new Error('Nu s-a putut citi nota din răspunsul AI. Încearcă din nou.');
      }
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
        },
      });
      setSolutionText('');
      setImages([]);
      onSaved?.();
      onClose();
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Eroare');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homework-text-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="hw-text-title">
      <div className="homework-text-modal">
        <div className="homework-text-modal-head">
          <h2 id="hw-text-title">Rezolvare (trimis la asistentul AI)</h2>
          <button type="button" className="homework-text-modal-close" onClick={onClose} aria-label="Închide">
            <X size={22} />
          </button>
        </div>
        <div className="homework-text-modal-enunt">
          <strong>Cerință:</strong>
          <div className="homework-text-modal-enunt-body">{teacherText}</div>
        </div>
        <label className="homework-text-modal-label">
          Rezolvarea ta (text)
          <textarea
            value={solutionText}
            onChange={(e) => setSolutionText(e.target.value)}
            rows={5}
            placeholder="Scrie rezolvarea..."
          />
        </label>
        <label className="homework-text-modal-label">
          Imagini (opțional)
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} />
        </label>
        {images.length > 0 && (
          <div className="homework-text-modal-previews">
            {images.map((img, i) => (
              <div key={i} className="homework-text-modal-preview-row">
                <img src={img.previewUrl} alt="" className="homework-text-modal-thumb" />
                <button
                  type="button"
                  className="homework-text-modal-btn homework-text-modal-btn--link"
                  onClick={() => removeImg(i)}
                >
                  Elimină
                </button>
              </div>
            ))}
          </div>
        )}
        {error && <p className="homework-text-modal-error">{error}</p>}
        <div className="homework-text-modal-actions">
          <button
            type="button"
            className="homework-text-modal-btn homework-text-modal-btn--secondary"
            onClick={onClose}
            disabled={loading}
          >
            Anulează
          </button>
          <button
            type="button"
            className="homework-text-modal-btn homework-text-modal-btn--primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Se trimite…' : 'Trimite la AI'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeworkTextSubmitModal;
