import React from 'react';

const RecentActivity = ({ activityLog = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'problem_solved': return '🏅';
      case 'problem_added': return '✏️';
      case 'simulation_visited': return '🧪';
      default: return '📝';
    }
  };

  const getActivityTypeText = (type) => {
    switch (type) {
      case 'problem_solved': return 'Rezolvată';
      case 'problem_added': return 'Adăugată';
      case 'simulation_visited': return 'Simulare accesată';
      default: return 'Activitate';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="recent-activity">
      <h3>Activitate recentă</h3>
      {activityLog.length === 0 ? (
        <div className="empty-activity">
          <p>Nu există activitate recentă.</p>
        </div>
      ) : (
        <div className="activity-list">
          {activityLog.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-icon">
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-content">
                <div className="activity-title">
                  {getActivityTypeText(activity.type)}: {activity.title}
                </div>
                {activity.date && (
                  <div className="activity-date">
                    {formatDate(activity.date)}
                  </div>
                )}
              </div>
              {activity.link && (
                <a href={activity.link} className="activity-link">
                  →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity; 