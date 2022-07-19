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
        <Link to="/" className="navbar-item" onClick={linkClickedEvent}>
          <span className="icon-text">
            <span className="icon">
              <FontAwesomeIcon icon={faEarthEurope} size="sm" />
            </span>
            <span>Map</span>
          </span>
        </Link>
        {false && (
          <Link
            to="/vessels"
            className="navbar-item"
            onClick={linkClickedEvent}
          >
            <span className="icon-text">
              <span className="icon">
                <FontAwesomeIcon icon={faShip} size="sm" />
              </span>
              <span>Vessels</span>
            </span>
          </Link>
        )}
        <Link to="/stations" className="navbar-item" onClick={linkClickedEvent}>
          <span className="icon-text">
            <span className="icon">
              <FontAwesomeIcon icon={faTowerCell} size="sm" />
            </span>
            <span>Stations</span>
          </span>
        </Link>
      </div>
      <div className="navbar-end">
        {isDropdown && <hr className="navbar-divider-menu-dropdown" />}
        <a
          href="https://github.com/t-recx/maritimo"
          target="_blank"
          rel="noreferrer"
          className="navbar-item"
          onClick={linkClickedEvent}
        >
          <span className="icon-text">
            <span className="icon">
              <FontAwesomeIcon icon={faGithubAlt} size="sm" />
            </span>
            <span>Github</span>
          </span>
        </a>
        {false && (
          <Link to="/about" className="navbar-item" onClick={linkClickedEvent}>
            <span className="icon-text">
              <span className="icon">
                <FontAwesomeIcon icon={faCircleInfo} size="sm" />
              </span>
              <span>About</span>
            </span>
          </Link>
        )}
      </div>
    </React.Fragment>
  );
}

export default NavbarItems;
