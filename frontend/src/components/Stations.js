import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  getCountryDescriptionByCountryCode,
  getFlagInformationByCountryCode,
} from "../mmsi";
import Loading from "./Loading";
import Pagination from "./Pagination";

function Stations() {
  const [search] = useSearchParams();
  const [stations, setStations] = useState(null);
  const [pageNumber, setPageNumber] = useState(null);
  const [pageSize, setPageSize] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    let paramPageNumber = parseInt(search.get("pageNumber"));

    if (
      paramPageNumber == null ||
      Number.isNaN(paramPageNumber) ||
      paramPageNumber <= 0
    ) {
      paramPageNumber = 1;
    }

    let paramPageSize = parseInt(search.get("pageSize"));

    if (
      paramPageSize == null ||
      Number.isNaN(paramPageSize) ||
      paramPageSize <= 0
    ) {
      paramPageSize = 10;
    }

    setPageNumber(paramPageNumber);
    setPageSize(paramPageSize);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        if (pageNumber != null && pageSize != null) {
          setIsLoading(true);
          const result = await axios.get(
            process.env.REACT_APP_WEB_API_URL + "/station",
            {
              withCredentials: true,
              params: {
                pageNumber: pageNumber,
                pageSize: pageSize,
              },
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          setStations(result.data);
          setTotalPages(result.data.totalPages);
          if (result.data && result.data.items) {
            result.data.items.forEach((dto) => {
              dto.countryName = getCountryDescriptionByCountryCode(
                dto.countryCode
              );
              dto.flagInformation = getFlagInformationByCountryCode(
                dto.countryCode
              );
            });
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();

    return () => controller.abort();
  }, [pageNumber, pageSize]);

  function navigateToStation(id) {
    navigate("/station/" + id);
  }

  return (
    <React.Fragment>
      {isLoading && <Loading />}
      <section className="section-container">
        <h1 className="title">Stations</h1>
        {stations != null && stations.items != null && (
          <React.Fragment>
            <table className="table is-striped is-fullwidth is-bordered  is-hoverable">
              <thead>
                <tr>
                  <th className="th-station-id ">ID</th>
                  <th className="is-hidden-mobile">Country</th>
                  <th>Name</th>
                  <th className="is-hidden-mobile">Operator</th>
                  <th className="th-station-status is-hidden-mobile">Status</th>
                </tr>
              </thead>
              <tbody>
                {stations.items.map((item) => (
                  <tr
                    className="is-clickable"
                    key={item.stationId}
                    onClick={() => navigateToStation(item.stationId)}
                  >
                    <td className="">{item.stationId}</td>
                    <td className="td-country is-hidden-mobile">
                      {item.flagInformation && (
                        <img
                          className="flag-img-tiny"
                          src={item.flagInformation.img}
                          alt={item.flagInformation.alt}
                          title={item.countryName}
                        />
                      )}
                      {item.countryName && (
                        <span
                          className="country-name is-hidden-mobile"
                          title={item.countryName}
                        >
                          {item.countryName}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="name-container">
                        {item.flagInformation && (
                          <img
                            className="flag-img-tiny is-hidden-tablet"
                            src={item.flagInformation.img}
                            alt={item.flagInformation.alt}
                            title={item.countryName}
                          />
                        )}
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <Link to={"/station/" + item.stationId}>
                            {item.name}
                          </Link>
                        </span>
                      </div>
                    </td>
                    <td className="is-hidden-mobile">
                      {item.stationOperatorName}
                    </td>
                    <td
                      className={
                        "is-hidden-mobile has-text-weight-bold " +
                        (item.online ? "has-text-success" : "has-text-danger")
                      }
                    >
                      {item.online ? "Online" : "Offline"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              location={location}
              searchParams={search}
              pageNumberParamName="pageNumber"
              pageNumber={pageNumber}
              totalPages={totalPages}
            />
          </React.Fragment>
        )}
      </section>
    </React.Fragment>
  );
}

export default Stations;
