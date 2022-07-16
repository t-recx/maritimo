import { Popup } from "react-leaflet";
import "./AisStationPopup.css";
import React, { useEffect, useState } from "react";
import {
  getCountryDescriptionByCountryCode,
  getFlagInformationByCountryCode,
} from "../mmsi";

function AisObjectPopup({ data }) {
  const [stationCountryDescription, setStationCountryDescription] =
    useState(null);
  const [flagInformation, setFlagInformation] = useState(null);

  useEffect(() => {
    setStationCountryDescription(
      getCountryDescriptionByCountryCode(data.countryCode)
    );
    setFlagInformation(getFlagInformationByCountryCode(data.countryCode));
  }, [data]);

  return (
    <Popup className="station-object-popup">
      <h1 className="title ">{data.name}</h1>
      {flagInformation != null && (
        <p className="subtitle ais-object-subtitle-container">
          {flagInformation && (
            <img
              className="flag-img hide-text"
              src={flagInformation.img}
              alt={flagInformation.alt}
              title={stationCountryDescription}
            />
          )}
          <React.Fragment>Station</React.Fragment>
        </p>
      )}
      <table className="table is-fullwidth is-striped is-bordered station-object-popup-table">
        <tbody>
          {data.stationOperatorHomepage != null && (
            <tr>
              <td className="station-object-popup-table-cell has-text-weight-bold">
                Operator
              </td>
              <td className="station-object-popup-table-cell station-object-popup-table-cell-value">
                <a
                  href={data.stationOperatorHomepage}
                  target="_blank"
                  rel="noreferrer"
                >
                  {data.stationOperatorName}
                </a>
              </td>
            </tr>
          )}
          {data.stationOperatorHomepage == null && (
            <tr>
              <td className="station-object-popup-table-cell has-text-weight-bold">
                Operator
              </td>
              <td
                title={data.stationOperatorName}
                className="station-object-popup-table-cell station-object-popup-table-cell-value"
              >
                {data.stationOperatorName}
              </td>
            </tr>
          )}
          {data.equipmentDescription != null && (
            <tr>
              <td className="station-object-popup-table-cell has-text-weight-bold">
                Equipment
              </td>
              <td
                title={data.equipmentDescription}
                className="station-object-popup-table-cell station-object-popup-table-cell-value"
              >
                {data.equipmentDescription}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Popup>
  );
}

export default AisObjectPopup;
