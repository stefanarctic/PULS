import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './Buttondet';
import {
    Trophy,
    FileText,
    ListChecks,
    ClipboardList,
    Lightbulb,
    BookOpen,
    Table2,
    Sigma,
    ScanEye,
    Target,
} from 'lucide-react';
import { useSolvedProblems } from '../hooks/useSolvedProblems';
import {
    normalizeAnalyzeResponse,
    DEFAULT_MAX_SCORE,
} from '../lib/analyzeApiContract';
import { groqEvaluate } from '../lib/groqEvaluate';
import { auth } from '../lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { recordAssignmentItemProgress, score10FromObtainedMax } from '../lib/assignmentProgress';
import '../scss/components/_problem-submit.scss';
import MathJaxMarkdownBlock from './MathJaxMarkdownBlock';

// Funcție pentru conversie File → Data URI
const fileToDataUri = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/** @param {{ rows: Array<{ label: string, value: string, unit?: string }>, caption: string }} props */
const AnalyzeDataTable = ({ rows, caption }) => {
    if (!rows?.length) return null;
    const showUnit = rows.some((r) => r.unit);
    return (
        <div className="problem-analysis-data-table-wrap" role="region" aria-label={caption}>
            <table className="problem-analysis-data-table">
                <caption className="problem-analysis-data-caption">{caption}</caption>
                <thead>
                    <tr>
                        <th scope="col">Mărime</th>
                        <th scope="col">Valoare</th>
                        {showUnit ? <th scope="col">Unitate</th> : null}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={`${row.label}-${i}`}>
                            <td><MathJaxMarkdownBlock content={row.label} mathJaxify /></td>
                            <td><MathJaxMarkdownBlock content={row.value} mathJaxify /></td>
                            {showUnit ? <td><MathJaxMarkdownBlock content={row.unit || '—'} mathJaxify /></td> : null}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ProblemSubmit = ({
    problem = null,
    defaultProblemId = null,
    defaultProblemTitle = null,
    assignmentContext = null,
}) => {
    const [solutionText, setSolutionText] = useState('');
    const [solutionImageFiles, setSolutionImageFiles] = useState([]);
    const solutionImageInputRef = useRef(null);

    const [apiResponse, setApiResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { saveSolvedProblem } = useSolvedProblems();

    const normalized = useMemo(() => {
        if (!apiResponse) return null;
        return normalizeAnalyzeResponse(/** @type {Record<string, unknown>} */ (apiResponse));
    }, [apiResponse]);

    const getProblemTextFromProps = () => {
        if (!problem) return '';

        let text = '';

        if (problem.titlu) {
            text += `${problem.titlu}\n\n`;
        }

        if (problem.continut) {
            text += problem.continut;
        }

        if (problem.formule && problem.formule.length > 0) {
            text += `\n\nFormule:\n${problem.formule.join('\n')}`;
        }

        if (problem.date && Object.keys(problem.date).length > 0) {
            text += `\n\nDate:\n${Object.entries(problem.date)
                .map(([key, value]) => `${key} = ${value}`)
                .join('\n')}`;
        }

        if (problem.subpuncte && problem.subpuncte.length > 0) {
            text += `\n\nCerințe:\n${problem.subpuncte
                .map((sub, idx) => `${sub.id || idx + 1}. ${sub.cerinta}`)
                .join('\n')}`;
        }

        return text.trim();
    };

    const handleSolutionImagesChange = async (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newImageFiles = [];
            try {
                for (const file of files) {
                    const previewUrl = await fileToDataUri(file);
                    newImageFiles.push({ file, previewUrl });
                }
                setSolutionImageFiles((prev) => [...prev, ...newImageFiles]);
                setError(null);
            } catch (err) {
                console.error('Error reading solution files:', err);
                setError('A apărut o eroare la citirea imaginilor soluției.');
            }
            if (solutionImageInputRef.current) solutionImageInputRef.current.value = '';
        }
    };

    const removeSolutionImage = (index) => {
        setSolutionImageFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const triggerFileInput = (ref) => ref.current?.click();

    const handleSubmit = async () => {
        if (!problem || !getProblemTextFromProps()) {
            setError('Problema este preluată automat din pagină. Te rugăm să accesezi problema din listă.');
            return;
        }

        if (!solutionText.trim() && solutionImageFiles.length === 0) {
            setError('Te rog introdu textul soluției SAU încarcă cel puțin o imagine cu rezolvarea.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setApiResponse(null);

        try {
            const finalProblemText = getProblemTextFromProps();

            const solutionPhotoDataUris =
                solutionImageFiles.length > 0 ? solutionImageFiles.map((img) => img.previewUrl) : undefined;

            const result = await groqEvaluate({
                problemText: finalProblemText,
                problem,
                solutionText: solutionText.trim() || undefined,
                solutionPhotoDataUris,
            });

            setApiResponse(result);
            console.log('Analiza a fost primită.', result);

            if (problem) {
                try {
                    const generatedProblemId =
                        (problem?.index || problem?.id || defaultProblemId) !== null &&
                        (problem?.index || problem?.id || defaultProblemId) !== undefined
                            ? String(problem?.index || problem?.id || defaultProblemId)
                            : `submitted_${Date.now()}`;

                    let problemTitle = problem?.titlu || defaultProblemTitle || 'Problema trimisă';
                    const problemIndex = problem?.index;
                    if (
                        problemIndex !== null &&
                        problemIndex !== undefined &&
                        !generatedProblemId.startsWith('submitted_')
                    ) {
                        if (!problemTitle.match(/^PROBLEMA\s*#\d+/i)) {
                            problemTitle = `PROBLEMA #${problemIndex}: ${problemTitle}`;
                        }
                    }

                    const n = normalizeAnalyzeResponse(/** @type {Record<string, unknown>} */ (result));
                    const scoreObtained = n.ratingScore?.obtained ?? 0;
                    const maxScore = n.ratingScore?.max ?? DEFAULT_MAX_SCORE;

                    const score10 = n.ratingScore
                        ? score10FromObtainedMax(n.ratingScore.obtained, n.ratingScore.max)
                        : null;

                    if (
                        assignmentContext &&
                        auth.currentUser &&
                        score10 !== null &&
                        Number.isFinite(score10)
                    ) {
                        try {
                            await recordAssignmentItemProgress({
                                classId: assignmentContext.classId,
                                assignmentId: assignmentContext.assignmentId,
                                studentUid: auth.currentUser.uid,
                                itemIndex: assignmentContext.itemIndex,
                                itemType: 'problem',
                                patch: {
                                    done: true,
                                    score10,
                                    gradedAt: Timestamp.now(),
                                },
                            });
                        } catch (hwErr) {
                            console.error('Temă: nu s-a putut salva progresul.', hwErr);
                        }
                    }

                    if (scoreObtained > 0) {
                        await saveSolvedProblem(generatedProblemId, scoreObtained, maxScore, problemTitle);
                        console.log('Problema rezolvată salvată automat în profil!');
                    }
                } catch (saveErr) {
                    console.error('Eroare la salvarea automată a problemei:', saveErr);
                }
            }
        } catch (err) {
            console.error('Error calling API:', err);
            const message =
                err instanceof Error ? err.message : 'A apărut o eroare necunoscută la apelarea API-ului.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    const hasSummaries =
        normalized && (normalized.problemSummary || normalized.feedbackSummary);
    const hasDataBlock = normalized && (normalized.givenData || normalized.numericalResults);

    return (
        <div className="problem-submit">
            <div className={`problem-submit-form-container ${apiResponse ? 'problem-submit-form-collapsed' : ''}`}>
                <div className="problem-submit-form-column">
                    <Card className="problem-submit-card">
                        <CardHeader className="problem-submit-card-header">
                            <CardTitle className="problem-submit-card-title">
                                🔧 Soluție
                                {solutionImageFiles.length > 0 && (
                                    <Badge className="problem-submit-badge">
                                        {solutionImageFiles.length}{' '}
                                        {solutionImageFiles.length === 1 ? 'imagine' : 'imagini'}
                                    </Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="problem-submit-card-content">
                            <div className="problem-submit-form-group">
                                <label className="problem-submit-label">Text Soluție:</label>
                                <textarea
                                    className="problem-submit-textarea"
                                    placeholder="Scrie soluția ta aici..."
                                    value={solutionText}
                                    onChange={(e) => setSolutionText(e.target.value)}
                                />
                            </div>

                            <div className="problem-submit-divider">
                                <span className="problem-submit-divider-text">SAU</span>
                            </div>

                            <div>
                                <label className="problem-submit-label">Imagini Soluție:</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    ref={solutionImageInputRef}
                                    onChange={handleSolutionImagesChange}
                                    className="problem-submit-file-input"
                                />
                                <Button
                                    type="button"
                                    onClick={() => triggerFileInput(solutionImageInputRef)}
                                    className="problem-submit-upload-btn"
                                >
                                    ➕ Adaugă Imagini Soluție
                                </Button>
                                {solutionImageFiles.length > 0 ? (
                                    <div className="problem-submit-images-grid">
                                        {solutionImageFiles.map((img, index) => (
                                            <div key={index} className="problem-submit-image-preview">
                                                <img
                                                    src={img.previewUrl}
                                                    alt={`Soluție ${index + 1}`}
                                                    className="problem-submit-image"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => removeSolutionImage(index)}
                                                    className="problem-submit-remove-image-btn"
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="problem-submit-empty-state">
                                        📷 Nicio imagine cu soluția încărcată
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {error && (
                    <div className="problem-submit-error">
                        <strong>⚠️ Eroare:</strong> {error}
                    </div>
                )}

                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="problem-submit-submit-btn"
                >
                    {isLoading ? '⏳ Se analizează soluția…' : '🚀 Analizează Soluția'}
                </Button>

                {isLoading && (
                    <div className="problem-submit-loading">
                        <p>⏳ Se analizează soluția…</p>
                    </div>
                )}
            </div>

            {apiResponse && normalized && (
                <div className="problem-submit-results">
                    {normalized.ratingDisplay && (
                        <div className="problem-analysis-rating-section">
                            <h3 className="problem-analysis-rating-title">
                                <Trophy className="problem-analysis-icon" aria-hidden />
                                Punctaj obținut
                            </h3>
                            <div className="problem-analysis-rating-content">
                                <div className="problem-analysis-rating-text">
                                    <MathJaxMarkdownBlock content={normalized.ratingDisplay} />
                                </div>
                            </div>
                        </div>
                    )}

                    {hasSummaries && (
                        <div className="problem-analysis-summaries-grid">
                            {normalized.problemSummary && (
                                <div className="problem-analysis-summary-section">
                                    <h3 className="problem-analysis-summary-title">
                                        <FileText className="problem-analysis-icon" aria-hidden />
                                        Rezumat problemă
                                    </h3>
                                    <div className="problem-analysis-summary-content">
                                        <MathJaxMarkdownBlock content={normalized.problemSummary} />
                                    </div>
                                </div>
                            )}
                            {normalized.feedbackSummary && (
                                <div className="problem-analysis-summary-section">
                                    <h3 className="problem-analysis-summary-title">
                                        <ListChecks className="problem-analysis-icon" aria-hidden />
                                        Rezumat feedback
                                    </h3>
                                    <div className="problem-analysis-summary-content">
                                        <MathJaxMarkdownBlock content={normalized.feedbackSummary} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {normalized.studentWorkReflection && (
                        <div className="problem-analysis-reflection-section">
                            <h3 className="problem-analysis-reflection-title">
                                <ScanEye className="problem-analysis-icon" aria-hidden />
                                Ce am înțeles din soluția ta
                            </h3>
                            <div className="problem-analysis-reflection-content">
                                <MathJaxMarkdownBlock content={normalized.studentWorkReflection} />
                            </div>
                        </div>
                    )}

                    {hasDataBlock && (
                        <div className="problem-analysis-data-section">
                            <h3 className="problem-analysis-data-section-title">
                                <Table2 className="problem-analysis-icon" aria-hidden />
                                Date și rezultate numerice
                            </h3>
                            {normalized.givenData && (
                                <AnalyzeDataTable rows={normalized.givenData} caption="Date din enunț" />
                            )}
                            {normalized.numericalResults && (
                                <AnalyzeDataTable
                                    rows={normalized.numericalResults}
                                    caption="Rezultate / mărimi cerute"
                                />
                            )}
                        </div>
                    )}

                    {normalized.formulasUsed?.length > 0 && (
                        <div className="problem-analysis-formulas-section">
                            <h3 className="problem-analysis-formulas-title">
                                <Sigma className="problem-analysis-icon" aria-hidden />
                                Formule folosite
                            </h3>
                            <ul className="problem-analysis-formulas-list">
                                {normalized.formulasUsed.map((f, i) => (
                                    <li key={i} className="problem-analysis-formula-item">
                                        <MathJaxMarkdownBlock content={f} mathJaxify />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {normalized.explanation && (
                        <div className="problem-analysis-explanation-section">
                            <h3 className="problem-analysis-explanation-title">
                                <BookOpen className="problem-analysis-icon" aria-hidden />
                                Explicație
                            </h3>
                            <div className="problem-analysis-explanation-content">
                                <MathJaxMarkdownBlock content={normalized.explanation} />
                            </div>
                        </div>
                    )}

                    {normalized.correctSolution && (
                        <div className="problem-analysis-solution-section">
                            <h3 className="problem-analysis-solution-title">
                                <ClipboardList className="problem-analysis-icon" aria-hidden />
                                Pașii rezolvării
                            </h3>
                            <div className="problem-analysis-solution-content">
                                <MathJaxMarkdownBlock content={normalized.correctSolution} />
                            </div>
                        </div>
                    )}

                    {normalized.errorAnalysis && (
                        <div className="problem-analysis-errors-section" style={{display: 'none'}}>
                            <h3 className="problem-analysis-errors-title">
                                <Lightbulb className="problem-analysis-icon" aria-hidden />
                                Analiza erorilor și îmbunătățiri
                            </h3>
                            <div className="problem-analysis-errors-content">
                                <MathJaxMarkdownBlock content={normalized.errorAnalysis} />
                            </div>
                        </div>
                    )}

                    {normalized.finalAnswer && (
                        <div className="problem-analysis-final-section">
                            <h3 className="problem-analysis-final-title">
                                <Target className="problem-analysis-icon" aria-hidden />
                                Răspuns final
                            </h3>
                            <div className="problem-analysis-final-content">
                                <MathJaxMarkdownBlock content={normalized.finalAnswer} />
                            </div>
                        </div>
                    )}

                    <Button
                        type="button"
                        onClick={() => {
                            setApiResponse(null);
                            setError(null);
                        }}
                        className="problem-submit-submit-btn"
                        style={{ marginTop: '2rem' }}
                    >
                        🔄 Analiză nouă
                    </Button>
                </div>
            )}

            {!apiResponse && !isLoading && (
                <div className="problem-submit-placeholder">
                    <div className="problem-submit-placeholder-icon">📊</div>
                    <h3 className="problem-submit-placeholder-title">Rezultatele vor apărea aici</h3>
                    <p>Completează formularul și trimite pentru a vedea analiza</p>
                </div>
            )}
        </div>
    );
};

export default ProblemSubmit;
