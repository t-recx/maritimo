import * as turf from "@turf/turf";
import React, { useState, useEffect } from "react";
import { Polygon, Circle, Marker } from "react-leaflet";
import L from "leaflet";
import { getShipColorScheme } from "../shipColorSchemes";
import AisObjectPopup from "./AisObjectPopup";
import { ShipStatus } from "../shipStatus";

function AisObject({ data, zoom }) {
  const [objectPolygon, setObjectPolygon] = useState(null);
  const [icon, setIcon] = useState(null);
  const [iconLocation, setIconLocation] = useState([]);
  const [colorScheme, setColorScheme] = useState(null);
  const [pathOptions, setPathOptions] = useState(null);
  const [transmitterPathOptions, setTransmitterPathOptions] = useState(null);

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
    if (colorScheme) {
      if (
        data.true_heading &&
        shipIsMoving(data.navigation_status, data.speed_over_ground)
      ) {
        const angle = data.true_heading;
        const i = new L.DivIcon({
          html:
            '<svg width="16" height="16"><polygon fill="' +
            colorScheme.fillColor +
            '" transform="rotate(' +
            angle +
            ' 8, 8)" points="6,7 6,14 8,12 10,14 10,7 8,2"/></svg>',
          className: "",
        });
        setIcon(i);
      } else {
        const i = new L.DivIcon({
          html:
            '<svg width="10" height="8"><circle fill="' +
            colorScheme.fillColor +
            '" cx="6" cy="3" r="3"/></svg>',
          className: "",
        });
        setIcon(i);
      }
    } else {
      setIcon(null);
    }
  }, [
    data.true_heading,
    colorScheme,
    data.navigation_status,
    data.speed_over_ground,
  ]);

  useEffect(() => {
    if (canBePolygon(data)) {
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
  }, [data]);

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

  function shipIsMoving(navigation_status, speed_over_ground) {
    if (
      navigation_status == ShipStatus.Atanchor ||
      navigation_status == ShipStatus.Moored ||
      ((navigation_status == ShipStatus.Notdefined ||
        navigation_status == null) &&
        speed_over_ground == 0)
    ) {
      return false;
    }

    return true;
  }

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
      {zoom >= 14 && objectPolygon && (
        <React.Fragment>
          <Polygon pathOptions={pathOptions} positions={objectPolygon}>
            <AisObjectPopup data={data} />
          </Polygon>
          {zoom >= 17 && (
            <Circle
              center={[data.latitude, data.longitude]}
              pathOptions={transmitterPathOptions}
              radius={0.1}
            >
              <AisObjectPopup data={data} />
            </Circle>
          )}
        </React.Fragment>
      )}
      {zoom >= 14 && !objectPolygon && (
        <React.Fragment>
          <Circle
            center={[data.latitude, data.longitude]}
            pathOptions={pathOptions}
            radius={5}
          >
            <AisObjectPopup data={data} />
          </Circle>
        </React.Fragment>
      )}
      {zoom < 14 && icon && (
        <Marker position={iconLocation} icon={icon}>
          <AisObjectPopup data={data} />
        </Marker>
      )}
    </React.Fragment>
  );
}

export default AisObject;
