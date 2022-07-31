import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <div className="content content--extra-small">
      <div className="notification has-text-centered">
        <h1 className="title">404</h1>
        <h2 className="subtitle">Page not found</h2>
        <p>
          We are sorry, but it appears you have entered a URL that does not
          exist on our site.
        </p>
        <Link to="/">
          <button className="button is-info">Back to homepage</button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
