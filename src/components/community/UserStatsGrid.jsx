import React from 'react';
import { BookCheck, Target, Percent, Flame } from 'lucide-react';

const UserStatsGrid = ({ stats = {} }) => {
  const cards = [
    {
      icon: BookCheck,
      label: 'Probleme rezolvate',
      value: stats.totalSolved || 0,
      color: '#3b82f6',
    },
    {
      icon: Percent,
      label: 'Scor mediu',
      value: `${stats.averagePercent || 0}%`,
      color: '#10b981',
    },
    {
      icon: Target,
      label: 'Scoruri perfecte',
      value: stats.perfectScores || 0,
      color: '#ffd700',
    },
    {
      icon: Flame,
      label: 'Streak curent',
      value: `${stats.streak?.current || 0} zile`,
      color: '#ef4444',
    },
  ];

  return (
    <div className="user-stats-grid">
      {cards.map((card) => (
        <div key={card.label} className="user-stats-card">
          <card.icon size={24} style={{ color: card.color }} />
          <div className="user-stats-card__value">{card.value}</div>
          <div className="user-stats-card__label">{card.label}</div>
        </div>
      ))}
    </div>
  );
};

export default UserStatsGrid;
