import { useParams } from "react-router-dom";
import {
  getCountryDescription,
  getFlagInformation,
  getTypeOfObject,
  getTypeOfObjectDescription,
  TypeOfObject,
} from "../mmsi";
import "./NavigationAid.css";
import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import { Link } from "react-router-dom";
import formatcoords from "formatcoords";
import AisMap from "./AisMap";
import TimeAgo from "timeago-react";
import NotFound from "./NotFound";
import http from "../http";
import { getNavAidTypeDescription } from "../navAids";

function NavigationAid({ alert }) {
  let { mmsi } = useParams();
  const [navigationAidCountryDescription, setNavigationAidCountryDescription] =
    useState(null);
  const [navigationAidTypeDescription, setNavigationAidTypeDescription] =
    useState(null);
  const [flagInformation, setFlagInformation] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMissing, setIsMissing] = useState(false);
  const [objectType, setObjectType] = useState(null);
  const [objectTypeDescription, setObjectTypeDescription] = useState(null);
  const [coordsDMS, setCoordsDMS] = useState(null);
  const [canShowMap, setCanShowMap] = useState(false);
  const [navigationAidLength, setNavigationAidLength] = useState(null);
  const [navigationAidBreadth, setNavigationAidBreadth] = useState(null);

  const objectLifeSpanMilliseconds =
    process.env.REACT_APP_MAP_OBJECT_LIFESPAN_HOURS * 3600000;

  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true);

      http.plain
        .get("/navigationAid/" + mmsi)
        .then((result) => {
          if (result?.data) {
            setData(result.data);

            setNavigationAidTypeDescription(
              getNavAidTypeDescription(result.data.aid_type)
            );
            setFlagInformation(getFlagInformation(result.data.mmsi));
            setNavigationAidCountryDescription(
              getCountryDescription(result.data.mmsi)
            );
            setFlagInformation(getFlagInformation(result.data.mmsi));
            setObjectType(getTypeOfObject(result.data.mmsi));
            setObjectTypeDescription(
              getTypeOfObjectDescription(result.data.mmsi)
            );

            if (result.data.latitude != null && result.data.longitude != null) {
              setCoordsDMS(
                formatcoords(
                  result.data.latitude,
                  result.data.longitude
                ).format({
                  latLonSeparator: ", ",
                  decimalPlaces: 0,
                })
              );
            }

            if (
              result.data.dimension_to_bow != null &&
              result.data.dimension_to_stern != null
            ) {
              setNavigationAidLength(
                result.data.dimension_to_bow + result.data.dimension_to_stern
              );
            }

            if (
              result.data.dimension_to_port != null &&
              result.data.dimension_to_starboard != null
            ) {
              setNavigationAidBreadth(
                result.data.dimension_to_port +
                  result.data.dimension_to_starboard
              );
            }

            setIsMissing(false);
          }
        })
        .catch((error) => {
          setIsMissing(error.response.status == 404);

          if (error.response.status != 404) {
            alert(
              "danger",
              "Unable to display navigation aid, please try again later."
            );
          }
        })
        .then(() => setIsLoading(false));
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
      {isMissing ? (
        <NotFound />
      ) : isLoading ? (
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
                    title={navigationAidCountryDescription}
                  />
                )}
                <span>{navigationAidTypeDescription}</span>
              </p>
              <hr className="mt-0 mb-2" />
              <div className="mb-4"></div>
            </div>
            {canShowMap && (
              <div className="block navigation-aid-map-block">
                <AisMap
                  alert={alert}
                  changeParamsLocation={false}
                  latitude={data.latitude}
                  longitude={data.longitude}
                  followMMSI={data.mmsi}
                  dataUpdatedCallback={handleDataUpdated}
                  zoom={13}
                />
              </div>
            )}
            <div className="block">
              <table className="table is-fullwidth is-striped is-bordered">
                <tbody>
                  {data.mmsi != null && data.mmsi > 0 && (
                    <tr>
                      <td className=" has-text-weight-bold">MMSI</td>
                      <td className="">{data.mmsi}</td>
                    </tr>
                  )}
                  {navigationAidLength > 0 && navigationAidBreadth > 0 && (
                    <tr>
                      <td className=" has-text-weight-bold">Dimensions</td>
                      <td className="">
                        {navigationAidLength} m x {navigationAidBreadth} m
                      </td>
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
          </section>
        )
      )}
    </React.Fragment>
  );
}

export default NavigationAid;
