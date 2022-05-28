import * as turf from "@turf/turf";
import React, { useState, useEffect } from "react";
import { Polygon, Circle, Marker } from "react-leaflet";
import L from "leaflet";
import { getShipColorScheme } from "../shipColorSchemes";

// todo: change ship svg when ship is stopped
// todo: change (and only use) svg when it's not a ship (example: weather station/ais station)

const DisplayTypes = {
  ShipPolygon: 1,
  Circle: 2,
};

function AisShipObject({ data, zoom }) {
  const [displayType, setDisplayType] = useState(null);
  const [objectPolygon, setObjectPolygon] = useState(null);
  const [iconShip, setIconShip] = useState(null);
  const [iconLocation, setIconLocation] = useState([]);
  const [colorScheme, setColorScheme] = useState(null);
  const [pathOptions, setPathOptions] = useState(null);
  const [transmitterPathOptions, setTransmitterPathOptions] = useState(null);

  useEffect(() => {
    if (data) {
      if (canBePolygon(data)) {
        setDisplayType(DisplayTypes.ShipPolygon);
      } else {
        setDisplayType(DisplayTypes.Circle);
      }
    } else {
      setDisplayType(null);
    }
  }, [data]);

  useEffect(() => {
    const colorScheme = getShipColorScheme(data.ship_type);

    setColorScheme(colorScheme);
    setPathOptions({
      color: colorScheme.color,
      fillColor: colorScheme.fillColor,
    });
    setTransmitterPathOptions({
      color: colorScheme.colorTransmitter,
      fillColor: colorScheme.fillColorTransmitter,
    });
  }, [data.ship_type]);

  useEffect(() => {
    if (data.true_heading && colorScheme) {
      const angle = data.true_heading;
      const i = new L.DivIcon({
        html:
          '<svg xmlns="http://www.w3.org/2000/svg"  width="32" height="32"" transform="translate(-10,-10) scale(0.5)" > <polygon stroke="' +
          colorScheme.color +
          '" stroke-width=1  fill="' +
          colorScheme.fillColor +
          '" transform="rotate(' +
          angle +
          ' 16, 16)" points=" 12,14 12,28 16,24 20,28, 20,14 16,4" /> </svg>',
        className: "",
      });
      setIconShip(i);
    } else {
      setIconShip(null);
    }
  }, [data.true_heading, colorScheme]);

  useEffect(() => {
    if (displayType === DisplayTypes.ShipPolygon && canBePolygon(data)) {
      const angle = ((data.true_heading + 180) % 360) - 180;

      const beakSize = (data.dimension_to_bow + data.dimension_to_stern) / 10;

      const gpsLocation = turf.point([data.longitude, data.latitude]);

      const horizontalAngle = angle + 90;
      const a = turf.destination(
        gpsLocation,
        (data.dimension_to_bow - beakSize) / 1000,
        angle
      );
      const b = turf.destination(
        gpsLocation,
        -data.dimension_to_stern / 1000,
        angle
      );
      const c = turf.destination(
        b,
        data.dimension_to_starboard / 1000,
        horizontalAngle
      );
      const d = turf.destination(
        a,
        data.dimension_to_starboard / 1000,
        horizontalAngle
      );
      const e = turf.destination(
        b,
        -data.dimension_to_port / 1000,
        horizontalAngle
      );
      const f = turf.destination(
        a,
        -data.dimension_to_port / 1000,
        horizontalAngle
      );
      const midPoint = turf.midpoint(d, f);
      const spike = turf.destination(midPoint, beakSize / 1000, angle);
      const newPolygon = [
        [e.geometry.coordinates[1], e.geometry.coordinates[0]],
        [c.geometry.coordinates[1], c.geometry.coordinates[0]],
        [d.geometry.coordinates[1], d.geometry.coordinates[0]],

        [spike.geometry.coordinates[1], spike.geometry.coordinates[0]],

        [f.geometry.coordinates[1], f.geometry.coordinates[0]],
      ];

      setObjectPolygon(newPolygon);
    } else {
      setObjectPolygon(null);
    }
  }, [data, displayType]);

  useEffect(() => {
    if (objectPolygon) {
      const p = [
        objectPolygon
          .map((point) => [point[1], point[0]])
          .concat([[objectPolygon[0][1], objectPolygon[0][0]]]),
      ];
      const centroid = turf.centroid(turf.polygon(p));
      setIconLocation([
        centroid.geometry.coordinates[1],
        centroid.geometry.coordinates[0],
      ]);
    } else {
      setIconLocation([data.latitude, data.longitude]);
    }
  }, [data, objectPolygon]);

  function canBePolygon(d) {
    return (
      d &&
      d.dimension_to_bow &&
      d.dimension_to_port &&
      d.dimension_to_starboard &&
      d.dimension_to_stern &&
      d.true_heading
    );
  }

  return (
    <React.Fragment>
      {displayType === DisplayTypes.ShipPolygon && (
        <React.Fragment>
          {zoom >= 14 && objectPolygon && (
            <React.Fragment>
              <Polygon
                pathOptions={pathOptions}
                positions={objectPolygon}
              ></Polygon>
              {zoom >= 17 && (
                <Circle
                  center={[data.latitude, data.longitude]}
                  pathOptions={transmitterPathOptions}
                  radius={0.1}
                ></Circle>
              )}
            </React.Fragment>
          )}
          {zoom < 14 && objectPolygon && iconShip && (
            <Marker position={iconLocation} icon={iconShip}></Marker>
          )}
        </React.Fragment>
      )}
      {displayType === DisplayTypes.Circle && pathOptions && (
        <Circle
          center={[data.latitude, data.longitude]}
          pathOptions={pathOptions}
          radius={1}
        ></Circle>
      )}
    </React.Fragment>
  );
}

export default AisShipObject;
