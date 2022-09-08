import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { FlagsByMid, getCountryDescription, getFlagInformation } from "../mmsi";
import http from "../http";
import {
  getCountryDescriptionByCountryCode,
  getFlagInformationByCountryCode,
} from "../mmsi";
import Loading from "./Loading";
import Pagination from "./Pagination";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Stations.css";

function Stations({ alert }) {
  const [search, setSearch] = useSearchParams();
  const [stations, setStations] = useState(null);
  const [pageNumber, setPageNumber] = useState(null);
  const [pageSize, setPageSize] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchCountryCodes, setSearchCountryCodes] = useState("");
  const [searchOperators, setSearchOperators] = useState("");
  const [searchText, setSearchText] = useState("");
  const [countryCodeFilterDataSource, setCountryCodeFilterDataSource] =
    useState(null);
  const [operatorsDataSource, setOperatorsDataSource] = useState(null);
	const [loadingTimes, setLoadingTimes] = useState(0);
	const latestLoadingTimes = useRef(null);

  const location = useLocation();

  const navigate = useNavigate();

  latestLoadingTimes.current = loadingTimes;

  // todo: extract code from views to avoid repetition:
  useEffect(() => {
    let dataSource = null;

    const flagsEntries = Object.entries(FlagsByMid);
    const countries = [
      ...new Set(Object.values(FlagsByMid).map((x) => x.country)),
    ];

    dataSource = countries
      .map((country) => [
        flagsEntries
          .filter((x) => x[1].country == country)
          .map((x) => x[0])
          .join(","),
        country,
      ])
      .sort((a, b) => a[1].localeCompare(b[1]));

    setCountryCodeFilterDataSource(dataSource);
  }, []);

  useEffect(() => {
    let params = getFromSearch();

    setPageNumber(params.paramPageNumber);
    setPageSize(params.paramPageSize);

    setSearchCountryCodes(params.paramCountryCodes || "");

    setSearchOperators(params.paramOperators || "");
    setSearchText(params.paramSearchText || "");
  }, [search]);

  function getFromSearch() {
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

    let paramCountryCodes = search.get("countryCodes");

    if (paramCountryCodes == null || paramCountryCodes.toString().length == 0) {
      paramCountryCodes = null;
    }

    let paramOperators = search.get("operators");

    if (paramOperators == null || paramOperators.toString().length == 0) {
      paramOperators = null;
    }
    let paramSearchText = search.get("text");

    if (paramSearchText == null || paramSearchText.length == 0) {
      paramSearchText = null;
    }

    return {
      paramPageNumber: paramPageNumber,
      paramPageSize: paramPageSize,
      paramSearchText: paramSearchText,
      paramOperators: paramOperators,
      paramCountryCodes: paramCountryCodes,
    };
  }

  function getParams() {
    let paramsFromSearch = getFromSearch();

    return {
      pageNumber: paramsFromSearch.paramPageNumber,
      pageSize: paramsFromSearch.paramPageSize,
      countryCodes: paramsFromSearch.paramCountryCodes,
      operators: paramsFromSearch.paramOperators,
      text: paramsFromSearch.paramSearchText,
    };
  }

  useEffect(() => {
	latestLoadingTimes.current = (latestLoadingTimes.current || 0) + 1;
	setLoadingTimes(latestLoadingTimes.current);
	setIsLoading(latestLoadingTimes.current > 0);

    http.plain
      .get("/stationOperator", {
      })
      .then((result) => {
        setOperatorsDataSource(result.data);
      })
      .catch((error) => {
        alert("danger", "Unable to load operators, please try again later.");
      })
      .then(() => {
		latestLoadingTimes.current = (latestLoadingTimes.current || 0) - 1;
		setLoadingTimes(latestLoadingTimes.current);
		setIsLoading(latestLoadingTimes.current > 0);
      });
  }, []);

  useEffect(() => {
	latestLoadingTimes.current = (latestLoadingTimes.current || 0) + 1;
	setLoadingTimes(latestLoadingTimes.current);
	setIsLoading(latestLoadingTimes.current > 0);

    http.plain
      .get("/station", {
        params: getParams(),
      })
      .then((result) => {
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
      })
      .catch((error) => {
        alert("danger", "Unable to display stations, please try again later.");
      })
      .then(() => {
		latestLoadingTimes.current = (latestLoadingTimes.current || 0) - 1;
		setLoadingTimes(latestLoadingTimes.current);
		setIsLoading(latestLoadingTimes.current > 0);
      });
  }, [search]);

  function navigateToStation(id) {
    navigate("/station/" + id);
  }

  function handleCountryCodeChange(event) {
    setSearchCountryCodes(event.target.value);
  }

  function handleTextSearchChange(event) {
    setSearchText(event.target.value);
  }

  function handleKeyDownSearch(event) {
    if (event.key === "Enter") {
      searchData();
    }
  }

  function handleOperatorChange(event) {
    setSearchOperators(event.target.value);
  }

  function searchData() {
    let updatedSearch = {};

    if (searchCountryCodes) {
      updatedSearch = {
        ...updatedSearch,
        countryCodes: searchCountryCodes,
      };
    }

    if (searchOperators) {
      updatedSearch = {
        ...updatedSearch,
        operators: searchOperators,
      };
    }

    if (searchText && searchText.length > 0) {
      updatedSearch = { ...updatedSearch, text: searchText };
    }

    if (search.get("pageNumber")) {
      updatedSearch = {
        ...updatedSearch,
        pageNumber: 1,
      };
    }

    if (search.get("pageSize")) {
      updatedSearch = { ...updatedSearch, pageSize: search.get("pageSize") };
    }

    setSearch(updatedSearch, { replace: true });
  }

  function resetSearchFilters() {
    setSearchCountryCodes("");
    setSearchOperators("");
    setSearchText("");
  }

  return (
    <React.Fragment>
      {isLoading && <Loading />}
      <section className="section-container">
        <div className="container">
          <h1 className="title">Stations</h1>
          {stations != null && stations.items != null && (
            <React.Fragment>
              <div className="box">
                <div className="columns">
                  <div className="column is-one-quarter">
                    <div className="field">
                      <label className="label">Country</label>
                      <div className="control">
                        <div className="select is-fullwidth">
                          <select
                            value={searchCountryCodes}
                            onChange={handleCountryCodeChange}
                            onKeyDown={handleKeyDownSearch}
                          >
                            <option value=""></option>
                            {countryCodeFilterDataSource.map((x) => (
                              <option key={x[0]} value={x[0]}>
                                {x[1]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="column is-one-quarter">
                    <div className="field">
                      <label className="label">Operator</label>
                      <div className="control">
                        <div className="select is-fullwidth">
                          <select
                            value={searchOperators}
                            onChange={handleOperatorChange}
                            onKeyDown={handleKeyDownSearch}
                          >
                            <option value=""></option>
                            {operatorsDataSource && operatorsDataSource.map((x) => (
                              <option key={x.stationOperatorId} value={x.stationOperatorId}>
                                {x.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="column">
                    <div className="field">
                      <label className="label">Name</label>
                      <div className="control">
                        <input
                          className="input"
                          type="text"
                          placeholder=""
                          value={searchText}
                          onChange={handleTextSearchChange}
                          onKeyDown={handleKeyDownSearch}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="field is-grouped is-justify-content-end">
                  <div className="control">
                    <button className="button is-link" onClick={searchData}>
                      <span className="icon">
                        <FontAwesomeIcon icon={faMagnifyingGlass} size="sm" />
                      </span>
                      <span>Search</span>
                    </button>
                  </div>
                  <div className="control">
                    <button
                      className="button is-link is-light"
                      onClick={resetSearchFilters}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
              {stations.items.length > 0 && (
                <React.Fragment>
                  <table className="table table-stations is-striped is-fullwidth is-bordered  is-hoverable">
                    <thead>
                      <tr>
                        <th className="th-station-id ">ID</th>
                        <th className="is-hidden-mobile">Country</th>
                        <th>Name</th>
                        <th className="is-hidden-mobile">Operator</th>
                        <th className="th-station-status is-hidden-mobile">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stations.items.map((item) => (
                        <tr
                          className="is-clickable"
                          key={item.stationId}
                          onClick={() => navigateToStation(item.stationId)}
                        >
                          <td className="td-station ">{item.stationId}</td>
                          <td className="td-station td-country is-hidden-mobile">
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
                          <td className="td-station ">
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
                                className="with-ellipsis"
                                title={item.name}
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
                          <td className="is-hidden-mobile td-station ">
                            {item.stationOperatorName}
                          </td>
                          <td
                            className={
                              "is-hidden-mobile has-text-weight-bold td-station " +
                              (item.online
                                ? "has-text-success"
                                : "has-text-danger")
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
              {stations.items.length == 0 && (
                <div className="box has-text-weight-bold">
                  No stations found.
                </div>
              )}
            </React.Fragment>
          )}
        </div>
      </section>
    </React.Fragment>
  );
}

export default Stations;
