import "./AisMap.css";

import {
  MapContainer,
  TileLayer,
  ZoomControl,
  AttributionControl,
} from "react-leaflet";
import AisMapContent from "./AisMapContent";
import React from "react";

function AisMap({
  changeParamsLocation = true,
  latitude,
  longitude,
  zoom,
  stations,
  followMMSI,
  dataUpdatedCallback,
  alert,
}) {
  return (
    <React.Fragment>
      <MapContainer
        preferCanvas={true}
        center={[latitude, longitude]}
        zoom={zoom}
        maxZoom={process.env.REACT_APP_MAP_MAX_ZOOM}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        <AisMapContent
          changeParamsLocation={changeParamsLocation}
          stations={stations}
          followMMSI={followMMSI}
          dataUpdatedCallback={dataUpdatedCallback}
          initialZoom={zoom}
          alert={alert}
        />

        <ZoomControl position="bottomleft" />
        <AttributionControl position="bottomright" prefix={false} />
      </MapContainer>
    </React.Fragment>
  );
}

export default AisMap;
