import React from 'react';
import {
  Trophy,
  FileText,
  ListChecks,
  Lightbulb,
  BookOpen,
  Table2,
  Sigma,
  ScanEye,
  ClipboardList,
  Target,
} from 'lucide-react';
import { Button } from './Buttondet';
import MathJaxMarkdownBlock from './MathJaxMarkdownBlock';

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
              <td>
                <MathJaxMarkdownBlock content={row.label} mathJaxify />
              </td>
              <td>
                <MathJaxMarkdownBlock content={row.value} mathJaxify />
              </td>
              {showUnit ? (
                <td>
                  <MathJaxMarkdownBlock content={row.unit || '—'} mathJaxify />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Rezultate evaluare (același layout ca la pagina de probleme).
 * @param {object} props
 * @param {object|null} props.normalized — rezultat normalizeAnalyzeResponse
 * @param {() => void} [props.onNewAnalysis]
 * @param {string} [props.className]
 */
export default function EvaluationResultsPanel({ normalized, onNewAnalysis, className = '' }) {
  if (!normalized) return null;

  const hasSummaries = !!(normalized.problemSummary || normalized.feedbackSummary);
  const hasDataBlock = !!(normalized.givenData || normalized.numericalResults);

  return (
    <div className={`problem-submit-results ${className}`.trim()}>
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
          {normalized.givenData && <AnalyzeDataTable rows={normalized.givenData} caption="Date din enunț" />}
          {normalized.numericalResults && (
            <AnalyzeDataTable rows={normalized.numericalResults} caption="Rezultate / mărimi cerute" />
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
        <div className="problem-analysis-errors-section" style={{ display: 'none' }}>
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

      {onNewAnalysis ? (
        <Button type="button" onClick={onNewAnalysis} className="problem-submit-submit-btn" style={{ marginTop: '2rem' }}>
          Analiză nouă
        </Button>
      ) : null}
    </div>
  );
}
