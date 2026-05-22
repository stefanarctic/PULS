import { BookOpen, Sigma } from "lucide-react";
import React from "react";
import { LocalizedLink as Link, useI18n } from "../../i18n/LanguageContext";
// import "./ResourceCard.scss";

const ResourceCard = ({
  title,
  description,
  image,
  icon,
  delay = 0,
  experimentPath,
  formulaCategory,
}) => {
  const { t } = useI18n();

  return (
    <div
      className="resource-card group"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image Section */}
      <div className="resource-card__image-container">
        <img
          src={image}
          alt={title}
          className="resource-card__image"
        />
        <div className="resource-card__gradient-overlay" />
        {/* Floating icon */}
        <div className="resource-card__floating-icon">
          {icon}
        </div>
      </div>
      {/* Content Section */}
      <div className="resource-card__content">
        <h3 className="resource-card__title">
          {title}
        </h3>
        <p className="resource-card__description">
          {description}
        </p>
        {/* Links row: Experimente (stânga) și Formule (dreapta) */}
        <div className="resource-card__links-row">
          <Link
            to={experimentPath || "/resurse?tab=experimente"}
            className="resource-card__button"
          >
            <BookOpen className="resource-card__button-icon" />
            <span>{t('resourcesSection.card.experiments', 'Experimente')}</span>
          </Link>
          {formulaCategory && (
            <Link
              to={`/resurse?tab=formule&formula=${formulaCategory}`}
              className="resource-card__button"
            >
              <Sigma className="resource-card__button-icon" />
              <span>{t('resourcesSection.card.formulas', 'Formule')}</span>
            </Link>
          )}
        </div>
      </div>
      {/* Glow effect on hover */}
      <div className="resource-card__glow-overlay">
        <div className="resource-card__glow-bg" />
      </div>
    </div>
  );
};

export default ResourceCard;