import "./About.css";
import { faHeart, faCode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function About({ alert }) {
  return (
    <section className="hero-main hero">
      <div className="hero-body">
        <div className="container">
          <div className="columns mt-6">
            <div className="column ">
              <div className="info-container">
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
                    <span className="icon has-text-success">
                      <FontAwesomeIcon icon={faCode} size="sm" />
                    </span>
                    <span>Contribute</span>
                  </a>
                  <a
                    href="https://ko-fi.com/maritimo"
                    className="button"
                    target="_blank"
                  >
                    <span className="icon has-text-danger">
                      <FontAwesomeIcon icon={faHeart} size="sm" />
                    </span>
                    <span>Support</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="column">
              <div className="info-container">
                <img
                  className="maritimo-hero-image"
                  src="/about_illustration.jpg"
                  title="A cargo ship sailing away - Photo by Ian Taylor on Unsplash"
                ></img>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
