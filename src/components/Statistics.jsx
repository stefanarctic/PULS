import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useI18n } from "../i18n/LanguageContext";

const SP = "statisticsPanel";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFE", "#FF6699"];

function getPieData(data) {
  if (!data || data.length === 0) return [];
  if (data.length === 1) {
    return [{ ...data[0], value: 1 }];
  }
  return data;
}

const Statistics = ({ statistics = {} }) => {
  const { t } = useI18n();
  const dificultateData = statistics.dificultate ? Object.entries(statistics.dificultate).map(([name, value]) => ({ name, value })) : [];
  const categorieData = statistics.categorie ? Object.entries(statistics.categorie).map(([name, value]) => ({ name, value })) : [];

  const solvedProblems = statistics.solvedProblems || 0;
  const totalScore = statistics.totalScore || 0;
  const maxPossibleScore = statistics.maxPossibleScore || 0;
  const averageScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  return (
    <div className="statistics">
      <h3>{t(`${SP}.title`, 'Statistici generale')}</h3>

      <div style={{ marginBottom: '2rem' }}>
        <h4>{t(`${SP}.solvedHeading`, 'Probleme rezolvate')}</h4>
        <div className="stat-summary-grid">
          <div className="stat-value-card">
            <div className="stat-value-number">
              {solvedProblems}
            </div>
            <div className="stat-value-label">
              {t(`${SP}.labelSolvedCount`, 'Probleme rezolvate')}
            </div>
          </div>

          <div className="stat-value-card">
            <div className="stat-value-number">
              {totalScore}/{maxPossibleScore}
            </div>
            <div className="stat-value-label">
              {t(`${SP}.labelTotalScore`, 'Scor total')}
            </div>
          </div>

          <div className="stat-value-card">
            <div className="stat-value-number">
              {averageScore}%
            </div>
            <div className="stat-value-label">
              {t(`${SP}.labelAverageScore`, 'Scor mediu')}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4>{t(`${SP}.addedHeading`, 'Probleme adăugate')}</h4>
        <div style={{display: 'flex', gap: 32, flexWrap: 'wrap'}}>
          <div style={{flex: 1, minWidth: 250}}>
            <h5>{t(`${SP}.byDifficulty`, 'Pe dificultate')}</h5>
            {dificultateData.length === 0 ? (
              <div>{t(`${SP}.noDifficultyStats`, 'Nu există statistici pe dificultate.')}</div>
            ) : (
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={getPieData(dificultateData)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getPieData(dificultateData).map((entry, index) => (
                        <Cell key={`cell-diff-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div style={{flex: 1, minWidth: 250}}>
            <h5>{t(`${SP}.byCategory`, 'Pe categorie')}</h5>
            {categorieData.length === 0 ? (
              <div>{t(`${SP}.noCategoryStats`, 'Nu există statistici pe categorie.')}</div>
            ) : (
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={getPieData(categorieData)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getPieData(categorieData).map((entry, index) => (
                        <Cell key={`cell-cat-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {solvedProblems === 0 && dificultateData.length === 0 && categorieData.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: '#6c757d',
          background: '#f8f9fa',
          borderRadius: '0.5rem',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <p>{t(`${SP}.emptyStateLine1`, 'Nu există încă statistici disponibile.')}</p>
          <p>{t(`${SP}.emptyStateLine2`, 'Începe să rezolvi probleme și să adaugi probleme noi pentru a vedea statisticile tale!')}</p>
        </div>
      )}
    </div>
  );
};

export default Statistics;
