import React from 'react';
import { Flame } from 'lucide-react';

const StreakCounter = ({ current = 0, longest = 0, compact = false }) => {
  const isActive = current > 0;

  return (
    <div className={`streak-counter ${isActive ? 'streak-counter--active' : ''} ${compact ? 'streak-counter--compact' : ''}`}>
      <Flame
        size={compact ? 18 : 24}
        className={`streak-counter__icon ${isActive ? 'streak-counter__icon--lit' : ''}`}
      />
      <div className="streak-counter__info">
        <span className="streak-counter__current">
          {current} {current === 1 ? 'zi' : 'zile'}
        </span>
        {!compact && (
          <span className="streak-counter__longest">
            Record: {longest} {longest === 1 ? 'zi' : 'zile'}
          </span>
        )}
      </div>
    </div>
  );
};

export default StreakCounter;
