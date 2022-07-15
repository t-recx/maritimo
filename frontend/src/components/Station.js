import "./Station.css";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Loading from "./Loading";
import { useParams } from "react-router-dom";
import {
  getCountryDescriptionByCountryCode,
  getFlagInformationByCountryCode,
} from "../mmsi";
import AisMap from "./AisMap";

function Station() {
  let { stationId } = useParams();

  const [stationCountryDescription, setStationCountryDescription] =
    useState(null);
  const [flagInformation, setFlagInformation] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const result = await axios.get(
        process.env.REACT_APP_WEB_API_URL + "/station/" + stationId,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setData(result.data);
      setStationCountryDescription(
        getCountryDescriptionByCountryCode(result.data.countryCode)
      );
      setFlagInformation(
        getFlagInformationByCountryCode(result.data.countryCode)
      );
      setIsLoading(false);
    };

    fetchData();
  }, [stationId]);

  return (
    <React.Fragment>
      {isLoading ? (
        <Loading />
      ) : (
        data != null && (
          <section className="station-section">
            <div>
              <h1 className="title">{data.name}</h1>
              <p className="subtitle ais-object-subtitle-container">
                {flagInformation && (
                  <img
                    className="flag-img"
                    src={flagInformation.img}
                    alt={flagInformation.alt}
                    title={stationCountryDescription}
                  />
                )}
                <span>Station</span>
              </p>
              <hr />
              <p>
                <span className="has-text-weight-bold">Operator:</span>{" "}
                {data.stationOperatorHomepage != null && (
                  <span>
                    <a href={data.stationOperatorHomepage} target="_blank">
                      {data.stationOperatorName}
                    </a>
                  </span>
                )}
                {data.stationOperatorHomepage == null && (
                  <span>{data.stationOperatorName}</span>
                )}
              </p>
              {data.equipmentDescription != null && (
                <p>
                  <span className="has-text-weight-bold">Equipment:</span>{" "}
                  <span>{data.equipmentDescription}</span>
                </p>
              )}
              <hr />
            </div>
            <div className="station-map-container">
              <AisMap
                changeParamsLocation={false}
                latitude={
                  data.latitude ||
                  process.env.REACT_APP_MAP_INITIAL_CENTER_LATITUDE
                }
                longitude={
                  data.longitude ||
                  process.env.REACT_APP_MAP_INITIAL_CENTER_LONGITUDE
                }
                zoom={8}
              />
            </div>
          </section>
        )
      )}
    </React.Fragment>
  );
}

export default Station;
