import React from 'react';

const RecentActivity = ({ activityLog = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'problem_solved': return '🏅';
      case 'problem_added': return '✏️';
      case 'simulation_visited': return '🧪';
      case 'resource_accessed': return '📚';
      case 'achievement_earned': return '🏆';
      default: return '📝';
    }
  };

  const getActivityTypeText = (type) => {
    switch (type) {
      case 'problem_solved': return 'Rezolvată';
      case 'problem_added': return 'Adăugată';
      case 'simulation_visited': return 'Simulare accesată';
      case 'resource_accessed': return 'Resursă accesată';
      case 'achievement_earned': return 'Realizare obținută';
      default: return 'Activitate';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Azi';
    if (diffDays === 2) return 'Ieri';
    if (diffDays <= 7) return `${diffDays - 1} zile în urmă`;
    
    return date.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreDisplay = (activity) => {
    if (activity.type === 'problem_solved' && activity.score) {
      const { scoreObtained, maxScore } = activity.score;
      const percentage = Math.round((scoreObtained / maxScore) * 100);
      
      console.log('🎯 RecentActivity displaying score:', { scoreObtained, maxScore, percentage });
      
      let scoreColor = '#ef4444'; // roșu pentru scor mic
      if (percentage >= 80) scoreColor = '#10b981'; // verde pentru scor mare
      else if (percentage >= 60) scoreColor = '#f59e0b'; // galben pentru scor mediu
      
      return (
        <div className="score-display" style={{ color: scoreColor }}>
          <span className="score-text">{scoreObtained}/{maxScore}</span>
          <span className="score-percentage">({percentage}%)</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="recent-activity">
      <h3>Probleme recent rezolvate</h3>
      {activityLog.length === 0 ? (
        <div className="empty-activity">
          <div className="empty-icon">📝</div>
          <p>Nu ai rezolvat încă nicio problemă.</p>
          <p>Începe să rezolvi probleme pentru a vedea progresul tău aici!</p>
        </div>
      ) : (
        <div className="activity-list">
          {activityLog.map((activity, index) => (
            <div key={`${activity.type}-${activity.date}-${index}`} className="activity-item">
              <div className="activity-icon">
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-content">
                <div className="activity-title">
                  {activity.title}
                </div>
                <div className="activity-details">
                  <span className="activity-type">
                    {getActivityTypeText(activity.type)}
                  </span>
                  {activity.date && (
                    <span className="activity-date">
                      {formatDate(activity.date)}
                    </span>
                  )}
                </div>
                {getScoreDisplay(activity)}
              </div>
              {activity.link && (
                <a href={activity.link} className="activity-link" title="Vezi problema">
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