import { Popup } from "react-leaflet";
import "./AisObjectPopup.css";
import { getShipTypeDescription } from "../shipTypes";
import { getNavAidTypeDescription } from "../navAids";
import {
  getCountryDescription,
  getFlagInformation,
  getTypeOfObject,
  getTypeOfObjectDescription,
  TypeOfObject,
} from "../mmsi";
import { getShipStatusDescription, ShipStatus } from "../shipStatus";
import React, { useEffect, useState } from "react";
import TimeAgo from "timeago-react";
import { Link } from "react-router-dom";

function AisObjectPopup({ data }) {
  const [shipTypeDescription, setShipTypeDescription] = useState(null);
  const [shipCountryDescription, setShipCountryDescription] = useState(null);
  const [shipStatusDescription, setShipStatusDescription] = useState(null);
  const [flagInformation, setFlagInformation] = useState(null);
  const [navAidTypeDescription, setNavAidTypeDescription] = useState(null);
  const [objectType, setObjectType] = useState(null);
  const [objectTypeDescription, setObjectTypeDescription] = useState(null);

  useEffect(() => {
    setNavAidTypeDescription(getNavAidTypeDescription(data.aid_type));
  }, [data.aid_type]);

  useEffect(() => {
    setShipTypeDescription(getShipTypeDescription(data.ship_type));
  }, [data.ship_type]);

  useEffect(() => {
    setShipCountryDescription(getCountryDescription(data.mmsi));
    setFlagInformation(getFlagInformation(data.mmsi));
    setObjectType(getTypeOfObject(data.mmsi));
    setObjectTypeDescription(getTypeOfObjectDescription(data.mmsi));
  }, [data.mmsi]);

  useEffect(() => {
    setShipStatusDescription(getShipStatusDescription(data.navigation_status));
  }, [data.navigation_status]);

  return (
    <Popup className="ship-object-popup">
      {data.name != null && data.name.length > 0 && (
        <h1
          className="title "
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {objectType == TypeOfObject.Ship && (
            <Link to={"/vessel/" + data.mmsi}>{data.name}</Link>
          )}
          {objectType != TypeOfObject.Ship && (
            <React.Fragment>{data.name}</React.Fragment>
          )}
        </h1>
      )}
      {(data.name == null || data.name.length == 0) && objectTypeDescription && (
        <h1
          className="title "
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {objectType == TypeOfObject.Ship && (
            <Link to={"/vessel/" + data.mmsi}>{objectTypeDescription}</Link>
          )}
          {objectType != TypeOfObject.Ship && (
            <React.Fragment>{objectTypeDescription}</React.Fragment>
          )}
        </h1>
      )}
      {flagInformation != null &&
        (objectType === TypeOfObject.Ship ||
          objectType === TypeOfObject.CraftAssociatedWithParentShip) && (
          <p className="subtitle ais-object-subtitle-container">
            {flagInformation && (
              <img
                className="flag-img hide-text"
                src={flagInformation.img}
                alt={flagInformation.alt}
                title={shipCountryDescription}
              />
            )}
            {shipTypeDescription != null && (
              <React.Fragment>{shipTypeDescription}</React.Fragment>
            )}
          </p>
        )}
      {flagInformation != null && objectType === TypeOfObject.AidsToNavigation && (
        <p className="subtitle ais-object-subtitle-container">
          {flagInformation && (
            <img
              className="flag-img hide-text"
              src={flagInformation.img}
              alt={flagInformation.alt}
              title={shipCountryDescription}
            />
          )}
          {navAidTypeDescription != null && (
            <React.Fragment>{navAidTypeDescription}</React.Fragment>
          )}
        </p>
      )}
      {flagInformation != null &&
        objectType === TypeOfObject.SearchAndRescueAircraft && (
          <p className="subtitle ais-object-subtitle-container">
            {flagInformation && (
              <img
                className="flag-img hide-text"
                src={flagInformation.img}
                alt={flagInformation.alt}
                title={shipCountryDescription}
              />
            )}
            Aircraft
          </p>
        )}
      {flagInformation != null && objectType === TypeOfObject.BaseStations && (
        <p className="subtitle ais-object-subtitle-container">
          {flagInformation && (
            <img
              className="flag-img hide-text"
              src={flagInformation.img}
              alt={flagInformation.alt}
              title={shipCountryDescription}
            />
          )}
          {data.name != null && data.name.length > 0 && (
            <React.Fragment>{objectTypeDescription}</React.Fragment>
          )}
          {data.name == null && shipCountryDescription != null && (
            <React.Fragment>{shipCountryDescription}</React.Fragment>
          )}
        </p>
      )}
      <table className="table is-fullwidth is-striped is-bordered">
        <tbody>
          {data.mmsi != null && data.mmsi > 0 && (
            <tr>
              <td className="ship-object-popup-table-cell has-text-weight-bold">
                MMSI
              </td>
              <td className="ship-object-popup-table-cell">{data.mmsi}</td>
            </tr>
          )}
          {data.imo_number != null && data.imo_number > 0 && (
            <tr>
              <td className="ship-object-popup-table-cell has-text-weight-bold">
                IMO Number
              </td>
              <td className="ship-object-popup-table-cell">
                {data.imo_number}
              </td>
            </tr>
          )}
          {data.call_sign != null &&
            data.call_sign.length > 0 &&
            data.call_sign != "0" && (
              <tr>
                <td className="ship-object-popup-table-cell has-text-weight-bold">
                  Call Sign
                </td>
                <td className="ship-object-popup-table-cell">
                  {data.call_sign}
                </td>
              </tr>
            )}
          {data.destination != null && data.destination.trim().length > 0 && (
            <tr>
              <td className="ship-object-popup-table-cell has-text-weight-bold">
                Destination
              </td>
              <td className="ship-object-popup-table-cell">
                {data.destination}
              </td>
            </tr>
          )}
          {shipStatusDescription != null &&
            data.navigation_status < ShipStatus.Notdefined && (
              <tr>
                <td className="ship-object-popup-table-cell has-text-weight-bold">
                  Status
                </td>
                <td className="ship-object-popup-table-cell">
                  {shipStatusDescription}
                </td>
              </tr>
            )}
        </tbody>
      </table>
      {data.speed_over_ground != null &&
        data.course_over_ground != null &&
        data.draught != null && (
          <table className="table is-fullwidth is-striped is-bordered">
            <thead>
              <tr>
                {data.speed_over_ground != null && (
                  <th className="has-text-centered">Speed</th>
                )}
                {data.course_over_ground != null && (
                  <th className="has-text-centered">Course</th>
                )}
                {data.draught != null && (
                  <th className="has-text-centered">Draught</th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                {data.speed_over_ground != null && (
                  <td className="ship-object-popup-table-cell has-text-centered">
                    {data.speed_over_ground} kn
                  </td>
                )}
                {data.course_over_ground != null && (
                  <td className="ship-object-popup-table-cell has-text-centered">
                    {data.course_over_ground} °
                  </td>
                )}
                {data.draught != null && (
                  <td className="ship-object-popup-table-cell has-text-centered">
                    {data.draught} m
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        )}
      {data.updated != null && (
        <div className="has-text-centered source-information">
          Received{" "}
          <TimeAgo className="has-text-weight-bold" datetime={data.updated} />
          &nbsp;
          {data.station_name != null && (
            <React.Fragment>
              (Source:{" "}
              <span
                className="has-text-weight-bold"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Link to={`/station/${data.station_id}`}>
                  {data.station_name}
                </Link>
              </span>
              )
            </React.Fragment>
          )}
        </div>
      )}
    </Popup>
  );
}

export default AisObjectPopup;
