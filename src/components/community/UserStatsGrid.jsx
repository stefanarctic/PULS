import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookCheck, Target, Percent, Flame, ChevronRight } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';

const P = 'profilePage.userStatsGrid';

const UserStatsGrid = ({ stats = {} }) => {
  const { t, localizedPath } = useI18n();

  const cards = useMemo(() => {
    const streak = stats.streak?.current ?? 0;
    const streakDisplay =
      streak === 1
        ? t(`${P}.streakDaysOne`, '{n} zi', { n: streak })
        : t(`${P}.streakDaysOther`, '{n} zile', { n: streak });

    return [
      {
        id: 'solved',
        icon: BookCheck,
        label: t(`${P}.solved`, 'Probleme rezolvate'),
        value: stats.totalSolved || 0,
        to: localizedPath('/probleme'),
        ariaLabel: t(`${P}.ariaProblemsCatalog`, 'Mergi la catalogul de probleme'),
      },
      {
        id: 'average',
        icon: Percent,
        label: t(`${P}.averageScore`, 'Scor mediu'),
        value: `${stats.averagePercent || 0}%`,
        to: localizedPath('/probleme'),
        ariaLabel: t(`${P}.ariaProblemsPractice`, 'Mergi la probleme pentru a exersa'),
      },
      {
        id: 'perfect',
        icon: Target,
        label: t(`${P}.perfectScores`, 'Scoruri perfecte'),
        value: stats.perfectScores || 0,
        to: localizedPath('/probleme'),
        ariaLabel: t(`${P}.ariaProblemsCatalog`, 'Mergi la catalogul de probleme'),
      },
      {
        id: 'streak',
        icon: Flame,
        label: t(`${P}.currentStreak`, 'Streak curent'),
        value: streakDisplay,
        to: localizedPath('/comunitate'),
        ariaLabel: t(`${P}.ariaCommunity`, 'Mergi la pagina Comunitate'),
      },
    ];
  }, [t, localizedPath, stats]);

  return (
    <div className="user-stats-grid">
      {cards.map((card) => (
        <Link
          key={card.id}
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
