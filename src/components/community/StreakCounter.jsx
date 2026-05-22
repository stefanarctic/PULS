import React from 'react';
import { Flame } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';

const C = 'profilePage.community';

const StreakCounter = ({ current = 0, longest = 0, compact = false }) => {
  const { t } = useI18n();
  const isActive = current > 0;

  const daysPhrase = (n) =>
    n === 1
      ? t(`${C}.dayStreakOne`, '{count} zi', { count: n })
      : t(`${C}.dayStreakOther`, '{count} zile', { count: n });

  const recordPhrase = (n) =>
    n === 1
      ? t(`${C}.recordOne`, 'Record: {count} zi', { count: n })
      : t(`${C}.recordOther`, 'Record: {count} zile', { count: n });

  return (
    <div className={`streak-counter ${isActive ? 'streak-counter--active' : ''} ${compact ? 'streak-counter--compact' : ''}`}>
      <Flame
        size={compact ? 18 : 24}
        className={`streak-counter__icon ${isActive ? 'streak-counter__icon--lit' : ''}`}
      />
      <div className="streak-counter__info">
        <span className="streak-counter__current">{daysPhrase(current)}</span>
        {!compact && (
          <span className="streak-counter__longest">{recordPhrase(longest)}</span>
        )}
      </div>
    </div>
  );
};

export default StreakCounter;
