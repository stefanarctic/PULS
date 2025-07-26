import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
  return (
    <div>
      <h3>Statistici - probleme adaugate</h3>
      <div style={{display: 'flex', gap: 32, flexWrap: 'wrap'}}>
        <div style={{flex: 1, minWidth: 250}}>
          <h4>Pe dificultate</h4>
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
          <h4>Pe categorie</h4>
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
  );
};

export default Statistics; 