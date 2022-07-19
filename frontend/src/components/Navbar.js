import "./Navbar.css";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import MobileSideMenu from "./MobileSideMenu";
import NavbarItems from "./NavbarItems";

function Navbar() {
  const [hamburgerActive, setHamburgerActive] = useState(false);

  function toggleHamburger() {
    setHamburgerActive(!hamburgerActive);
  }

  function setDropDownHidden() {
    setHamburgerActive(false);
  }

  return (
    <React.Fragment>
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

          <a
            role="button"
            className={"navbar-burger " + (hamburgerActive ? " is-active" : "")}
            aria-label="menu"
            aria-expanded="false"
            onClick={toggleHamburger}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div id="navBarItems" className="navbar-menu">
          <NavbarItems />
        </div>
      </nav>

      <MobileSideMenu
        dropDownVisible={hamburgerActive}
        setDropDownHidden={setDropDownHidden}
      />
    </React.Fragment>
  );
}

export default Navbar;
