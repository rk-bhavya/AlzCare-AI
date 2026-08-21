import "./Card.css";

/**
 * Generic surface container reused for dashboard widgets,
 * forms, module cards, report panels, etc.
 *
 * @param {string}  accent    optional left-border accent color (CSS value)
 * @param {boolean} hoverable adds a lift effect on hover
 */
const Card = ({
  children,
  title,
  subtitle,
  icon,
  footer,
  accent,
  hoverable = false,
  className = "",
  ...rest
}) => {
  const classes = ["card", hoverable ? "card--hoverable" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      style={accent ? { borderTopColor: accent, borderTopWidth: "4px" } : undefined}
      {...rest}
    >
      {(icon || title || subtitle) && (
        <div className="card__header">
          {icon && (
            <div
              className="card__icon"
              style={accent ? { background: accent } : undefined}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <div className="card__heading">
            {title && <h3 className="card__title">{title}</h3>}
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
        </div>
      )}

      {children && <div className="card__body">{children}</div>}

      {footer && <div className="card__footer">{footer}</div>}
    </div>
  );
};

export default Card;
