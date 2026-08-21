import "./Button.css";

/**
 * Reusable Button component.
 *
 * @param {string}  variant  primary | secondary | outline | ghost | danger
 * @param {string}  size     sm | md | lg
 * @param {boolean} isLoading shows a spinner and disables the button
 * @param {boolean} fullWidth stretches to 100% of the parent
 */
const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  disabled = false,
  onClick,
  className = "",
  ...rest
}) => {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? "btn--full" : "",
    isLoading ? "btn--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading && <span className="btn__spinner" aria-hidden="true" />}
      <span className="btn__label">{children}</span>
    </button>
  );
};

export default Button;
