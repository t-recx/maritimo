import React, { useState, useEffect } from "react";
import { Polygon, Circle, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { getShipColorScheme } from "../shipColorSchemes";
import AisObjectPopup from "./AisObjectPopup";
import { ShipStatus } from "../shipStatus";
import {
  getPolygon,
  getPolygonCentroid,
  shipHasDimensionsAndDirection,
} from "../shipRepresentation";

function AisObject({ data, zoom }) {
  const PresentationType = {
    None: 0,
    SVG: 1,
    Circle: 2,
    Polygon: 3,
  };

  const [presentationType, setPresentationType] = useState(
    PresentationType.None
  );
  const [polygon, setPolygon] = useState(null);
  const [svgCoordinates, setSVGCoordinates] = useState(null);
  const [colorScheme, setColorScheme] = useState(null);
  const [pathOptions, setPathOptions] = useState(null);
  const [transmitterPathOptions, setTransmitterPathOptions] = useState(null);
  const [circlePathOptions, setCirclePathOptions] = useState(null);
  const [svgIcon, setSVGIcon] = useState(null);
  const [showTransmitter, setShowTransmitter] = useState(null);
  const [transparentPathOptions, setTransparentPathOptions] = useState(null);

  useEffect(() => {
    if (zoom >= 14) {
      if (
        shipHasDimensionsAndDirection(
          data.dimension_to_bow,
          data.dimension_to_port,
          data.dimension_to_starboard,
          data.dimension_to_stern,
          data.true_heading
        )
      ) {
        setPresentationType(PresentationType.Polygon);
      } else {
        setPresentationType(PresentationType.Circle);
      }
    } else {
      if (
        shipIsMovingWithDirection(
          data.true_heading,
          data.navigation_status,
          data.speed_over_ground
        )
      ) {
        setPresentationType(PresentationType.SVG);
      } else {
        setPresentationType(PresentationType.Circle);
      }
    }
  }, [
    zoom,
    data.dimension_to_bow,
    data.dimension_to_port,
    data.dimension_to_starboard,
    data.dimension_to_stern,
    data.true_heading,
    data.navigation_status,
    data.speed_over_ground,
  ]);

  useEffect(() => {
    if (
      shipHasDimensionsAndDirection(
        data.dimension_to_bow,
        data.dimension_to_port,
        data.dimension_to_starboard,
        data.dimension_to_stern,
        data.true_heading
      ) &&
      (presentationType == PresentationType.SVG ||
        presentationType == PresentationType.Polygon)
    ) {
      setPolygon(
        getPolygon(
          data.dimension_to_bow,
          data.dimension_to_port,
          data.dimension_to_starboard,
          data.dimension_to_stern,
          data.true_heading,
          data.latitude,
          data.longitude
        )
      );
    } else {
      setPolygon(null);
    }
  }, [
    presentationType,
    data.dimension_to_bow,
    data.dimension_to_port,
    data.dimension_to_starboard,
    data.dimension_to_stern,
    data.true_heading,
    data.latitude,
    data.longitude,
  ]);

  useEffect(() => {
    if (polygon != null) {
      setSVGCoordinates(getPolygonCentroid(polygon));
    } else {
      setSVGCoordinates([data.latitude, data.longitude]);
    }
  }, [polygon, data.latitude, data.longitude]);

  useEffect(() => {
    const colorScheme = getShipColorScheme(data.ship_type);

    setColorScheme(colorScheme);
    setPathOptions({
      color: colorScheme.fillColor,
      fillColor: colorScheme.fillColor,
    });
    setCirclePathOptions({
      color: colorScheme.fillColor,
      fillColor: colorScheme.fillColor,
    });
    setTransparentPathOptions({
      color: "transparent",
      fillColor: "transparent",
    });
    setTransmitterPathOptions({
      color: colorScheme.colorTransmitter,
      fillColor: colorScheme.fillColorTransmitter,
    });
  }, [data.ship_type]);

  useEffect(() => {
    if (presentationType == PresentationType.SVG) {
      setSVGIcon(
        new L.DivIcon({
          html:
            '<svg width="16" height="16"><polygon fill="' +
            colorScheme.fillColor +
            '" transform="rotate(' +
            data.true_heading +
            ' 8, 8)" points="6,7 6,14 8,12 10,14 10,7 8,2"/></svg>',
          className: "",
        })
      );
    } else {
      setSVGIcon(null);
    }
  }, [presentationType, colorScheme, data.true_heading]);

  function shipIsMovingWithDirection(
    true_heading,
    navigation_status,
    speed_over_ground
  ) {
    if (
      navigation_status == ShipStatus.Atanchor ||
      navigation_status == ShipStatus.Moored ||
      ((navigation_status == ShipStatus.Notdefined ||
        navigation_status == null) &&
        speed_over_ground == 0)
    ) {
      return false;
    }

    return true_heading != null;
  }

  useEffect(() => {
    setShowTransmitter(
      presentationType == PresentationType.Polygon && zoom >= 17
    );
  }, [presentationType, zoom]);

  return (
    <React.Fragment>
      {presentationType == PresentationType.SVG && svgCoordinates && svgIcon && (
        <Marker position={svgCoordinates} icon={svgIcon}>
          <AisObjectPopup data={data} />
        </Marker>
      )}
      {presentationType == PresentationType.Circle && circlePathOptions && (
        <React.Fragment>
          <Circle
            center={[data.latitude, data.longitude]}
            pathOptions={transparentPathOptions}
            radius={6}
            weight={9}
          >
            <AisObjectPopup data={data} />
          </Circle>
          <Circle
            center={[data.latitude, data.longitude]}
            pathOptions={circlePathOptions}
            radius={6}
            weight={3}
          >
            <AisObjectPopup data={data} />
          </Circle>
        </React.Fragment>
      )}
      {presentationType == PresentationType.Polygon && pathOptions && polygon && (
        <React.Fragment>
          <Polygon pathOptions={pathOptions} positions={polygon}>
            <AisObjectPopup data={data} />
          </Polygon>
          {showTransmitter && transmitterPathOptions && (
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
    </React.Fragment>
  );
}

export default AisObject;
