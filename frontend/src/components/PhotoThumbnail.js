import "./PhotoThumbnail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faCircleNotch } from "@fortawesome/free-solid-svg-icons";
import React from "react";

function PhotoThumbnail({
  isLoading,
  filename,
  filenameThumbnail,
  width,
  height,
  title,
}) {
  return (
    <div className="ais-object-image-container has-background-light">
      {isLoading && (
        <div className="ais-object-no-image-available-container">
          <FontAwesomeIcon icon={faCircleNotch} spin={true} size="2x" />
        </div>
      )}

      {!isLoading && filename == null && (
        <div className="ais-object-no-image-available-container">
          <FontAwesomeIcon icon={faCamera} size="5x" />
          <p>No photo available</p>
        </div>
      )}

      {!isLoading && filename != null && (
        <a href={filename} target="_blank" title={title}>
          <img
            className="ais-object-image"
            width={width}
            height={height}
            src={filenameThumbnail}
          />
        </a>
      )}
    </div>
  );
}

export default PhotoThumbnail;
