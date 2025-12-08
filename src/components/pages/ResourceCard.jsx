import { BookOpen } from "lucide-react";
import React from "react";
// import "./ResourceCard.scss";

const ResourceCard = ({
  title,
  description,
  image,
  icon,
  delay = 0,
}) => {
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
        {/* Button */}
        <button className="resource-card__button">
          <BookOpen className="resource-card__button-icon" />
          <span>Explorează</span>
        </button>
      </div>
      {/* Glow effect on hover */}
      <div className="resource-card__glow-overlay">
        <div className="resource-card__glow-bg" />
      </div>
    </div>
  );
};

export default ResourceCard;