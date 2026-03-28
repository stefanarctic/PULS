import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import {
  normalizeAnalyzeResponse,
  PULS_AI_ANALYZE_URL,
  DEFAULT_MAX_SCORE,
  extractRatingFromJson,
} from '../lib/analyzeApiContract';
import { transformAnalyzeResponseForMathJax } from '../lib/groqLatexMathjax';
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
      const payload = {
        problemText,
        solutionText: solutionText.trim() || undefined,
        solutionPhotoDataUris: images.length ? images.map((x) => x.previewUrl) : undefined,
      };
      const response = await fetch(PULS_AI_ANALYZE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = { error: await response.text() };
      }
      if (!response.ok) {
        throw new Error(result.error || `Eroare ${response.status}`);
      }
      const resultForUi = await transformAnalyzeResponseForMathJax(
        /** @type {Record<string, unknown>} */ (result),
      );
      const n = normalizeAnalyzeResponse(/** @type {Record<string, unknown>} */ (resultForUi));
      let scoreObtained = n.ratingScore?.obtained ?? 0;
      let maxScore = n.ratingScore?.max ?? DEFAULT_MAX_SCORE;
      let legacyStr = null;
      if (!n.ratingScore) {
        legacyStr =
          extractRatingFromJson(typeof resultForUi.solution === 'string' ? resultForUi.solution : '') ||
          extractRatingFromJson(
            typeof resultForUi.errorAnalysis === 'string' ? resultForUi.errorAnalysis : '',
          ) ||
          (typeof resultForUi.rating === 'string' && resultForUi.rating.trim()
            ? resultForUi.rating.trim()
            : null);
        if (legacyStr) {
          const m = legacyStr.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+)/);
          if (m) {
            scoreObtained = parseFloat(m[1]);
            maxScore = parseFloat(m[2]) || DEFAULT_MAX_SCORE;
          }
        }
      }
      let score10 = null;
      if (n.ratingScore) {
        score10 = score10FromObtainedMax(n.ratingScore.obtained, n.ratingScore.max);
      } else if (legacyStr && /(\d+(?:\.\d+)?)\s*\/\s*(\d+)/.test(legacyStr)) {
        score10 = score10FromObtainedMax(scoreObtained, maxScore);
      }
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
