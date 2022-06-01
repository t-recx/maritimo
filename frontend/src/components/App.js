import "./App.css";

import { MapContainer, TileLayer } from "react-leaflet";
import AisMap from "./AisMap";
import Navbar from "./Navbar";
import React from "react";

function App() {
  return (
    <React.Fragment>
      <Navbar />
      <MapContainer
        center={[
          parseFloat(process.env.REACT_APP_MAP_INITIAL_CENTER_LATITUDE),
          parseFloat(process.env.REACT_APP_MAP_INITIAL_CENTER_LONGITUDE),
        ]}
        zoom={process.env.REACT_APP_MAP_INITIAL_ZOOM}
        maxZoom={process.env.REACT_APP_MAP_MAX_ZOOM}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        <AisMap />
      </MapContainer>
    </React.Fragment>
  );
}

export default App;
