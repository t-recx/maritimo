import "./AisMap.css";

import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import AisMapContent from "./AisMapContent";
import Navbar from "./Navbar";
import React from "react";

function AisMap({
  changeParamsLocation = true,
  latitude,
  longitude,
  zoom,
  stations,
  followMMSI,
  dataUpdatedCallback,
}) {
  return (
    <React.Fragment>
      <MapContainer
        preferCanvas={true}
        center={[latitude, longitude]}
        zoom={zoom}
        maxZoom={process.env.REACT_APP_MAP_MAX_ZOOM}
        zoomControl={false}
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
        />

        <ZoomControl position="bottomleft" />
      </MapContainer>
    </React.Fragment>
  );
}

export default AisMap;
