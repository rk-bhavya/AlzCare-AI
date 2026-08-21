const SummaryCard = ({
  title,
  value,
  description,
  icon,
  className = "",
}) => {
  return (
    <div
      className={`doctor-summary-card ${className}`}
    >
      <div className="doctor-summary-card__top">

        <div className="doctor-summary-card__icon">
          {icon}
        </div>

        <span className="doctor-summary-card__label">
          {title}
        </span>

      </div>

      <div className="doctor-summary-card__value">
        {value}
      </div>

      <p className="doctor-summary-card__description">
        {description}
      </p>
    </div>
  );
};

export default SummaryCard;