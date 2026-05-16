import React from 'react';
import { Link } from 'react-router-dom';
import { BookCheck, TrendingUp, Flame, Award, ChevronRight } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';

import { formatProblemTitlePrefix } from '../../lib/problemTitleDisplay';

const AF = 'communityPage.activityFeed';

function ActivityFeed({ activities = [], loading = false, showAvatar = true }) {
  const { t, lang, localizedPath } = useI18n();

  const getRelativeTime = (dateInput) => {
    const toDate = (v) => {
      if (v == null) return null;
      if (v instanceof Date) return v;
      if (typeof v?.toDate === 'function') return v.toDate();
      return new Date(v);
    };
    const d = toDate(dateInput);
    if (!d || Number.isNaN(d.getTime())) return '';
    const now = new Date();
    const diff = now - d;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const dateLocale = lang === 'en' ? 'en-US' : 'ro-RO';

    if (seconds < 60) return t(`${AF}.time.justNow`, 'acum');
    if (minutes < 60) return t(`${AF}.time.minutesAgo`, 'acum {n} min', { n: minutes });
    if (hours < 24) return t(`${AF}.time.hoursAgo`, 'acum {n}h', { n: hours });
    if (days < 7) return t(`${AF}.time.daysAgo`, 'acum {n}z', { n: days });
    return d.toLocaleDateString(dateLocale, { day: 'numeric', month: 'short' });
  };

  const renderActivityBody = (activity, opts = {}) => {
    const { problemTitleInline = false } = opts;
    const { type, data, userAlias } = activity;
    const name = userAlias || t(`${AF}.someone`, 'Cineva');
    let titleText = data?.problemTitle || t(`${AF}.problemFallback`, 'o problemă');
    titleText = formatProblemTitlePrefix(titleText, t);

    switch (type) {
      case 'solved_problem':
        return (
          <>
            <span className="activity-feed__actor">{name}</span>
            <span className="activity-feed__verb">{t(`${AF}.verbs.solved`, ' a rezolvat ')}</span>
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
            <span className="activity-feed__verb">{t(`${AF}.verbs.rankUp`, ' a avansat la rangul ')}</span>
            <span className="activity-feed__highlight">
              {data?.newRank?.charAt(0).toUpperCase() + data?.newRank?.slice(1)}
            </span>
          </>
        );
      case 'streak_milestone': {
        const n = data?.streakDays;
        return (
          <>
            <span className="activity-feed__actor">{name}</span>
            <span className="activity-feed__verb">{t(`${AF}.streak.connector`, ' are un streak de ')}</span>
            <span className="activity-feed__highlight">
              {t(`${AF}.streak.duration`, '{n} zile consecutive!', { n })}
            </span>
          </>
        );
      }
      case 'badge_earned':
        return (
          <>
            <span className="activity-feed__actor">{name}</span>
            <span className="activity-feed__verb">{t(`${AF}.verbs.badge`, ' a deblocat badge-ul ')}</span>
            <span className="activity-feed__highlight">{data?.badgeName}</span>
          </>
        );
      default:
        return (
          <>
            <span className="activity-feed__actor">{name}</span>
            <span className="activity-feed__verb">{t(`${AF}.verbs.generic`, ' a făcut o acțiune pe platformă.')}</span>
          </>
        );
    }
  };

  if (loading) {
    return (
      <div className="activity-feed activity-feed--loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t(`${AF}.loading`, 'Se încarcă activitatea...')}</p>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="activity-feed activity-feed--empty">
        <p>{t(`${AF}.empty`, 'Nicio activitate recentă. Rezolvă probleme pentru a apărea aici!')}</p>
      </div>
    );
  }

  return (
    <div className="activity-feed activity-feed--cards">
      {activities.map((activity) => {
        const Icon = (() => {
          switch (activity.type) {
            case 'solved_problem': return BookCheck;
            case 'rank_up': return TrendingUp;
            case 'streak_milestone': return Flame;
            case 'badge_earned': return Award;
            default: return BookCheck;
          }
        })();
        const rawPath = (() => {
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
        })();
        const problemPath = rawPath ? localizedPath(rawPath) : null;
        const isProblemCard = Boolean(problemPath);
        const cardClass =
          `activity-feed__card${showAvatar ? '' : ' activity-feed__card--no-avatar'}${isProblemCard ? '' : ' activity-feed__card--static'}`;

        const rawProfilePath =
          activity.userId
            ? `/profil/${activity.userId}`
            : activity.userAlias
              ? `/profil/${encodeURIComponent(activity.userAlias)}`
              : null;
        const profilePath = rawProfilePath ? localizedPath(rawProfilePath) : null;

        const displayTitle = formatProblemTitlePrefix(activity.data?.problemTitle || '', t);
        const ariaTitle = displayTitle || t(`${AF}.problemFallback`, 'o problemă');

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
              dateTime={
                (() => {
                  const raw = activity.createdAt;
                  if (raw instanceof Date) return raw.toISOString();
                  if (raw && typeof raw.toDate === 'function') return raw.toDate().toISOString();
                  if (raw) return new Date(raw).toISOString();
                  return undefined;
                })()
              }
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
          const label = t(`${AF}.openProblemAria`, 'Deschide problema: {title}', { title: ariaTitle });
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
