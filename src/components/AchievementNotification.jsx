import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useI18n } from '../i18n/LanguageContext';
import { translateMilestone } from '../lib/achievementI18n';

const P = 'profilePage';

const AchievementNotification = ({ achievements, onClose }) => {
  const { t } = useI18n();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievements || achievements.length === 0) return null;

  return (
    <div className="achievement-notification-container">
      {achievements.map((achievement, index) => {
        const { title, description } = translateMilestone(achievement, t);
        return (
          <div
            key={`${achievement.key || achievement.title}-${index}`}
            className="achievement-notification"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="achievement-notification-icon" style={{ background: achievement.color }}>
              🏆
            </div>
            <div className="achievement-notification-content">
              <div className="achievement-notification-title">
                {t(`${P}.achievementUnlockedToast`, 'Achievement deblocat!')}
              </div>
              <div className="achievement-notification-name">{title}</div>
              <div className="achievement-notification-description">{description}</div>
            </div>
            <button
              type="button"
              className="achievement-notification-close"
              onClick={onClose}
              aria-label={t(`${P}.closeNotificationAria`, 'Închide')}
            >
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AchievementNotification;
