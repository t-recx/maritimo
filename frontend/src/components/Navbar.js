import "./Navbar.css";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import MobileSideMenu from "./MobileSideMenu";
import NavbarItems from "./NavbarItems";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
        className="navbar is-info is-fixed-top"
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
            className="navbar-burger navbar-burger-icon-container"
            aria-label="menu"
            aria-expanded="false"
            onClick={toggleHamburger}
          >
            <FontAwesomeIcon
              icon={hamburgerActive ? faTimes : faBars}
              size="lg"
            />
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
