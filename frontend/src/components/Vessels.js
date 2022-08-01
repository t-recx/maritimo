import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { FlagsByMid, getCountryDescription, getFlagInformation } from "../mmsi";
import { getShipTypeDescription, ShipTypes } from "../shipTypes";
import Loading from "./Loading";
import Pagination from "./Pagination";
import "./Vessels.css";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import http from "../http";

function Vessels({ alert }) {
  const [search, setSearch] = useSearchParams();
  const location = useLocation();
  const [pageNumber, setPageNumber] = useState(null);
  const [pageSize, setPageSize] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vessels, setVessels] = useState(null);
  const [searchCountryCodes, setSearchCountryCodes] = useState("");
  const [searchShipTypes, setSearchShipTypes] = useState("");
  const [searchText, setSearchText] = useState("");
  const [countryCodeFilterDataSource, setCountryCodeFilterDataSource] =
    useState(null);
  const [shipTypesDataSource, setShipTypesDataSource] = useState(null);

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
    let dataSource = [];

    dataSource.push([ShipTypes.CargoShip.join(","), "Cargo"]);
    dataSource.push([ShipTypes.TankerShip.join(","), "Tanker"]);
    dataSource.push([ShipTypes.PassengerShip.join(","), "Passenger"]);
    dataSource.push([
      ShipTypes.HighSpeedCraftShip.join(","),
      "HighSpeed craft",
    ]);
    dataSource.push([ShipTypes.FishingShip.join(","), "Fishing"]);
    dataSource.push([ShipTypes.TowingShip.join(","), "Towing"]);
    dataSource.push([ShipTypes.MilitaryShip.join(","), "Military"]);
    dataSource.push([ShipTypes.SailingShip.join(","), "Sailing"]);
    dataSource.push([
      ShipTypes.LawEnforcementShip.join(","),
      "Law Enforcement",
    ]);
    dataSource.push([ShipTypes.PleasureCraft.join(","), "Pleasure craft"]);
    dataSource.push([ShipTypes.PilotVessel.join(","), "Pilot vessel"]);
    dataSource.push([
      ShipTypes.SearchAndRescueVessel.join(","),
      "Search and rescue",
    ]);
    dataSource.push([
      ShipTypes.AntiPolutionEquipment.join(","),
      "Anti-polution equipment",
    ]);
    dataSource.push([ShipTypes.MedicalTransport.join(","), "Medical"]);
    dataSource.push([ShipTypes.WingInGround.join(","), "Wing in ground"]);

    dataSource = dataSource.sort((a, b) => a[1].localeCompare(b[1]));

    setShipTypesDataSource(dataSource);
  }, []);

  useEffect(() => {
    let params = getFromSearch();

    setPageNumber(params.paramPageNumber);
    setPageSize(params.paramPageSize);

    setSearchCountryCodes(params.paramCountryCodes || "");

    setSearchShipTypes(params.paramShipTypes || "");
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
    let paramShipTypes = search.get("shipTypes");

    if (paramShipTypes == null || paramShipTypes.toString().length == 0) {
      paramShipTypes = null;
    }
    let paramSearchText = search.get("text");

    if (paramSearchText == null || paramSearchText.length == 0) {
      paramSearchText = null;
    }

    return {
      paramPageNumber: paramPageNumber,
      paramPageSize: paramPageSize,
      paramSearchText: paramSearchText,
      paramShipTypes: paramShipTypes,
      paramCountryCodes: paramCountryCodes,
    };
  }

  function getParams() {
    let paramsFromSearch = getFromSearch();

    return {
      pageNumber: paramsFromSearch.paramPageNumber,
      pageSize: paramsFromSearch.paramPageSize,
      countryCodes: paramsFromSearch.paramCountryCodes,
      shipTypes: paramsFromSearch.paramShipTypes,
      text: paramsFromSearch.paramSearchText,
    };
  }

  function fetchData() {
    setIsLoading(true);

    http.plain
      .get("/vessel", {
        params: getParams(),
      })
      .then((result) => {
        if (result?.data) {
          setVessels(result.data);
          setTotalPages(result.data.totalPages);
          if (result.data && result.data.items) {
            result.data.items.forEach((dto) => {
              dto.countryName = getCountryDescription(dto.mmsi);
              dto.flagInformation = getFlagInformation(dto.mmsi);
              dto.shipTypeDescription = getShipTypeDescription(dto.ship_type);
            });
          }
        }
      })
      .catch((error) => {
        alert("danger", "Unable to display vessels, please try again later.");
      })
      .then(() => {
        setIsLoading(false);
      });
  }

  function navigateToVessel(mmsi) {
    navigate("/vessel/" + mmsi);
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

  function handleShipTypeChange(event) {
    setSearchShipTypes(event.target.value);
  }

  function searchData() {
    let updatedSearch = {};

    if (searchCountryCodes) {
      updatedSearch = {
        ...updatedSearch,
        countryCodes: searchCountryCodes,
      };
    }

    if (searchShipTypes) {
      updatedSearch = {
        ...updatedSearch,
        shipTypes: searchShipTypes,
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
    setSearchShipTypes("");
    setSearchText("");
  }

  return (
    <React.Fragment>
      {isLoading && <Loading />}
      <section className="section-container">
        <h1 className="title">Vessels</h1>
        {vessels != null && vessels.items != null && (
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
                          value={searchShipTypes}
                          onChange={handleShipTypeChange}
                          onKeyDown={handleKeyDownSearch}
                        >
                          <option value=""></option>
                          {shipTypesDataSource.map((x) => (
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
                    <label className="label">MMSI/IMO/Name</label>
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
            <table className="table table-vessels is-striped is-fullwidth is-bordered  is-hoverable">
              <thead>
                <tr>
                  <th className="is-hidden-mobile th-country">Country</th>
                  <th className="th-mmsi">MMSI</th>
                  <th>Name</th>
                  <th className=" is-hidden-mobile">Type</th>
                </tr>
              </thead>
              <tbody>
                {vessels.items.map((item) => (
                  <tr
                    className=" is-clickable"
                    key={item.mmsi}
                    onClick={() => navigateToVessel(item.mmsi)}
                  >
                    <td className="td-country is-hidden-mobile td-vessel">
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
                    <td className="td-mmsi td-vessel">{item.mmsi}</td>
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
                          <Link to={"/vessel/" + item.mmsi}>
                            {item.name || "Unknown"}
                          </Link>
                        </span>
                      </div>
                    </td>

                    <td className=" is-hidden-mobile td-vessel">
                      {item.shipTypeDescription}
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

export default Vessels;
