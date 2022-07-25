import { useParams } from "react-router-dom";
import { getShipTypeDescription } from "../shipTypes";
import {
  getCountryDescription,
  getFlagInformation,
  getTypeOfObject,
  getTypeOfObjectDescription,
  TypeOfObject,
} from "../mmsi";
import { getShipStatusDescription, ShipStatus } from "../shipStatus";
import "./Vessel.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Loading from "./Loading";
import { Link } from "react-router-dom";
import formatcoords from "formatcoords";
import AisMap from "./AisMap";
import TimeAgo from "timeago-react";

function Vessel() {
  let { mmsi } = useParams();
  const [vesselCountryDescription, setVesselCountryDescription] =
    useState(null);
  const [shipTypeDescription, setShipTypeDescription] = useState(null);
  const [flagInformation, setFlagInformation] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shipStatusDescription, setShipStatusDescription] = useState(null);
  const [shipCountryDescription, setShipCountryDescription] = useState(null);
  const [objectType, setObjectType] = useState(null);
  const [objectTypeDescription, setObjectTypeDescription] = useState(null);
  const [coordsDMS, setCoordsDMS] = useState(null);
  const [canShowMap, setCanShowMap] = useState(false);
  const [shipLength, setShipLength] = useState(null);
  const [shipBreadth, setShipBreadth] = useState(null);

  const objectLifeSpanMilliseconds =
    process.env.REACT_APP_MAP_OBJECT_LIFESPAN_HOURS * 3600000;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const result = await axios.get(
        process.env.REACT_APP_WEB_API_URL + "/vessel/" + mmsi,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setData(result.data);
      setShipTypeDescription(getShipTypeDescription(result.data.ship_type));
      setShipStatusDescription(
        getShipStatusDescription(result.data.navigation_status)
      );
      setFlagInformation(getFlagInformation(result.data.mmsi));
      setShipCountryDescription(getCountryDescription(result.data.mmsi));
      setFlagInformation(getFlagInformation(result.data.mmsi));
      setObjectType(getTypeOfObject(result.data.mmsi));
      setObjectTypeDescription(getTypeOfObjectDescription(result.data.mmsi));

      if (result.data.latitude != null && result.data.longitude != null) {
        setCoordsDMS(
          formatcoords(result.data.latitude, result.data.longitude).format({
            latLonSeparator: ", ",
            decimalPlaces: 0,
          })
        );
      }

      if (
        result.data.dimension_to_bow != null &&
        result.data.dimension_to_stern
      ) {
        setShipLength(
          result.data.dimension_to_bow + result.data.dimension_to_stern
        );
      }

      if (
        result.data.dimension_to_port != null &&
        result.data.dimension_to_starboard
      ) {
        setShipBreadth(
          result.data.dimension_to_port + result.data.dimension_to_starboard
        );
      }

      setIsLoading(false);
    };

    fetchData();
  }, [mmsi]);

  useEffect(() => {
    if (data) {
      setCanShowMap(
        data.latitude != null &&
          data.longitude != null &&
          new Date() - new Date(data.updated) <= objectLifeSpanMilliseconds
      );
    } else {
      setCanShowMap(false);
    }
  }, [data]);

  function handleDataUpdated(newData) {
    if (data != null && data.mmsi && newData != null && newData[data.mmsi]) {
      setData(newData[data.mmsi]);
    }
  }

  return (
    <React.Fragment>
      {isLoading ? (
        <Loading />
      ) : (
        data != null && (
          <section className="section-container ">
            <div>
              <h1 className="title">{data.name || objectTypeDescription}</h1>
              <p className="subtitle ais-object-subtitle-container mb-2">
                {flagInformation && (
                  <img
                    className="flag-img"
                    src={flagInformation.img}
                    alt={flagInformation.alt}
                    title={shipCountryDescription}
                  />
                )}
                <span>{shipTypeDescription}</span>
              </p>
              <hr className="mt-0 mb-2" />
              <div className="mb-4"></div>
            </div>
            <div className="columns">
              {canShowMap && (
                <div className="column map-column">
                  <AisMap
                    changeParamsLocation={false}
                    latitude={data.latitude}
                    longitude={data.longitude}
                    followMMSI={data.mmsi}
                    dataUpdatedCallback={handleDataUpdated}
                    zoom={13}
                  />
                </div>
              )}
              <div className="column">
                <table className="table is-fullwidth is-striped is-bordered">
                  <tbody>
                    {data.mmsi != null && data.mmsi > 0 && (
                      <tr>
                        <td className=" has-text-weight-bold">MMSI</td>
                        <td className="">{data.mmsi}</td>
                      </tr>
                    )}
                    {data.imo_number != null && data.imo_number > 0 && (
                      <tr>
                        <td className=" has-text-weight-bold">IMO Number</td>
                        <td className="">{data.imo_number}</td>
                      </tr>
                    )}
                    {data.call_sign != null &&
                      data.call_sign.length > 0 &&
                      data.call_sign != "0" && (
                        <tr>
                          <td className=" has-text-weight-bold">Call Sign</td>
                          <td className="">{data.call_sign}</td>
                        </tr>
                      )}
                    {data.destination != null &&
                      data.destination.trim().length > 0 && (
                        <tr>
                          <td className=" has-text-weight-bold">Destination</td>
                          <td className="">{data.destination}</td>
                        </tr>
                      )}
                    {shipStatusDescription != null &&
                      data.navigation_status < ShipStatus.Notdefined && (
                        <tr>
                          <td className=" has-text-weight-bold">Status</td>
                          <td className="">{shipStatusDescription}</td>
                        </tr>
                      )}
                    {shipLength != null && shipBreadth != null && (
                      <tr>
                        <td className=" has-text-weight-bold">Dimensions</td>
                        <td className="">
                          {shipLength} m x {shipBreadth} m
                        </td>
                      </tr>
                    )}

                    {data.speed_over_ground != null && (
                      <tr>
                        <td className="has-text-weight-bold">Speed</td>
                        <td className="">{data.speed_over_ground} kn</td>
                      </tr>
                    )}
                    {data.course_over_ground != null && (
                      <tr>
                        <td className="has-text-weight-bold">Course</td>
                        <td className="">{data.course_over_ground} °</td>
                      </tr>
                    )}
                    {data.draught != null && (
                      <tr>
                        <td className="has-text-weight-bold">Draught</td>
                        <td className="">{data.draught} m</td>
                      </tr>
                    )}
                    {coordsDMS != null && (
                      <tr>
                        <td className="has-text-weight-bold">Position</td>
                        <td className="">{coordsDMS}</td>
                      </tr>
                    )}
                    {data.updated != null && (
                      <tr>
                        <td className="has-text-weight-bold">Updated</td>
                        <td className="updated-time-ago-cell">
                          <TimeAgo datetime={data.updated} />
                        </td>
                      </tr>
                    )}
                    {data.station_name != null && (
                      <tr>
                        <td className="has-text-weight-bold">Source</td>
                        <td
                          className=""
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <Link to={`/station/${data.station_id}`}>
                            {data.station_name}
                          </Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )
      )}
    </React.Fragment>
  );
}

export default Vessel;
