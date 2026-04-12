import React from 'react';
import { Link } from 'react-router-dom';
import { BookCheck, TrendingUp, Flame, Award } from 'lucide-react';

function getRelativeTime(date) {
  if (!date) return '';
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'acum';
  if (minutes < 60) return `acum ${minutes} min`;
  if (hours < 24) return `acum ${hours}h`;
  if (days < 7) return `acum ${days}z`;
  return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
}

function getActivityIcon(type) {
  switch (type) {
    case 'solved_problem': return BookCheck;
    case 'rank_up': return TrendingUp;
    case 'streak_milestone': return Flame;
    case 'badge_earned': return Award;
    default: return BookCheck;
  }
}

function getActivityColor(type) {
  switch (type) {
    case 'solved_problem': return '#3b82f6';
    case 'rank_up': return '#ffd700';
    case 'streak_milestone': return '#ef4444';
    case 'badge_earned': return '#8b5cf6';
    default: return '#888';
  }
}

function getActivityText(activity) {
  const { type, data, userAlias } = activity;
  const name = userAlias || 'Cineva';

  switch (type) {
    case 'solved_problem':
      return (
        <>
          <strong>{name}</strong> a rezolvat{' '}
          <em>{data?.problemTitle || 'o problemă'}</em>
          {data?.xpGained ? ` (+${data.xpGained} XP)` : ''}
        </>
      );
    case 'rank_up':
      return (
        <>
          <strong>{name}</strong> a avansat la rangul{' '}
          <em>{data?.newRank?.charAt(0).toUpperCase() + data?.newRank?.slice(1)}</em>
        </>
      );
    case 'streak_milestone':
      return (
        <>
          <strong>{name}</strong> are un streak de{' '}
          <em>{data?.streakDays} zile</em> consecutive!
        </>
      );
    case 'badge_earned':
      return (
        <>
          <strong>{name}</strong> a deblocat badge-ul{' '}
          <em>{data?.badgeName}</em>
        </>
      );
    default:
      return <><strong>{name}</strong> a făcut ceva.</>;
  }
}

const ActivityFeed = ({ activities = [], loading = false, showAvatar = true }) => {
  if (loading) {
    return (
      <div className="activity-feed activity-feed--loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Se încarcă activitatea...</p>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="activity-feed activity-feed--empty">
        <p>Nicio activitate recentă. Rezolvă probleme pentru a apărea aici!</p>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {activities.map((activity) => {
        const Icon = getActivityIcon(activity.type);
        const color = getActivityColor(activity.type);

        return (
          <div key={activity.id} className="activity-feed__item">
            {showAvatar && (
              <Link to={`/profil/${activity.userAlias}`} className="activity-feed__avatar-link">
                {activity.userAvatar ? (
                  <img
                    src={activity.userAvatar}
                    alt={activity.userAlias}
                    className="activity-feed__avatar"
                    {...(activity.userAvatar.includes('googleusercontent.com') && { crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' })}
                  />
                ) : (
                  <div className="activity-feed__avatar activity-feed__avatar--placeholder">
                    {(activity.userAlias || '?')[0].toUpperCase()}
                  </div>
                )}
              </Link>
            )}
            <div className="activity-feed__content">
              <div className="activity-feed__icon" style={{ color }}>
                <Icon size={16} />
              </div>
              <p className="activity-feed__text">
                {getActivityText(activity)}
              </p>
              <span className="activity-feed__time">
                {getRelativeTime(activity.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;
