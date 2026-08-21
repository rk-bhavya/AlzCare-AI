import { Link } from "react-router-dom";
import Button from "../../components/Button/Button.jsx";
import { ROUTES } from "../../config/constants.js";
import "./NotFound.css";

const NotFound = () => {
  return (
    <section className="notfound">
      <div className="container notfound__inner">
        <span className="notfound__code">404</span>
        <h1>Page not found</h1>
        <p>
          The page you are looking for doesn't exist, was moved, or is not
          available for your role.
        </p>
        <Link to={ROUTES.HOME}>
          <Button size="lg">Back to Home</Button>
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
