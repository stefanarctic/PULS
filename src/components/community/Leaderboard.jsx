import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Flame } from 'lucide-react';
import RankBadge from './RankBadge';
import { useLeaderboard } from '../../hooks/useCommunity';
import { useI18n } from '../../i18n/LanguageContext';

const L = 'communityPage.leaderboard';

const Leaderboard = ({ currentUserUid }) => {
  const { t, localizedPath } = useI18n();
  const [timeFilter, setTimeFilter] = useState('all-time');
  const { entries, loading, error, refresh } = useLeaderboard(timeFilter);

  const currentUserEntry = currentUserUid
    ? entries.find(e => e.uid === currentUserUid)
    : null;
  const currentUserPosition = currentUserEntry?.position;

  return (
    <div className="leaderboard">
      <div className="leaderboard__header">
        <h2 className="leaderboard__title">
          <Trophy size={22} /> {t(`${L}.title`, 'Clasament')}
        </h2>
        <div className="leaderboard__filters">
          <button
            type="button"
            className={`leaderboard__filter-btn ${timeFilter === 'all-time' ? 'active' : ''}`}
            onClick={() => setTimeFilter('all-time')}
          >
            {t(`${L}.allTime`, 'All-time')}
          </button>
          <button
            type="button"
            className={`leaderboard__filter-btn ${timeFilter === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimeFilter('weekly')}
          >
            {t(`${L}.weekly`, 'Săptămânal')}
          </button>
        </div>
      </div>

      {currentUserPosition && (
        <div className="leaderboard__current-user-banner">
          <TrendingUp size={16} />
          <span>
            {t(`${L}.rankIntro`, 'Ești pe locul ')}
            <strong>#{currentUserPosition}</strong>
            {currentUserPosition > 1 && (
              <> {t(`${L}.rankClimb`, '— rezolvă probleme pentru a urca!')}</>
            )}
          </span>
        </div>
      )}

      {loading ? (
        <div className="leaderboard__loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{t(`${L}.loading`, 'Se încarcă clasamentul...')}</p>
          </div>
        </div>
      ) : error ? (
        <div className="leaderboard__error">
          <p>{t(`${L}.error`, 'Eroare la încărcarea clasamentului.')}</p>
          <button type="button" onClick={refresh}>{t(`${L}.retry`, 'Reîncearcă')}</button>
        </div>
      ) : entries.length === 0 ? (
        <div className="leaderboard__empty">
          <p>{t(`${L}.empty`, 'Niciun utilizator în clasament. Fii primul care rezolvă o problemă!')}</p>
        </div>
      ) : (
        <div className="leaderboard__table-wrapper">
          <table className="leaderboard__table">
            <thead>
              <tr>
                <th className="leaderboard__th--pos">{t(`${L}.columns.pos`, '#')}</th>
                <th className="leaderboard__th--user">{t(`${L}.columns.user`, 'Utilizator')}</th>
                <th className="leaderboard__th--rank">{t(`${L}.columns.rank`, 'Rank')}</th>
                <th className="leaderboard__th--xp">{t(`${L}.columns.xp`, 'XP')}</th>
                <th className="leaderboard__th--level">{t(`${L}.columns.level`, 'Nivel')}</th>
                <th className="leaderboard__th--solved">{t(`${L}.columns.solved`, 'Rezolvate')}</th>
                <th className="leaderboard__th--streak">{t(`${L}.columns.streak`, 'Streak')}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const isCurrentUser = entry.uid === currentUserUid;
                return (
                  <tr
                    key={entry.uid}
                    className={`leaderboard__row ${isCurrentUser ? 'leaderboard__row--current' : ''} ${entry.position <= 3 ? `leaderboard__row--top${entry.position}` : ''}`}
                  >
                    <td className="leaderboard__cell--pos">
                      {entry.position <= 3 ? (
                        <span className={`leaderboard__medal leaderboard__medal--${entry.position}`}>
                          {entry.position === 1 ? '🥇' : entry.position === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : (
                        entry.position
                      )}
                    </td>
                    <td className="leaderboard__cell--user">
                      <Link to={localizedPath(`/profil/${entry.uid}`)} className="leaderboard__user-link">
                        {entry.profilePic ? (
                          <img
                            src={entry.profilePic}
                            alt={entry.alias}
                            className="leaderboard__avatar"
                            {...(entry.profilePic.includes('googleusercontent.com') && { crossOrigin: 'anonymous', referrerPolicy: 'no-referrer' })}
                          />
                        ) : (
                          <div className="leaderboard__avatar leaderboard__avatar--placeholder">
                            {(entry.alias || '?')[0].toUpperCase()}
                          </div>
                        )}
                        <span className="leaderboard__alias">{entry.alias}</span>
                      </Link>
                    </td>
                    <td className="leaderboard__cell--rank">
                      <RankBadge rank={entry.rank} size="sm" showLabel={false} />
                    </td>
                    <td className="leaderboard__cell--xp">
                      {timeFilter === 'weekly'
                        ? (entry.weeklyXp || 0).toLocaleString()
                        : entry.xp.toLocaleString()}
                    </td>
                    <td className="leaderboard__cell--level">{entry.level}</td>
                    <td className="leaderboard__cell--solved">{entry.totalSolved}</td>
                    <td className="leaderboard__cell--streak">
                      {entry.streak > 0 && (
                        <span className="leaderboard__streak-badge">
                          <Flame size={14} /> {entry.streak}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
