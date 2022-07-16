import "./AisStation.css";
import React, { useState, useEffect } from "react";
import L from "leaflet";
import { Marker } from "react-leaflet";
import ReactDOMServer from "react-dom/server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTowerCell } from "@fortawesome/free-solid-svg-icons";
import AisStationPopup from "./AisStationPopup";

function AisStation({ data }) {
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    const i = new L.DivIcon({
      html: ReactDOMServer.renderToString(
        <FontAwesomeIcon icon={faTowerCell} size="lg" />
      ),
      className: "station-marker",
    });
    setIcon(i);
  }, [data]);

  return (
    <React.Fragment>
      {icon && (
        <Marker position={[data.latitude, data.longitude]} icon={icon}>
          <AisStationPopup data={data} />
        </Marker>
      )}
    </React.Fragment>
  );
}

export default AisStation;
