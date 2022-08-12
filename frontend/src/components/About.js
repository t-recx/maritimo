import AboutGlobe from "./AboutGlobe";
import "./About.css";
import { faHeart, faCode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function About({ alert }) {
  return (
    <section className="hero-main hero">
      <div className="hero-body">
        <div className="container">
          <div className="columns">
            <div className="column ">
              <h1 className="maritimo-title">Maritimo</h1>
              <p className="subtitle">
                Real time information on ship movements.
              </p>
              <div class="buttons">
                <button className="button">
                  <span className="icon">
                    <FontAwesomeIcon icon={faCode} size="sm" />
                  </span>
                  <span>Contribute</span>
                </button>
                <button className="button">
                  <span className="icon">
                    <FontAwesomeIcon icon={faHeart} size="sm" />
                  </span>
                  <span>Support</span>
                </button>
              </div>
            </div>
            <div className="column">
              <AboutGlobe />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
