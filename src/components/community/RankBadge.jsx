import React from 'react';
import { Shield, Award, Crown, Gem, Star } from 'lucide-react';

const RANK_CONFIG = {
  bronze:   { label: 'Bronze',   color: '#cd7f32', Icon: Shield },
  silver:   { label: 'Silver',   color: '#c0c0c0', Icon: Award },
  gold:     { label: 'Gold',     color: '#ffd700', Icon: Star },
  platinum: { label: 'Platinum', color: '#e5e4e2', Icon: Crown },
  diamond:  { label: 'Diamond',  color: '#b9f2ff', Icon: Gem },
};

const RankBadge = ({ rank = 'bronze', size = 'md', showLabel = true }) => {
  const config = RANK_CONFIG[rank] || RANK_CONFIG.bronze;
  const { label, color, Icon } = config;

  const iconSizes = { sm: 14, md: 18, lg: 24 };
  const iconSize = iconSizes[size] || iconSizes.md;

  return (
    <span className={`rank-badge rank-badge--${rank} rank-badge--${size}`} title={label}>
      <Icon size={iconSize} style={{ color }} />
      {showLabel && <span className="rank-badge__label" style={{ color }}>{label}</span>}
    </span>
  );
};

export default RankBadge;
