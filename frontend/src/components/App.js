import "./App.css";
import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer } from "react-leaflet";
import AisMap from "./AisMap";

import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  return (
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
  );
}

export default App;
