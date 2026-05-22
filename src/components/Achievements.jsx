import React from "react";
import { useI18n } from "../i18n/LanguageContext";
import { translateMilestone } from "../lib/achievementI18n";

const AP = "achievementsPanel";

const Achievements = ({ achievements = [] }) => {
  const { t } = useI18n();

  const typeHeading = (type) => {
    const fb = {
      problem_solved: 'Rezolvată',
      problem_added: 'Adăugată',
      simulation_visited: 'Simulare accesată',
    };
    const key = `${AP}.types.${type || 'default'}`;
    return t(key, fb[type] || t(`${AP}.types.simulation_visited`, 'Simulare accesată'));
  };

  return (
    <div className="achievements">
      <h3>{t(`${AP}.title`, 'Realizări')}</h3>
      <ul style={{listStyle: 'none', padding: 0}}>
        {achievements.length === 0 && (
          <li>{t(`${AP}.empty`, 'Nu există realizări încă.')}</li>
        )}
        {achievements.map((ach, idx) => {
          if (ach.type === 'milestone') {
            const { title, description } = translateMilestone(ach, t);
            const icon = ach.icon || '🏆';
            return (
              <li key={ach.key || ach.title || idx} style={{marginBottom: '1em', display: 'flex', alignItems: 'center'}}>
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
                }}>{icon}</span>
                <div>
                  <strong>{title}</strong>
                  <div>{description}</div>
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
                <strong>{typeHeading(ach.type)}: {ach.title}</strong>
                {ach.date && <div><small>{ach.date}</small></div>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Achievements;