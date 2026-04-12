import React from 'react';
import { getNextRankThreshold, getRankForXP, RANK_THRESHOLDS } from '../../lib/communityService';
import RankBadge from './RankBadge';

const XPBar = ({ xp = 0, level = 1, rank = 'bronze', compact = false }) => {
  const currentRankInfo = getRankForXP(xp);
  const nextRank = getNextRankThreshold(xp);

  const currentMin = currentRankInfo.minXp;
  const nextMin = nextRank ? nextRank.minXp : currentMin;
  const progress = nextRank
    ? Math.min(((xp - currentMin) / (nextMin - currentMin)) * 100, 100)
    : 100;

  return (
    <div className={`xp-bar ${compact ? 'xp-bar--compact' : ''}`}>
      <div className="xp-bar__header">
        <RankBadge rank={rank} size={compact ? 'sm' : 'md'} />
        <span className="xp-bar__level">Nivel {level}</span>
        <span className="xp-bar__xp-count">{xp.toLocaleString()} XP</span>
      </div>
      <div className="xp-bar__track">
        <div
          className={`xp-bar__fill xp-bar__fill--${rank}`}
          style={{ width: `${progress}%`, backgroundColor: currentRankInfo.color }}
        />
      </div>
      {!compact && nextRank && (
        <div className="xp-bar__footer">
          <span>{xp - currentMin} / {nextMin - currentMin} XP</span>
          <span>Următorul rank: {nextRank.rank.charAt(0).toUpperCase() + nextRank.rank.slice(1)}</span>
        </div>
      )}
    </div>
  );
};

export default XPBar;
