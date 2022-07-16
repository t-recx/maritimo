import "./Navbar.css";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav
      className="navbar is-info"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="navbar-brand">
        <Link to="/" className="navbar-item">
          <img
            className="maritimo-logo"
            src="/logo.svg"
            width="28"
            height="28"
          ></img>
          <span className="is-size-4 has-text-weight-bold">Maritimo</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
