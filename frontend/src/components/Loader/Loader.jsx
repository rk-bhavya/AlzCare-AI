import "./Loader.css";

/**
 * Loading indicator.
 * @param {string}  size      sm | md | lg
 * @param {boolean} fullPage  centers the loader in the viewport
 * @param {string}  message   optional text under the spinner
 */
const Loader = ({ size = "md", fullPage = false, message = "" }) => {
  const spinner = (
    <div className="loader__wrapper" role="status" aria-live="polite">
      <div className={`loader loader--${size}`} />
      {message && <p className="loader__message">{message}</p>}
      <span className="sr-only">Loading</span>
    </div>
  );

  if (fullPage) {
    return <div className="loader__fullpage">{spinner}</div>;
  }

  return spinner;
};

export default Loader;
