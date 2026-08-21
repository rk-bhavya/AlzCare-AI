import { Link } from "react-router-dom";
import { APP_NAME, ROUTES } from "../../config/constants.js";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <h4>{APP_NAME}</h4>
          <p>
            An AI-powered platform for early Alzheimer's detection and daily
            cognitive assistance.
          </p>
        </div>

        <div className="footer__col">
          <h5>Platform</h5>
          <Link to={ROUTES.HOME}>Home</Link>
          <Link to={ROUTES.LOGIN}>Login</Link>
          <Link to={ROUTES.REGISTER}>Register</Link>
        </div>

        <div className="footer__col">
          <h5>Modules</h5>
          <span>Patient</span>
          <span>Caregiver</span>
          <span>Doctor</span>
          <span>Admin</span>
        </div>

        <div className="footer__col">
          <h5>Disclaimer</h5>
          <p className="footer__note">
            This system is an academic decision-support project. It does not
            replace professional medical diagnosis.
          </p>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>© {currentYear} {APP_NAME}.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
