import React from 'react';
import { Link } from 'react-router-dom';
import { BookCheck, Target, Percent, Flame, ChevronRight } from 'lucide-react';

const UserStatsGrid = ({ stats = {} }) => {
  const cards = [
    {
      icon: BookCheck,
      label: 'Probleme rezolvate',
      value: stats.totalSolved || 0,
      to: '/probleme',
      ariaLabel: 'Mergi la catalogul de probleme',
    },
    {
      icon: Percent,
      label: 'Scor mediu',
      value: `${stats.averagePercent || 0}%`,
      to: '/probleme',
      ariaLabel: 'Mergi la probleme pentru a exersa',
    },
    {
      icon: Target,
      label: 'Scoruri perfecte',
      value: stats.perfectScores || 0,
      to: '/probleme',
      ariaLabel: 'Mergi la catalogul de probleme',
    },
    {
      icon: Flame,
      label: 'Streak curent',
      value: `${stats.streak?.current || 0} zile`,
      to: '/comunitate',
      ariaLabel: 'Mergi la pagina Comunitate',
    },
  ];

  return (
    <div className="user-stats-grid">
      {cards.map((card) => (
        <Link
          key={card.label}
          to={card.to}
          className="user-stats-card"
          aria-label={`${card.label}: ${card.value}. ${card.ariaLabel}`}
        >
          <div className="user-stats-card__icon-wrap">
            <card.icon size={24} strokeWidth={2.25} />
          </div>
          <div className="user-stats-card__body">
            <div className="user-stats-card__value">{card.value}</div>
            <div className="user-stats-card__label">{card.label}</div>
          </div>
          <span className="user-stats-card__arrow" aria-hidden>
            <ChevronRight size={26} strokeWidth={2} />
          </span>
        </Link>
      ))}
    </div>
  );
};

export default UserStatsGrid;
