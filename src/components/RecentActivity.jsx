import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/LanguageContext';
import { formatProblemTitlePrefix } from '../lib/problemTitleDisplay';

const RA = 'recentActivity';

const RecentActivity = ({ activityLog = [] }) => {
  const navigate = useNavigate();
  const { t, lang, localizedPath } = useI18n();
  const dateLocale = lang === 'en' ? 'en-US' : 'ro-RO';

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
    const fb = {
      problem_solved: 'Rezolvată',
      problem_added: 'Adăugată',
      simulation_visited: 'Simulare accesată',
      resource_accessed: 'Resursă accesată',
      achievement_earned: 'Realizare obținută',
    };
    const key = `${RA}.types.${type || 'default'}`;
    return t(key, fb[type] || t(`${RA}.types.default`, 'Activitate'));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return t(`${RA}.relativeTime.today`, 'Azi');
    if (diffDays === 2) return t(`${RA}.relativeTime.yesterday`, 'Ieri');
    if (diffDays <= 7) {
      return t(`${RA}.relativeTime.daysAgo`, '{count} zile în urmă', { count: diffDays - 1 });
    }

    return date.toLocaleDateString(dateLocale, {
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

      let scoreColor = '#ef4444';
      if (percentage >= 80) scoreColor = '#10b981';
      else if (percentage >= 60) scoreColor = '#f59e0b';

      return (
        <div className="score-display" style={{ color: scoreColor }}>
          <span className="score-text">{scoreObtained}/{maxScore}</span>
          <span className="score-percentage">({percentage}%)</span>
        </div>
      );
    }
    return null;
  };

  const extractProblemId = (title) => {
    if (!title) return null;
    const match = title.match(/#(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  const handleActivityClick = (activity) => {
    const problemId = extractProblemId(activity.title);
    if (problemId !== null) {
      navigate(localizedPath(`/probleme/${problemId}`));
    }
  };

  return (
    <div className="recent-activity">
      <h3>{t(`${RA}.title`, 'Probleme recent rezolvate')}</h3>
      {activityLog.length === 0 ? (
        <div className="empty-activity">
          <div className="empty-icon">📝</div>
          <p>{t(`${RA}.emptyLine1`, 'Nu ai rezolvat încă nicio problemă.')}</p>
          <p>{t(`${RA}.emptyLine2`, 'Începe să rezolvi probleme pentru a vedea progresul tău aici!')}</p>
        </div>
      ) : (
        <div className="activity-list">
          {activityLog.map((activity, index) => (
            <div
              key={`${activity.type}-${activity.date}-${index}`}
              className="activity-item"
              onClick={() => handleActivityClick(activity)}
              style={{ cursor: 'pointer' }}
            >
              <div className="activity-icon">
                {getActivityIcon(activity.type)}
              </div>
              <div className="activity-content">
                <div className="activity-title">
                  {formatProblemTitlePrefix(activity.title, t)}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
