import React, { useState, useEffect } from "react";
import { Polygon, Circle, Marker } from "react-leaflet";
import L from "leaflet";
import { getShipColorScheme } from "../shipColorSchemes";
import AisObjectPopup from "./AisObjectPopup";
import { ShipStatus } from "../shipStatus";
import {
  getPolygon,
  getPolygonCentroid,
  shipHasDimensionsAndDirection,
} from "../shipRepresentation";

function AisObject({ data, zoom, isSelected }) {
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
  const [radiusSelected, setRadiusSelected] = useState(null);

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
    if (zoom >= 16) {
      setRadiusSelected(12);
    } else if (zoom >= 15) {
      setRadiusSelected(15);
    } else if (zoom >= 14) {
      setRadiusSelected(30);
    } else if (zoom >= 13) {
      setRadiusSelected(60);
    } else if (zoom >= 12) {
      setRadiusSelected(100);
    } else if (zoom >= 11) {
      setRadiusSelected(200);
    } else if (zoom >= 10) {
      setRadiusSelected(350);
    } else if (zoom >= 9) {
      setRadiusSelected(700);
    } else {
      setRadiusSelected(740 * Math.pow(2, 9 - zoom));
    }
  }, [zoom]);

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
      const centroid = getPolygonCentroid(polygon);

      setSVGCoordinates(centroid);
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
      let html = "";

      if (isSelected) {
        html =
          '<svg width="16" height="16"><line x1=0 y1=0 x2=3 y2=0 stroke="' +
          colorScheme.fillColor +
          '"/><line x1=0 y1=0 x2=0 y2=3 stroke="' +
          colorScheme.fillColor +
          '"/>' +
          '<line x1=16 y1=0 x2=13 y2=0 stroke="' +
          colorScheme.fillColor +
          '"/><line x1=16 y1=0 x2=16 y2=3 stroke="' +
          colorScheme.fillColor +
          '"/>' +
          '<line x1=16 y1=16 x2=13 y2=16 stroke="' +
          colorScheme.fillColor +
          '"/><line x1=16 y1=16 x2=16 y2=13 stroke="' +
          colorScheme.fillColor +
          '"/>' +
          '<line x1=0 y1=16 x2=0 y2=13 stroke="' +
          colorScheme.fillColor +
          '"/><line x1=0 y1=16 x2=3 y2=16 stroke="' +
          colorScheme.fillColor +
          '"/>' +
          '<polygon fill="' +
          colorScheme.fillColor +
          '" transform="rotate(' +
          data.true_heading +
          ' 8, 8)" points="6,7 6,14 8,12 10,14 10,7 8,2"/></svg>';
      } else {
        html =
          '<svg width="16" height="16"><polygon fill="' +
          colorScheme.fillColor +
          '" transform="rotate(' +
          data.true_heading +
          ' 8, 8)" points="6,7 6,14 8,12 10,14 10,7 8,2"/></svg>';
      }

      setSVGIcon(
        new L.DivIcon({
          html: html,
          className: "",
        })
      );
    } else {
      setSVGIcon(null);
    }
  }, [presentationType, colorScheme, data.true_heading, isSelected]);

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
          {isSelected && (
            <Circle
              center={[data.latitude, data.longitude]}
              pathOptions={circlePathOptions}
              radius={radiusSelected}
              weight={1}
            >
              <AisObjectPopup data={data} />
            </Circle>
          )}
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
