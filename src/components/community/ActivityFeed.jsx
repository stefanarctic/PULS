import React from 'react';
import { Link } from 'react-router-dom';
import { BookCheck, TrendingUp, Flame, Award, ChevronRight } from 'lucide-react';

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

/** Cale către pagina problemei; null pentru rezolvări custom fără rută. */
function getProblemPathForActivity(activity) {
  if (activity.type !== 'solved_problem') return null;
  const raw = activity.data?.problemId;
  if (raw != null && raw !== '') {
    const s = String(raw);
    if (s.startsWith('submitted_')) return null;
    return `/probleme/${encodeURIComponent(s)}`;
  }
  const title = activity.data?.problemTitle || '';
  const m = title.match(/#(\d+)/);
  if (m) return `/probleme/${m[1]}`;
  return null;
}

/**
 * @param {{ problemTitleInline?: boolean }} opts - dacă true, titlul problemei e text simplu (cardul e Link)
 */
function renderActivityBody(activity, opts = {}) {
  const { problemTitleInline = false } = opts;
  const { type, data, userAlias } = activity;
  const name = userAlias || 'Cineva';
  const titleText = data?.problemTitle || 'o problemă';

  switch (type) {
    case 'solved_problem':
      return (
        <>
          <span className="activity-feed__actor">{name}</span>
          <span className="activity-feed__verb"> a rezolvat </span>
          {problemTitleInline ? (
            <span className="activity-feed__problem-title-inline">{titleText}</span>
          ) : (
            <span className="activity-feed__problem-title--plain">{titleText}</span>
          )}
          {data?.xpGained ? (
            <span className="activity-feed__xp"> (+{data.xpGained} XP)</span>
          ) : null}
        </>
      );
    case 'rank_up':
      return (
        <>
          <span className="activity-feed__actor">{name}</span>
          <span className="activity-feed__verb"> a avansat la rangul </span>
          <span className="activity-feed__highlight">
            {data?.newRank?.charAt(0).toUpperCase() + data?.newRank?.slice(1)}
          </span>
        </>
      );
    case 'streak_milestone':
      return (
        <>
          <span className="activity-feed__actor">{name}</span>
          <span className="activity-feed__verb"> are un streak de </span>
          <span className="activity-feed__highlight">{data?.streakDays} zile</span>
          <span className="activity-feed__verb"> consecutive!</span>
        </>
      );
    case 'badge_earned':
      return (
        <>
          <span className="activity-feed__actor">{name}</span>
          <span className="activity-feed__verb"> a deblocat badge-ul </span>
          <span className="activity-feed__highlight">{data?.badgeName}</span>
        </>
      );
    default:
      return (
        <>
          <span className="activity-feed__actor">{name}</span>
          <span className="activity-feed__verb"> a făcut o acțiune pe platformă.</span>
        </>
      );
  }
}

function ActivityFeed({ activities = [], loading = false, showAvatar = true }) {
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
    <div className="activity-feed activity-feed--cards">
      {activities.map((activity) => {
        const Icon = getActivityIcon(activity.type);
        const problemPath = getProblemPathForActivity(activity);
        const isProblemCard = Boolean(problemPath);
        const cardClass =
          `activity-feed__card${showAvatar ? '' : ' activity-feed__card--no-avatar'}${isProblemCard ? '' : ' activity-feed__card--static'}`;

        const profilePath =
          activity.userId
            ? `/profil/${activity.userId}`
            : activity.userAlias
              ? `/profil/${encodeURIComponent(activity.userAlias)}`
              : null;

        const avatarNonProblem = (
          <>
            {activity.userAvatar ? (
              <img
                src={activity.userAvatar}
                alt={activity.userAlias || ''}
                className="activity-feed__avatar"
                {...(activity.userAvatar.includes('googleusercontent.com') && { crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' })}
              />
            ) : (
              <div className="activity-feed__avatar activity-feed__avatar--placeholder">
                {(activity.userAlias || '?')[0].toUpperCase()}
              </div>
            )}
          </>
        );

        const inner = (
          <>
            {showAvatar &&
              (isProblemCard ? (
                <span className="activity-feed__avatar-link activity-feed__cell-avatar">
                  {activity.userAvatar ? (
                    <img
                      src={activity.userAvatar}
                      alt=""
                      className="activity-feed__avatar"
                      {...(activity.userAvatar.includes('googleusercontent.com') && { crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' })}
                    />
                  ) : (
                    <div className="activity-feed__avatar activity-feed__avatar--placeholder">
                      {(activity.userAlias || '?')[0].toUpperCase()}
                    </div>
                  )}
                </span>
              ) : profilePath ? (
                <Link to={profilePath} className="activity-feed__avatar-link activity-feed__cell-avatar">
                  {avatarNonProblem}
                </Link>
              ) : (
                <span className="activity-feed__avatar-link activity-feed__cell-avatar">{avatarNonProblem}</span>
              ))}
            <div className="activity-feed__icon-wrap activity-feed__cell-icon">
              <Icon size={18} strokeWidth={2.25} />
            </div>
            <div className="activity-feed__main activity-feed__cell-main">
              <p className="activity-feed__text">
                {renderActivityBody(activity, { problemTitleInline: isProblemCard })}
              </p>
            </div>
            <time
              className="activity-feed__time activity-feed__cell-time"
              dateTime={activity.createdAt instanceof Date ? activity.createdAt.toISOString() : undefined}
            >
              {getRelativeTime(activity.createdAt)}
            </time>
            {isProblemCard ? (
              <span className="activity-feed__card-arrow activity-feed__cell-arrow" aria-hidden>
                <ChevronRight size={22} strokeWidth={2} />
              </span>
            ) : null}
          </>
        );

        if (isProblemCard) {
          const label = `Deschide problema: ${activity.data?.problemTitle || 'problemă'}`;
          return (
            <Link key={activity.id} to={problemPath} className={cardClass} aria-label={label}>
              {inner}
            </Link>
          );
        }

        return (
          <div key={activity.id} className={cardClass}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export default ActivityFeed;
