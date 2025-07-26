import React from "react";

const Achievements = ({ achievements = [] }) => (
  <div>
    <h3>Realizări</h3>
    <ul style={{listStyle: 'none', padding: 0}}>
      {achievements.length === 0 && <li>Nu există realizări încă.</li>}
      {achievements.map((ach, idx) => {
        if (ach.type === 'milestone') {
          return (
            <li key={idx} style={{marginBottom: '1em', display: 'flex', alignItems: 'center'}}>
              <span style={{
                fontSize: '2em',
                marginRight: '0.5em',
                background: ach.color,
                color: '#fff',
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>🏆</span>
              <div>
                <strong>{ach.title}</strong>
                <div>{ach.description}</div>
              </div>
            </li>
          );
        }
        let icon = '';
        if (ach.type === 'problem_solved') icon = '🏅';
        else if (ach.type === 'problem_added') icon = '✏️';
        else if (ach.type === 'simulation_visited') icon = '🧪';
        return (
          <li key={idx} style={{marginBottom: '1em', display: 'flex', alignItems: 'center'}}>
            <span style={{fontSize: '2em', marginRight: '0.5em'}}>{icon}</span>
            <div>
              <strong>{ach.type === 'problem_solved' ? 'Rezolvată' : ach.type === 'problem_added' ? 'Adăugată' : 'Simulare accesată'}: {ach.title}</strong>
              {ach.date && <div><small>{ach.date}</small></div>}
            </div>
          </li>
        );
      })}
    </ul>
  </div>
);

export default Achievements;