import "./NavbarItems.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTowerCell,
  faCircleInfo,
  faEarthEurope,
  faShip,
} from "@fortawesome/free-solid-svg-icons";
import { faGithubAlt } from "@fortawesome/free-brands-svg-icons";
import React from "react";

function NavbarItems({ linkClicked, isDropdown }) {
  function linkClickedEvent() {
    if (linkClicked) {
      linkClicked();
    }
  }

  return (
    <React.Fragment>
      <div className="navbar-start">
        <Link
          to="/"
          className="navbar-item  navbar-item-mobile"
          onClick={linkClickedEvent}
        >
          <span className="icon-text">
            <span className="icon">
              <FontAwesomeIcon icon={faEarthEurope} />
            </span>
            <span className="is-size-5-mobile">Map</span>
          </span>
        </Link>
        <Link
          to="/vessels"
          className="navbar-item  navbar-item-mobile"
          onClick={linkClickedEvent}
        >
          <span className="icon-text">
            <span className="icon">
              <FontAwesomeIcon icon={faShip} />
            </span>
            <span className="is-size-5-mobile">Vessels</span>
          </span>
        </Link>
        <Link
          to="/stations"
          className="navbar-item  navbar-item-mobile"
          onClick={linkClickedEvent}
        >
          <span className="icon-text">
            <span className="icon">
              <FontAwesomeIcon icon={faTowerCell} />
            </span>
            <span className="is-size-5-mobile">Stations</span>
          </span>
        </Link>
      </div>
      <div className="navbar-end">
        {isDropdown && <hr className="navbar-divider-menu-dropdown" />}
        <a
          href="https://github.com/t-recx/maritimo"
          target="_blank"
          rel="noreferrer"
          className="navbar-item  navbar-item-mobile"
          onClick={linkClickedEvent}
        >
          <span className="icon-text">
            <span className="icon">
              <FontAwesomeIcon icon={faGithubAlt} />
            </span>
            <span className="is-size-5-mobile">Github</span>
          </span>
        </a>
        {false && (
          <Link
            to="/about"
            className="navbar-item  navbar-item-mobile"
            onClick={linkClickedEvent}
          >
            <span className="icon-text">
              <span className="icon">
                <FontAwesomeIcon icon={faCircleInfo} />
              </span>
              <span className="is-size-5-mobile">About</span>
            </span>
          </Link>
        )}
      </div>
    </React.Fragment>
  );
}

export default NavbarItems;
