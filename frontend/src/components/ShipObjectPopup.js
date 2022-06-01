import { Popup } from "react-leaflet";
import "./ShipObjectPopup.css";
import { getShipTypeDescription } from "../shipTypes";
import { getCountryDescription, getFlagInformation } from "../mmsi";
import { getShipStatusDescription } from "../shipStatus";
import React, { useEffect, useState } from "react";

function ShipObjectPopup({ data }) {
  const [shipTypeDescription, setShipTypeDescription] = useState(null);
  const [shipCountryDescription, setShipCountryDescription] = useState(null);
  const [shipStatusDescription, setShipStatusDescription] = useState(null);
  const [flagInformation, setFlagInformation] = useState(null);

  useEffect(() => {
    setShipTypeDescription(getShipTypeDescription(data.ship_type));
  }, [data.ship_type]);

  useEffect(() => {
    setShipCountryDescription(getCountryDescription(data.mmsi));
    setFlagInformation(getFlagInformation(data.mmsi));
  }, [data.mmsi]);

  useEffect(() => {
    setShipStatusDescription(getShipStatusDescription(data.navigation_status));
  }, [data.navigation_status]);

  return (
    <Popup className="ship-object-popup">
      <h1 className="title ">{data.name}</h1>

      {flagInformation != null && shipTypeDescription != null && (
        <p className="subtitle ship-object-popup-table-title-container">
          {flagInformation && (
            <img className="flag-img" src={flagInformation.img} />
          )}
          {shipTypeDescription != null && (
            <React.Fragment>{shipTypeDescription}</React.Fragment>
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
          {data.call_sign != null && (
            <tr>
              <td className="ship-object-popup-table-cell has-text-weight-bold">
                Call Sign
              </td>
              <td className="ship-object-popup-table-cell">{data.call_sign}</td>
            </tr>
          )}
          {shipStatusDescription != null && shipStatusDescription > 0 && (
            <tr>
              <td className="ship-object-popup-table-cell has-text-weight-bold">
                Status
              </td>
              <td className="ship-object-popup-table-cell">
                {shipStatusDescription}
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
    </Popup>
  );
}

export default ShipObjectPopup;
