import React from 'react';
import { Check } from 'lucide-react';

const TIER_STYLES = {
  empty: { color: '#94a3b8', bg: 'transparent' },
  fail: { color: '#fef2f2', bg: '#dc2626' },
  mid: { color: '#713f12', bg: '#facc15' },
  good: { color: '#fff', bg: '#22c55e' },
  perfect: { color: '#ecfdf5', bg: '#14532d' },
  sim: { color: '#fff', bg: '#22c55e' },
};

/**
 * @param {object} props
 * @param {'empty'|'fail'|'mid'|'good'|'perfect'|'sim'} props.tier
 * @param {string} [props.className]
 * @param {string} [props.title]
 */
export function AssignmentCheckIcon({ tier, className = '', title }) {
  const s = TIER_STYLES[tier] || TIER_STYLES.empty;
  if (tier === 'empty') {
    return (
      <span
        className={`assignment-check-icon assignment-check-icon--empty ${className}`.trim()}
        title={title || 'Nefăcut'}
        aria-hidden
      >
        <Check size={16} strokeWidth={3} style={{ opacity: 0.35, color: s.color }} />
      </span>
    );
  }
  return (
    <span
      className={`assignment-check-icon ${className}`.trim()}
      title={title}
      style={{
        background: s.bg,
        color: s.color,
      }}
      aria-label={title}
    >
      <Check size={16} strokeWidth={3} />
    </span>
  );
}
