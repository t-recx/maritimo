import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { FlagsByMid, getCountryDescription, getFlagInformation } from "../mmsi";
import { getShipTypeDescription } from "../shipTypes";
import Loading from "./Loading";
import Pagination from "./Pagination";
import "./Vessels.css";

function Vessels() {
  const [search, setSearch] = useSearchParams();
  const [pageNumber, setPageNumber] = useState(null);
  const [pageSize, setPageSize] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vessels, setVessels] = useState(null);
  const [searchCountryCode, setSearchCountryCode] = useState(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState(null);

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

    let paramCountryCode = parseInt(search.get("countryCode"));

    if (paramCountryCode == null || Number.isNaN(paramCountryCode)) {
      setSearchCountryCode(null);
      setSelectedCountryCode(null);
    } else {
      setSearchCountryCode(paramCountryCode);
      setSelectedCountryCode(paramCountryCode);
    }
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        if (pageNumber != null && pageSize != null) {
          setIsLoading(true);

          const result = await axios.get(
            process.env.REACT_APP_WEB_API_URL + "/vessel",
            {
              withCredentials: true,
              params: {
                pageNumber: pageNumber,
                pageSize: pageSize,
                countryCode: searchCountryCode,
              },
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          setVessels(result.data);
          setTotalPages(result.data.totalPages);
          if (result.data && result.data.items) {
            result.data.items.forEach((dto) => {
              dto.countryName = getCountryDescription(dto.mmsi);
              dto.flagInformation = getFlagInformation(dto.mmsi);
              dto.shipTypeDescription = getShipTypeDescription(dto.ship_type);
            });
          }

          setIsLoading(false);
        }
        console.log("finished fetching data");
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();

    return () => controller.abort();
  }, [pageNumber, pageSize, searchCountryCode]);

  function navigateToVessel(mmsi) {
    navigate("/vessel/" + mmsi);
  }

  function handleCountryCodeChange(event) {
    setSelectedCountryCode(event.target.value);
  }

  function searchData() {
    let updatedSearch = {};
    setSearchCountryCode(selectedCountryCode);

    if (selectedCountryCode) {
      updatedSearch = { ...updatedSearch, countryCode: selectedCountryCode };
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
                          value={selectedCountryCode}
                          onChange={handleCountryCodeChange}
                        >
                          <option></option>
                          {Object.keys(FlagsByMid).map((key) => (
                            <option key={key} value={key}>
                              {FlagsByMid[key].country}
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
                        <select>
                          <option></option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="column">
                  <div className="field">
                    <label className="label">MMSI/IMO/Name</label>
                    <div className="control">
                      <input className="input" type="text" placeholder="" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="field is-grouped is-justify-content-end">
                <div class="control">
                  <button class="button is-link" onClick={searchData}>
                    Search
                  </button>
                </div>
                <div class="control">
                  <button class="button is-link is-light">Reset</button>
                </div>
              </div>
            </div>
            <table className="table is-striped is-fullwidth is-bordered  is-hoverable">
              <thead>
                <tr>
                  <th className="is-hidden-mobile">Country</th>
                  <th className="">MMSI</th>
                  <th>Name</th>
                  <th className=" is-hidden-mobile">Type</th>
                </tr>
              </thead>
              <tbody>
                {vessels.items.map((item) => (
                  <tr
                    className="is-clickable"
                    key={item.stationId}
                    onClick={() => navigateToVessel(item.mmsi)}
                  >
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
                    <td className="td-mmsi">{item.mmsi}</td>
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
                          <Link to={"/vessel/" + item.mmsi}>
                            {item.name || "Unknown"}
                          </Link>
                        </span>
                      </div>
                    </td>

                    <td className=" is-hidden-mobile">
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
