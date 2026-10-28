
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "../Button/Button.jsx";
import { APP_NAME, ROUTES } from "../../config/constants.js";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home", to: ROUTES.HOME, type: "route" },
  { label: "Modules", to: "#modules", type: "anchor" },
  { label: "About", to: "#about", type: "anchor" },
  { label: "Model Metrics", to: "/model-metrics", type: "route" },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to={ROUTES.HOME} className="navbar__brand">
          <span className="navbar__logo" aria-hidden="true">
            AC
          </span>

          <span className="navbar__brand-text">
            {APP_NAME}
            <small>Early Alzheimer's Detection</small>
          </span>
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          <span className={`navbar__bar ${isMenuOpen ? "is-open" : ""}`} />
          <span className={`navbar__bar ${isMenuOpen ? "is-open" : ""}`} />
          <span className={`navbar__bar ${isMenuOpen ? "is-open" : ""}`} />
        </button>

        <nav
          className={`navbar__menu ${
            isMenuOpen ? "navbar__menu--open" : ""
          }`}
        >
          <ul className="navbar__links">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                {link.type === "anchor" ? (
                  <a
                    href={`${ROUTES.HOME}${link.to}`}
                    className="navbar__link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.to}
                    className="navbar__link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="navbar__actions">
            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost" size="sm" fullWidth>
                Login
              </Button>
            </Link>

            <Link to={ROUTES.REGISTER}>
              <Button variant="primary" size="sm" fullWidth>
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </div>

      {isMenuOpen && (
        <div
          className="navbar__backdrop"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Navbar;
