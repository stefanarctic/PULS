import React from "react";

const RecentActivity = ({ activityLog = [] }) => (
  <div>
    <h3 style={{paddingLeft: '2%'}}>Activitate recentă</h3>
    <ul>
      {activityLog.length === 0 && <li>Nu există activitate recentă.</li>}
      {activityLog.map((activity, idx) => (
        <li key={idx} style={{marginBottom: '1em'}}>
          <strong>{activity.type === 'problem_solved' ? 'Rezolvare problemă' : activity.type === 'problem_added' ? 'Problemă adăugată' : 'Simulare accesată'}:</strong> {activity.link ? (
            <a href={activity.link} onClick={e => { e.preventDefault(); window.location = activity.link; }}>{activity.title}</a>
          ) : activity.title} <br/>
          <small>{activity.date}</small>
        </li>
      ))}
    </ul>
  </div>
);

export default RecentActivity; 