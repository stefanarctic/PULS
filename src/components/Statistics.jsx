import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28CFE", "#FF6699"];

function getPieData(data) {
  if (!data || data.length === 0) return [];
  if (data.length === 1) {
    // Forțează un pie complet cu o singură felie
    return [{ ...data[0], value: 1 }];
  }
  return data;
}

const Statistics = ({ statistics = {} }) => {
  const dificultateData = statistics.dificultate ? Object.entries(statistics.dificultate).map(([name, value]) => ({ name, value })) : [];
  const categorieData = statistics.categorie ? Object.entries(statistics.categorie).map(([name, value]) => ({ name, value })) : [];
  
  const solvedProblems = statistics.solvedProblems || 0;
  const totalScore = statistics.totalScore || 0;
  const maxPossibleScore = statistics.maxPossibleScore || 0;
  const averageScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
  
  return (
    <div>
      <h3>Statistici generale</h3>
      
      {/* Statistici pentru probleme rezolvate */}
      <div style={{ marginBottom: '2rem' }}>
        <h4>Probleme rezolvate</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '1rem' 
        }}>
          <div style={{
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {solvedProblems}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
              Probleme rezolvate
            </div>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {totalScore}/{maxPossibleScore}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
              Scor total
            </div>
          </div>
          
          <div style={{
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e9ecef',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {averageScore}%
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
              Scor mediu
            </div>
          </div>
        </div>
      </div>

      {/* Statistici pentru probleme adăugate */}
      <div style={{ marginBottom: '2rem' }}>
        <h4>Probleme adăugate</h4>
        <div style={{display: 'flex', gap: 32, flexWrap: 'wrap'}}>
          <div style={{flex: 1, minWidth: 250}}>
            <h5>Pe dificultate</h5>
            {dificultateData.length === 0 ? (
              <div>Nu există statistici pe dificultate.</div>
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
            <h5>Pe categorie</h5>
            {categorieData.length === 0 ? (
              <div>Nu există statistici pe categorie.</div>
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

      {/* Mesaj când nu există statistici */}
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
          <p>Nu există încă statistici disponibile.</p>
          <p>Începe să rezolvi probleme și să adaugi probleme noi pentru a vedea statisticile tale!</p>
        </div>
      )}
    </div>
  );
};

export default Statistics; 