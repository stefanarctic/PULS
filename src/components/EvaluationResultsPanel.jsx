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
import { useI18n } from '../i18n/LanguageContext';

/** @param {{ rows: Array<{ label: string, value: string, unit?: string }>, caption: string, quantityLabel?: string, valueLabel?: string, unitLabel?: string }} props */
const AnalyzeDataTable = ({ rows, caption, quantityLabel, valueLabel, unitLabel }) => {
  if (!rows?.length) return null;
  const showUnit = rows.some((r) => r.unit);
  return (
    <div className="problem-analysis-data-table-wrap" role="region" aria-label={caption}>
      <table className="problem-analysis-data-table">
        <caption className="problem-analysis-data-caption">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">{quantityLabel}</th>
            <th scope="col">{valueLabel}</th>
            {showUnit ? <th scope="col">{unitLabel}</th> : null}
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
  const { t } = useI18n();
  const ER = 'evaluationResults';

  if (!normalized) return null;

  const hasSummaries = !!(normalized.problemSummary || normalized.feedbackSummary);
  const hasDataBlock = !!(normalized.givenData || normalized.numericalResults);

  const qty = t(`${ER}.quantity`, 'Mărime');
  const val = t(`${ER}.value`, 'Valoare');
  const unit = t(`${ER}.unit`, 'Unitate');

  return (
    <div className={`problem-submit-results ${className}`.trim()}>
      {normalized.ratingDisplay && (
        <div className="problem-analysis-rating-section">
          <h3 className="problem-analysis-rating-title">
            <Trophy className="problem-analysis-icon" aria-hidden />
            {t(`${ER}.scoreTitle`, 'Punctaj obținut')}
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
                {t(`${ER}.problemSummary`, 'Rezumat problemă')}
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
                {t(`${ER}.feedbackSummary`, 'Rezumat feedback')}
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
            {t(`${ER}.reflection`, 'Ce am înțeles din soluția ta')}
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
            {t(`${ER}.dataTitle`, 'Date și rezultate numerice')}
          </h3>
          {normalized.givenData && (
            <AnalyzeDataTable
              rows={normalized.givenData}
              caption={t(`${ER}.captionGiven`, 'Date din enunț')}
              quantityLabel={qty}
              valueLabel={val}
              unitLabel={unit}
            />
          )}
          {normalized.numericalResults && (
            <AnalyzeDataTable
              rows={normalized.numericalResults}
              caption={t(`${ER}.captionResults`, 'Rezultate / mărimi cerute')}
              quantityLabel={qty}
              valueLabel={val}
              unitLabel={unit}
            />
          )}
        </div>
      )}

      {normalized.formulasUsed?.length > 0 && (
        <div className="problem-analysis-formulas-section">
          <h3 className="problem-analysis-formulas-title">
            <Sigma className="problem-analysis-icon" aria-hidden />
            {t(`${ER}.formulasUsed`, 'Formule folosite')}
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
            {t(`${ER}.explanation`, 'Explicație')}
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
            {t(`${ER}.solutionSteps`, 'Pașii rezolvării')}
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
            {t(`${ER}.errorAnalysis`, 'Analiza erorilor și îmbunătățiri')}
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
            {t(`${ER}.finalAnswer`, 'Răspuns final')}
          </h3>
          <div className="problem-analysis-final-content">
            <MathJaxMarkdownBlock content={normalized.finalAnswer} />
          </div>
        </div>
      )}

      {onNewAnalysis ? (
        <Button type="button" onClick={onNewAnalysis} className="problem-submit-submit-btn" style={{ marginTop: '2rem' }}>
          {t(`${ER}.newAnalysis`, 'Analiză nouă')}
        </Button>
      ) : null}
    </div>
  );
}
