import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { FlagsByMid, getCountryDescription, getFlagInformation } from "../mmsi";
import Loading from "./Loading";
import Pagination from "./Pagination";
import "./NavigationAids.css";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import http from "../http";
import { NavAidTypeDescriptions, getNavAidTypeDescription } from "../navAids";

function NavigationAids({ alert }) {
  const [search, setSearch] = useSearchParams();
  const location = useLocation();
  const [pageNumber, setPageNumber] = useState(null);
  const [pageSize, setPageSize] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [navigationAids, setNavigationAids] = useState(null);
  const [searchCountryCodes, setSearchCountryCodes] = useState("");
  const [searchNavigationAidTypes, setSearchNavigationAidTypes] = useState("");
  const [searchText, setSearchText] = useState("");
  const [countryCodeFilterDataSource, setCountryCodeFilterDataSource] =
    useState(null);
  const [navigationAidTypesDataSource, setNavigationAidTypesDataSource] =
    useState(null);

  const navigate = useNavigate();

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
    let dataSource = Object.keys(NavAidTypeDescriptions).map((key) => [
      key,
      NavAidTypeDescriptions[key],
    ]);

    setNavigationAidTypesDataSource(dataSource);
  }, []);

  useEffect(() => {
    let params = getFromSearch();

    setPageNumber(params.paramPageNumber);
    setPageSize(params.paramPageSize);

    setSearchCountryCodes(params.paramCountryCodes || "");

    setSearchNavigationAidTypes(params.paramNavigationAidTypes || "");
    setSearchText(params.paramSearchText || "");
  }, [search]);

  useEffect(() => {
    fetchData();
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
    let paramNavigationAidTypes = search.get("navigationAidTypes");

    if (
      paramNavigationAidTypes == null ||
      paramNavigationAidTypes.toString().length == 0
    ) {
      paramNavigationAidTypes = null;
    }
    let paramSearchText = search.get("text");

    if (paramSearchText == null || paramSearchText.length == 0) {
      paramSearchText = null;
    }

    return {
      paramPageNumber: paramPageNumber,
      paramPageSize: paramPageSize,
      paramSearchText: paramSearchText,
      paramNavigationAidTypes: paramNavigationAidTypes,
      paramCountryCodes: paramCountryCodes,
    };
  }

  function getParams() {
    let paramsFromSearch = getFromSearch();

    return {
      pageNumber: paramsFromSearch.paramPageNumber,
      pageSize: paramsFromSearch.paramPageSize,
      countryCodes: paramsFromSearch.paramCountryCodes,
      aidTypes: paramsFromSearch.paramNavigationAidTypes,
      text: paramsFromSearch.paramSearchText,
    };
  }

  function fetchData() {
    setIsLoading(true);

    http.plain
      .get("/navigationAid", {
        params: getParams(),
      })
      .then((result) => {
        if (result?.data) {
          setNavigationAids(result.data);
          setTotalPages(result.data.totalPages);
          if (result.data && result.data.items) {
            result.data.items.forEach((dto) => {
              dto.countryName = getCountryDescription(dto.mmsi);
              dto.flagInformation = getFlagInformation(dto.mmsi);
              dto.navigationAidTypeDescription = getNavAidTypeDescription(
                dto.aid_type
              );
            });
          }
        }
      })
      .catch((error) => {
        alert(
          "danger",
          "Unable to display navigation aids, please try again later."
        );
      })
      .then(() => {
        setIsLoading(false);
      });
  }

  function navigateToNavigationAid(mmsi) {
    navigate("/navigation-aid/" + mmsi);
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

  function handleNavigationAidTypeChange(event) {
    setSearchNavigationAidTypes(event.target.value);
  }

  function searchData() {
    let updatedSearch = {};

    if (searchCountryCodes) {
      updatedSearch = {
        ...updatedSearch,
        countryCodes: searchCountryCodes,
      };
    }

    if (searchNavigationAidTypes) {
      updatedSearch = {
        ...updatedSearch,
        navigationAidTypes: searchNavigationAidTypes,
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
    setSearchNavigationAidTypes("");
    setSearchText("");
  }

  return (
    <React.Fragment>
      {isLoading && <Loading />}
      <section className="section-container">
        <div className="container">
          <h1 className="title">Navigation aids</h1>
          {navigationAids != null && navigationAids.items != null && (
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
                      <label className="label">Type</label>
                      <div className="control">
                        <div className="select is-fullwidth">
                          <select
                            value={searchNavigationAidTypes}
                            onChange={handleNavigationAidTypeChange}
                            onKeyDown={handleKeyDownSearch}
                          >
                            <option value=""></option>
                            {navigationAidTypesDataSource.map((x) => (
                              <option key={x[0]} value={x[0]}>
                                {x[1]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="column">
                    <div className="field">
                      <label className="label">MMSI/Name</label>
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
              {navigationAids.items.length > 0 && (
                <React.Fragment>
                  <table className="table table-navigation-aids is-striped is-fullwidth is-bordered  is-hoverable">
                    <thead>
                      <tr>
                        <th className="is-hidden-mobile th-country">Country</th>
                        <th className="th-mmsi">MMSI</th>
                        <th>Name</th>
                        <th className=" is-hidden-mobile">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {navigationAids.items.map((item) => (
                        <tr
                          className=" is-clickable"
                          key={item.mmsi}
                          onClick={() => navigateToNavigationAid(item.mmsi)}
                        >
                          <td className="td-country is-hidden-mobile td-navigation-aid">
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
                          <td className="td-mmsi td-navigation-aid">
                            {item.mmsi}
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
                                className="with-ellipsis"
                                title={item.name || "Unknown"}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <Link to={"/navigation-aid/" + item.mmsi}>
                                  {item.name || "Unknown"}
                                </Link>
                              </span>
                            </div>
                          </td>

                          <td className=" is-hidden-mobile td-navigation-aid">
                            {item.navigationAidTypeDescription}
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
              {navigationAids.items.length == 0 && (
                <div className="box has-text-weight-bold">
                  No navigation aids found.
                </div>
              )}
            </React.Fragment>
          )}
        </div>
      </section>
    </React.Fragment>
  );
}

export default NavigationAids;
