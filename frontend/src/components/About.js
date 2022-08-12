import AboutGlobe from "./AboutGlobe";
import "./About.css";
import { faHeart, faCode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useResizeDetector } from "react-resize-detector";

function About({ alert }) {
  const { width, height, ref } = useResizeDetector();

  return (
    <section className="hero-main hero">
      <div className="hero-body">
        <div className="container">
          <div className="columns">
            <div className="column column-hero">
              <h1 className="maritimo-title">Maritimo</h1>
              <p className="subtitle">
                Real time information on ship movements.
              </p>
              <div className="buttons">
                <a
                  href="https://github.com/t-recx/maritimo"
                  className="button"
                  target="_blank"
                >
                  <span className="icon">
                    <FontAwesomeIcon icon={faCode} size="sm" />
                  </span>
                  <span>Contribute</span>
                </a>
                <a
                  href="https://ko-fi.com/maritimo"
                  className="button"
                  target="_blank"
                >
                  <span className="icon">
                    <FontAwesomeIcon icon={faHeart} size="sm" />
                  </span>
                  <span>Support</span>
                </a>
              </div>
            </div>
            <div className="column" ref={ref}>
              <AboutGlobe width={width} height={height} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
