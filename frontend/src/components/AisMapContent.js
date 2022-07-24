import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { HubConnectionBuilder } from "@microsoft/signalr";
import axios from "axios";
import AisObject from "./AisObject";

import L from "leaflet";
import { useMap, useMapEvents } from "react-leaflet";
import { getTypeOfObject, TypeOfObject } from "../mmsi";
import AisStation from "./AisStation";

const ConnectionStatus = {
  NotBuilt: "NotBuilt",
  Built: "Built",
  Starting: "Starting",
  Running: "Running",
  ErrorStarting: "ErrorStarting",
  RetryStarting: "RetryStarting",
};

function AisMapContent({
  changeParamsLocation,
  stations,
  followMMSI,
  dataUpdatedCallback,
}) {
  const onlyObjectsFromHoursAgo =
    process.env.REACT_APP_MAP_OBJECT_LIFESPAN_HOURS;
  const objectLifeSpanMilliseconds =
    process.env.REACT_APP_MAP_OBJECT_LIFESPAN_HOURS * 3600000;
  const lifeSpanPollingIntervalMilliseconds = 60000; // 1 minute

  const [data, setData] = useState({});
  const [objectsInView, setObjectsInView] = useState({});
  const latestData = useRef(null);
  const [zoom, setZoom] = useState(4);
  const [connectionStatus, setConnectionStatus] = useState(
    ConnectionStatus.NotBuilt
  );
  const [connection, setConnection] = useState(null);
  const [startConnectionTries, setStartConnectionTries] = useState(0);
  const latestStartConnectionTries = useRef(null);
  const [fetchConnectionTries, setFetchConnectionTries] = useState(0);
  const latestFetchConnectionTries = useRef(null);

  const filtering = useRef(false);
  const filteringDelayTimerId = useRef(null);

  latestData.current = data;
  latestStartConnectionTries.current = startConnectionTries;
  latestFetchConnectionTries.current = fetchConnectionTries;

  const [search, setSearch] = useSearchParams();
  const map = useMap();

  useMapEvents({
    load(e) {
      setZoom(map.getZoom());
      filterObjectsInView(map, latestData.current);
    },
    resize(e) {
      filterObjectsInView(map, latestData.current);
      updateSearch();
    },
    zoomend(e) {
      filterObjectsInView(map, latestData.current);
      setZoom(map.getZoom());
      updateSearch();
    },
    moveend(e) {
      filterObjectsInView(map, latestData.current);
      updateSearch();
    },
  });

  useEffect(() => {
    return () => {
      console.log("unmounting...");
      if (connection) {
        console.log("stopping connection...");
        connection.stop();
      }
    };
  }, [connection]);

  function updateSearch() {
    if (changeParamsLocation) {
      const mapCenter = map.getCenter();
      const mapZoom = map.getZoom();

      setSearch(
        { lat: mapCenter.lat, lng: mapCenter.lng, zoom: mapZoom },
        { replace: true }
      );

      if (localStorage) {
        localStorage.setItem("lat", mapCenter.lat);
        localStorage.setItem("lng", mapCenter.lng);
        localStorage.setItem("zoom", mapZoom);
      }
    }
  }

  useEffect(() => {
    if (changeParamsLocation) {
      let paramZoom = parseInt(search.get("zoom"));

      if (!paramZoom && localStorage) {
        paramZoom = parseInt(localStorage.getItem("zoom"));
      }

      if (paramZoom == null || Number.isNaN(paramZoom)) {
        paramZoom = parseInt(process.env.REACT_APP_MAP_INITIAL_ZOOM);
      }

      if (paramZoom != null) {
        map.setZoom(paramZoom);
      }

      let paramLat = parseFloat(search.get("lat"));
      let paramLng = parseFloat(search.get("lng"));

      if ((!paramLat || !paramLng) && localStorage) {
        paramLat = parseFloat(localStorage.getItem("lat"));
        paramLng = parseFloat(localStorage.getItem("lng"));
      }

      if (!paramLat || !paramLng) {
        paramLat = parseFloat(
          process.env.REACT_APP_MAP_INITIAL_CENTER_LATITUDE
        );
        paramLng = parseFloat(
          process.env.REACT_APP_MAP_INITIAL_CENTER_LONGITUDE
        );
      }

      if (paramLat && paramLng) {
        map.setView(
          new L.LatLng(paramLat, paramLng),
          paramZoom || map.getZoom()
        );
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      console.log("Fetching data");
      setFetchConnectionTries(latestFetchConnectionTries.current + 1);

      try {
        const result = await axios.get(
          process.env.REACT_APP_WEB_API_URL + "/ais",
          {
            signal: controller.signal,
            withCredentials: true,
            params: {
              fromHoursAgo: onlyObjectsFromHoursAgo,
            },
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setFetchConnectionTries(0);
        // we start by converting the array into an object with key = mmsi
        const dict = result.data.reduce((a, v) => {
          a[v.mmsi] = v;

          return a;
        }, {});

        // in the event that the transmitter has already started feeding us data
        // but this query to get everything still hasn't executed
        // we can ignore the data already in our app
        Object.keys(latestData.current || {}).forEach((mmsi) => {
          if (!dict[mmsi]) {
            dict[mmsi] = latestData.current[mmsi];
          }
        });

        latestData.current = dict;
        setData(dict);

        if (followMMSI && dict[followMMSI]) {
          followObject(dict[followMMSI]);
        }

        filterObjectsInView(map, dict);
        console.log("finished fetching data");
      } catch (error) {
        console.error(error);

        // todo clean up timeout on unmount component
        if (!controller.signal.aborted) {
          console.log("schedulling another fetch try for later");
          setTimeout(() => {
            fetchData();
          }, getMillisecondsToNextTry(latestFetchConnectionTries.current - 1));
        }
      }
    }

    fetchData();

    return () => controller.abort();
  }, [map, onlyObjectsFromHoursAgo]);

  useEffect(() => {
    if (connectionStatus === ConnectionStatus.NotBuilt) {
      const newConnection = new HubConnectionBuilder()
        .withUrl(process.env.REACT_APP_TRANSMITTER_HUB_URL)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            return getMillisecondsToNextTry(retryContext.previousRetryCount);
          },
        })
        .build();

      newConnection.on("ReceiveBuffered", (list) => {
        const newData = { ...latestData.current };

        list.forEach((dto) => {
          newData[dto.mmsi] = dto;
        });

        latestData.current = newData;

        setData(newData);

        if (followMMSI && newData[followMMSI]) {
          followObject(newData[followMMSI]);
        }

        filterObjectsInView(map, newData, true);

        if (dataUpdatedCallback != null) {
          dataUpdatedCallback(newData);
        }
      });

      setConnection(newConnection);
      setConnectionStatus(ConnectionStatus.Built);
    }
  }, [map, connectionStatus]);

  useEffect(() => {
    if (
      connection &&
      (connectionStatus === ConnectionStatus.Built ||
        connectionStatus === ConnectionStatus.RetryStarting)
    ) {
      setConnectionStatus(ConnectionStatus.Starting);
      setStartConnectionTries(latestStartConnectionTries.current + 1);

      connection
        .start()
        .then((result) => {
          setStartConnectionTries(0);
          console.log("Connected");
          setConnectionStatus(ConnectionStatus.Running);
        })
        .catch((err) => {
          console.error("Connection failed: " + err.toString());
          setConnectionStatus(ConnectionStatus.ErrorStarting);
          // todo: clean up timeout on component unmount
          console.log("scheduling another connection to signal r for later");
          setTimeout(() => {
            setConnectionStatus(ConnectionStatus.RetryStarting);
          }, getMillisecondsToNextTry(latestStartConnectionTries.current - 1));
        });
    }

    // todo: check how to do the clean up of connection, maybe also on unmount only
  }, [map, connection, connectionStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (latestData && latestData.current) {
        let toDelete = Object.entries(latestData.current)
          .filter(
            ([k, v]) =>
              new Date() - new Date(v.updated) > objectLifeSpanMilliseconds
          )
          .map(([k, v]) => k);

        if (toDelete.length > 0) {
          toDelete.forEach((k) => delete latestData.current[k]);
          setData({ ...latestData.current });

          filterObjectsInView(map, { ...latestData.current });
        }
      }
    }, lifeSpanPollingIntervalMilliseconds);

    return () => clearInterval(interval);
  }, [map, objectLifeSpanMilliseconds]);

  function filterObjectsInView(m, objs, delay = false) {
    if (!delay) {
      if (filteringDelayTimerId.current) {
        clearTimeout(filteringDelayTimerId.current);
        filteringDelayTimerId.current = null;
      }
    }

    if (!delay || !filtering.current) {
      filtering.current = true;
      _filterObjectsInView(m, objs);
      if (filteringDelayTimerId.current) {
        clearTimeout(filteringDelayTimerId.current);
        filteringDelayTimerId.current = null;
      }

      filteringDelayTimerId.current = setTimeout(
        () => (filtering.current = false),
        5000
      );
    }
  }

  function getMapBounds(m) {
    const bounds = m.getBounds();
    const offset = 0.005;

    // we'll add a bit of an offset to every edge of the map's bounds
    // to display ships that are not fully visible in the map
    bounds._northEast.lat += offset;
    bounds._northEast.lng += offset;
    bounds._southWest.lat -= offset;
    bounds._southWest.lng -= offset;

    return bounds;
  }

  function _filterObjectsInView(m, objs) {
    setObjectsInView(getObjectsInView(objs, getMapBounds(m)));
  }

  function followObject(objectData) {
    if (
      followMMSI &&
      objectData &&
      objectData.latitude &&
      objectData.longitude
    ) {
      map.setView([objectData.latitude, objectData.longitude], map.getZoom());
    }
  }

  function objectInView(dto, bounds) {
    return (
      dto.latitude &&
      dto.longitude &&
      bounds.contains([dto.latitude, dto.longitude])
    );
  }

  function getObjectsInView(objs, bounds) {
    const inView = {};

    for (const key in objs) {
      if (objectInView(objs[key], bounds)) {
        inView[key] = objs[key];
      }
    }

    return removeAround(inView);
  }

  function getOffsetByZoom(z) {
    switch (z) {
      case 0:
        return 4;
      case 1:
        return 2.5;
      case 2:
        return 1.3;
      case 3:
        return 0.85;
      case 4:
        return 0.5;
      case 5:
        return 0.35;
      case 6:
        return 0.15;
      case 7:
        return 0.05;
      case 8:
        return 0.025;
      case 9:
        return 0.01;
      default:
        return null;
    }
  }

  function removeAround(objs) {
    const offset = getOffsetByZoom(map.getZoom());

    if (offset == null) {
      return objs;
    }

    const inView = { ...objs };
    const ents = Object.values(objs);

    for (const key in objs) {
      const objKey = inView[key];

      // todo: delete ATONs/moored/older/first?

      if (objKey) {
        const toDelete = ents.filter(
          (o) =>
            o.mmsi != key &&
            (followMMSI == null || o.mmsi != followMMSI) &&
            o.latitude >= objKey.latitude - offset &&
            o.latitude <= objKey.latitude + offset &&
            o.longitude >= objKey.longitude - offset &&
            o.longitude <= objKey.longitude + offset
        );

        toDelete.forEach((x) => delete inView[x.mmsi]);
      }
    }
    return inView;
  }

  function getMillisecondsToNextTry(previousTries) {
    switch (previousTries) {
      case 0:
        return 0;
      case 1:
        return 2000;
      case 2:
        return 10000;
      default:
        return 30000;
    }
  }

  return (
    <React.Fragment>
      {Object.keys(objectsInView)
        .filter((key) => data[key] && data[key].latitude && data[key].longitude)
        .map((key) => (
          <AisObject key={key} data={data[key]} zoom={zoom} />
        ))}
      {stations != null &&
        stations
          .filter((x) => x.latitude && x.longitude)
          .map((station) => (
            <AisStation key={station.stationId} data={station} />
          ))}
    </React.Fragment>
  );
}

export default AisMapContent;
