import { Popup } from "react-leaflet";
import "./ShipObjectPopup.css";
import { getShipTypeDescription } from "../shipTypes";
import { getCountryDescription } from "../mmsi";
import { getShipStatusDescription } from "../shipStatus";
import { useEffect, useState } from "react";

function ShipObjectPopup({ data }) {
  const [shipTypeDescription, setShipTypeDescription] = useState(null);
  const [shipCountryDescription, setShipCountryDescription] = useState(null);
  const [shipStatusDescription, setShipStatusDescription] = useState(null);

  useEffect(() => {
    setShipTypeDescription(getShipTypeDescription(data.ship_type));
  }, [data.ship_type]);

  useEffect(() => {
    setShipCountryDescription(getCountryDescription(data.mmsi));
  }, [data.mmsi]);

  useEffect(() => {
    setShipStatusDescription(getShipStatusDescription(data.navigation_status));
  }, [data.navigation_status]);

  return (
    <Popup className="ship-object-popup">
      <h1 className="title ship-object-popup-table-title">{data.name}</h1>
      <p className="subtitle">MMSI: {data.mmsi}</p>
      <table className="table is-fullwidth is-striped is-bordered">
        <tbody>
          {shipCountryDescription != null && (
            <tr>
              <td className="ship-object-popup-table-cell has-text-weight-bold">
                Country
              </td>
              <td className="ship-object-popup-table-cell">
                {shipCountryDescription}
              </td>
            </tr>
          )}
          {shipTypeDescription != null && (
            <tr>
              <td className="ship-object-popup-table-cell has-text-weight-bold">
                Ship Type
              </td>
              <td className="ship-object-popup-table-cell">
                {shipTypeDescription}
              </td>
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
          {shipStatusDescription != null && (
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
          {data.speed_over_ground != null && data.course_over_ground == null && (
            <tr>
              <td className="ship-object-popup-table-cell has-text-weight-bold">
                Speed
              </td>
              <td className="ship-object-popup-table-cell has-text-right">
                {data.speed_over_ground} kn
              </td>
            </tr>
          )}
          {data.course_over_ground != null && data.speed_over_ground == null && (
            <tr>
              <td className="ship-object-popup-table-cell has-text-weight-bold">
                Course
              </td>
              <td className="ship-object-popup-table-cell has-text-right">
                {data.course_over_ground} °
              </td>
            </tr>
          )}
          {data.speed_over_ground != null && data.course_over_ground != null && (
            <tr>
              <td className="ship-object-popup-table-cell has-text-weight-bold">
                Speed / Course
              </td>
              <td className="ship-object-popup-table-cell has-text-right">
                {data.speed_over_ground} kn / {data.course_over_ground} °
              </td>
            </tr>
          )}
          {data.draught != null && (
            <tr>
              <td className="ship-object-popup-table-cell has-text-weight-bold">
                Draught
              </td>
              <td className="ship-object-popup-table-cell has-text-right">
                {data.draught} m
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Popup>
  );
}

export default ShipObjectPopup;
