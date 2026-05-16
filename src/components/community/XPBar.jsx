import React from 'react';
import { getNextRankThreshold, getRankForXP } from '../../lib/communityService';
import RankBadge from './RankBadge';
import { useI18n } from '../../i18n/LanguageContext';

const C = 'profilePage.community';

const XPBar = ({ xp = 0, level = 1, rank = 'bronze', compact = false }) => {
  const { t, lang } = useI18n();
  const numberLocale = lang === 'en' ? 'en-US' : 'ro-RO';

  const currentRankInfo = getRankForXP(xp);
  const nextRank = getNextRankThreshold(xp);

  const currentMin = currentRankInfo.minXp;
  const nextMin = nextRank ? nextRank.minXp : currentMin;
  const progress = nextRank
    ? Math.min(((xp - currentMin) / (nextMin - currentMin)) * 100, 100)
    : 100;

  const fmt = (n) => Number(n).toLocaleString(numberLocale);
  const rankLabel = nextRank
    ? nextRank.rank.charAt(0).toUpperCase() + nextRank.rank.slice(1)
    : '';

  return (
    <div className={`xp-bar ${compact ? 'xp-bar--compact' : ''}`}>
      <div className="xp-bar__header">
        <RankBadge rank={rank} size={compact ? 'sm' : 'md'} />
        <span className="xp-bar__level">{t(`${C}.xpLevel`, 'Nivel {level}', { level })}</span>
        <span className="xp-bar__xp-count">{t(`${C}.xpAmount`, '{xp} XP', { xp: fmt(xp) })}</span>
      </div>
      <div className="xp-bar__track">
        <div
          className={`xp-bar__fill xp-bar__fill--${rank}`}
          style={{ width: `${progress}%`, backgroundColor: currentRankInfo.color }}
        />
      </div>
      {!compact && nextRank && (
        <div className="xp-bar__footer">
          <span>
            {t(`${C}.xpProgressSegment`, '{current} / {total} XP', {
              current: fmt(xp - currentMin),
              total: fmt(nextMin - currentMin),
            })}
          </span>
          <span>{t(`${C}.nextRank`, 'Următorul rank: {rank}', { rank: rankLabel })}</span>
        </div>
      )}
    </div>
  );
};

export default XPBar;
