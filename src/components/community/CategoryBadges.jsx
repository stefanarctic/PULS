import React from 'react';
import { Award } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';

const CB = 'communityPage.categoryBadges';

const TIER_COLORS = {
  apprentice: '#10b981',
  expert: '#3b82f6',
  master: '#ffd700',
  legend: '#8b5cf6',
};

const TIER_LABELS = {
  apprentice: 'Apprentice',
  expert: 'Expert',
  master: 'Master',
  legend: 'Legend',
};

const CategoryBadges = ({ badges = [], compact = false }) => {
  const { t } = useI18n();

  if (badges.length === 0) {
    return (
      <div className="category-badges category-badges--empty">
        <p className="category-badges__empty-text">
          {t(
            `${CB}.empty`,
            'Rezolvă probleme din diferite categorii pentru a debloca badge-uri!'
          )}
        </p>
      </div>
    );
  }

  const sorted = [...badges].sort((a, b) => {
    const tierOrder = ['legend', 'master', 'expert', 'apprentice'];
    return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
  });

  return (
    <div className={`category-badges ${compact ? 'category-badges--compact' : ''}`}>
      {sorted.map((badge) => (
        <div
          key={badge.id}
          className={`category-badge category-badge--${badge.tier}`}
          title={t(`${CB}.badgeTitle`, '{name} — deblocat', { name: badge.name })}
        >
          <Award size={compact ? 16 : 20} style={{ color: TIER_COLORS[badge.tier] }} />
          <div className="category-badge__info">
            <span className="category-badge__name">{badge.category}</span>
            <span
              className="category-badge__tier"
              style={{ color: TIER_COLORS[badge.tier] }}
            >
              {TIER_LABELS[badge.tier]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryBadges;
