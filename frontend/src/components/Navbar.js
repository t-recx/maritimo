import "./Navbar.css";

function Navbar() {
  return (
    <nav
      className="navbar is-info"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="navbar-brand">
        <a href="/" className="navbar-item ">
          <img
            className="maritimo-logo"
            src="logo.svg"
            width="28"
            height="28"
          ></img>
          <span className="is-size-4 has-text-weight-bold">Maritimo</span>
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
