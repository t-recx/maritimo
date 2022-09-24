import "./Station.css";

import React, { useState, useEffect } from "react";
import Loading from "./Loading";
import { useParams } from "react-router-dom";
import {
  getCountryDescriptionByCountryCode,
  getFlagInformationByCountryCode,
} from "../mmsi";
import AisMap from "./AisMap";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NotFound from "./NotFound";
import http from "../http";
import PhotoThumbnailAis from "./PhotoThumbnailAis";
import formatcoords from "formatcoords";

function Station({ alert }) {
  let { stationId } = useParams();

  const [stationCountryDescription, setStationCountryDescription] =
    useState(null);
  const [flagInformation, setFlagInformation] = useState(null);
  const [data, setData] = useState(null);
  const [mmsi, setMMSI] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMissing, setIsMissing] = useState(false);
  const [coordsDMS, setCoordsDMS] = useState(null);
  const [homepageLabel, setHomepageLabel] = useState(null);
  const [homepageUrl, setHomepageUrl] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);

      http.plain
        .get("/station/" + stationId)
        .then((result) => {
          if (result?.data) {
            setData(result.data);
            setMMSI(result.data.mmsi);
            setStationCountryDescription(
              getCountryDescriptionByCountryCode(result.data.countryCode)
            );
            setFlagInformation(
              getFlagInformationByCountryCode(result.data.countryCode)
            );
            setIsMissing(false);

            let homepage = null;

            if (result?.data?.homepage) {
              homepage = result?.data?.homepage;
            } else if (result?.data?.stationOperatorHomepage) {
              homepage = result?.data?.stationOperatorHomepage;
            }

            setHomepageUrl(homepage);

            if (homepage) {
              setHomepageLabel(
                homepage
                  .replace("https://www.", "")
                  .replace("http://www.", "")
                  .replace("https://", "")
                  .replace("http://", "")
              );
            } else {
              setHomepageLabel(null);
            }

            setCoords(result.data.latitude, result.data.longitude);
          }
        })
        .catch((error) => {
          setIsMissing(error.response.status == 404);

          if (error.response.status != 404) {
            alert(
              "danger",
              "Unable to display station, please try again later."
            );
          }
        })
        .then(() => setIsLoading(false));
    };

    fetchData();
  }, [stationId]);

  function setCoords(latitude, longitude) {
    if (latitude != null && longitude != null) {
      setCoordsDMS(
        formatcoords(latitude, longitude).format({
          latLonSeparator: ", ",
          decimalPlaces: 0,
        })
      );
    }
  }

  function handleDataUpdated(newData) {
    if (data != null && data.mmsi && newData != null && newData[data.mmsi]) {
      setCoords(newData[data.mmsi].latitude, newData[data.mmsi].longitude);
    }
  }

  return (
    <React.Fragment>
      {isMissing ? (
        <NotFound />
      ) : isLoading ? (
        <Loading />
      ) : (
        data != null && (
          <section className="section-container ">
            <div className="container">
              <div className="">
                <div>
                  <h1 className="title">{data.name}</h1>
                  <p className="subtitle ais-object-subtitle-container mb-2">
                    {flagInformation && (
                      <img
                        className="flag-img"
                        src={flagInformation.img}
                        alt={flagInformation.alt}
                        title={stationCountryDescription}
                      />
                    )}
                    {mmsi != null && <span>Roaming station</span>}
                    {mmsi == null && <span>Station</span>}
                    <span className="icon-text has-text-weight-bold ml-auto ">
                      <span
                        className={
                          "icon " +
                          (data.online ? "has-text-success" : "has-text-danger")
                        }
                      >
                        <FontAwesomeIcon icon={faPowerOff} size="sm" />
                      </span>
                      <span>{data.online ? "Online" : "Offline"}</span>
                    </span>
                  </p>
                  <hr className="mt-0 mb-2" />
                  <div className="mb-4"></div>
                </div>
              </div>
              <div className="columns">
                <div className="column is-two-fifths">
                  <div className="card">
                    <div className="card-image">
                      <PhotoThumbnailAis
                        alert={alert}
                        stationId={data?.stationId}
                      />
                    </div>
                    <div className="card-content">
                      <table className="table table-station-information is-fullwidth is-striped is-bordered">
                        <tbody>
                          {data.stationOperatorName != null && (
                            <tr>
                              <td className="td-station-field has-text-weight-bold">
                                Operator
                              </td>
                              <td className="">{data.stationOperatorName}</td>
                            </tr>
                          )}
                          {homepageUrl != null && (
                            <tr>
                              <td className="td-station-field  has-text-weight-bold">
                                Homepage
                              </td>
                              <td className="td-ellipsis">
                                <a
                                  href={homepageUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {homepageLabel}
                                </a>
                              </td>
                            </tr>
                          )}
                          {data.mmsi != null && (
                            <tr>
                              <td className="td-station-field has-text-weight-bold">
                                MMSI
                              </td>
                              <td className="">{data.mmsi}</td>
                            </tr>
                          )}
                          {coordsDMS != null && (
                            <tr>
                              <td className="td-station-field has-text-weight-bold">
                                Location
                              </td>
                              <td className="">{coordsDMS}</td>
                            </tr>
                          )}
                          {data.equipmentDescription != null && (
                            <tr>
                              <td className="td-station-field has-text-weight-bold">
                                Equipment
                              </td>
                              <td className="td-equipment-description">
                                {data.equipmentDescription}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="column ">
                  <div className="card">
                    <div className="card-content station-map-container">
                      <AisMap
                        changeParamsLocation={false}
                        alert={alert}
                        zoom={8}
                        latitude={
                          data.latitude ||
                          process.env.REACT_APP_MAP_INITIAL_CENTER_LATITUDE
                        }
                        longitude={
                          data.longitude ||
                          process.env.REACT_APP_MAP_INITIAL_CENTER_LONGITUDE
                        }
                        dataUpdatedCallback={handleDataUpdated}
                        followMMSI={mmsi}
                        stations={mmsi ? null : [data]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      )}
    </React.Fragment>
  );
}

export default Station;
