import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Flame } from 'lucide-react';
import RankBadge from './RankBadge';
import { useLeaderboard } from '../../hooks/useCommunity';

const Leaderboard = ({ currentUserUid }) => {
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
          <Trophy size={22} /> Clasament
        </h2>
        <div className="leaderboard__filters">
          <button
            className={`leaderboard__filter-btn ${timeFilter === 'all-time' ? 'active' : ''}`}
            onClick={() => setTimeFilter('all-time')}
          >
            All-time
          </button>
          <button
            className={`leaderboard__filter-btn ${timeFilter === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimeFilter('weekly')}
          >
            Săptămânal
          </button>
        </div>
      </div>

      {currentUserPosition && (
        <div className="leaderboard__current-user-banner">
          <TrendingUp size={16} />
          <span>
            Ești pe locul <strong>#{currentUserPosition}</strong>
            {currentUserPosition > 1 && (
              <> &mdash; rezolvă probleme pentru a urca!</>
            )}
          </span>
        </div>
      )}

      {loading ? (
        <div className="leaderboard__loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Se încarcă clasamentul...</p>
          </div>
        </div>
      ) : error ? (
        <div className="leaderboard__error">
          <p>Eroare la încărcarea clasamentului.</p>
          <button onClick={refresh}>Reîncearcă</button>
        </div>
      ) : entries.length === 0 ? (
        <div className="leaderboard__empty">
          <p>Niciun utilizator în clasament. Fii primul care rezolvă o problemă!</p>
        </div>
      ) : (
        <div className="leaderboard__table-wrapper">
          <table className="leaderboard__table">
            <thead>
              <tr>
                <th className="leaderboard__th--pos">#</th>
                <th className="leaderboard__th--user">Utilizator</th>
                <th className="leaderboard__th--rank">Rank</th>
                <th className="leaderboard__th--xp">XP</th>
                <th className="leaderboard__th--level">Nivel</th>
                <th className="leaderboard__th--solved">Rezolvate</th>
                <th className="leaderboard__th--streak">Streak</th>
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
                      <Link to={`/profil/${entry.alias}`} className="leaderboard__user-link">
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
