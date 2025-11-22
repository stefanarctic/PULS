import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const AchievementNotification = ({ achievements, onClose }) => {
  useEffect(() => {
    // Auto-close după 5 secunde
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievements || achievements.length === 0) return null;

  return (
    <div className="achievement-notification-container">
      {achievements.map((achievement, index) => (
        <div 
          key={`${achievement.title}-${index}`}
          className="achievement-notification"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="achievement-notification-icon" style={{ background: achievement.color }}>
            🏆
          </div>
          <div className="achievement-notification-content">
            <div className="achievement-notification-title">
              Achievement deblocat!
            </div>
            <div className="achievement-notification-name">
              {achievement.title}
            </div>
            <div className="achievement-notification-description">
              {achievement.description}
            </div>
          </div>
          <button 
            className="achievement-notification-close"
            onClick={onClose}
            aria-label="Închide"
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AchievementNotification;

