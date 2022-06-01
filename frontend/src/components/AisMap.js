import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import axios from "axios";
import AisShipObject from "./AisShipObject";

import { useMap, useMapEvents } from "react-leaflet";

// todo: make popup with ship info
const ConnectionStatus = {
  NotBuilt: "NotBuilt",
  Built: "Built",
  Starting: "Starting",
  Running: "Running",
  ErrorStarting: "ErrorStarting",
  RetryStarting: "RetryStarting",
};

function AisMap() {
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

  latestData.current = data;
  latestStartConnectionTries.current = startConnectionTries;

  const map = useMap();

  useMapEvents({
    load(e) {
      setZoom(map.getZoom());
      filterObjectsInView(map, data);
    },
    resize(e) {
      filterObjectsInView(map, data);
    },
    zoomend(e) {
      filterObjectsInView(map, data);
      setZoom(map.getZoom());
    },
    moveend(e) {
      filterObjectsInView(map, data);
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await axios.get(process.env.REACT_APP_WEB_API_URL, {
          withCredentials: true,
          params: {
            fromHoursAgo: onlyObjectsFromHoursAgo,
          },
          headers: {
            "Content-Type": "application/json",
          },
        });

        // we start by converting the array into an object with key = mmsi
        const dict = result.data.reduce((a, v) => {
          a[v.mmsi] = v;

          return a;
        }, {});

        // in the event that the transmitter has already started feeding us data
        // but this query to get everything still hasn't executed
        // we pick the data we currently have that was transmitted and add it to
        // the data we just received from the webapi
        Object.keys(latestData.current || {}).forEach((mmsi) => {
          if (dict[mmsi]) {
            dict[mmsi] = { ...dict[mmsi], ...latestData.current[mmsi] };
          } else {
            dict[mmsi] = latestData.current[mmsi];
          }
        });

        setData(dict);

        filterObjectsInView(map, dict);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
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

      // todo: subscribe on reconnecting method to display something indicating connection was lost
      newConnection.on("Receive", (dto) => {
        latestData.current[dto.mmsi] = {
          ...latestData.current[dto.mmsi],
          ...dto,
        };

        //setData(Object.assign({}, latestData.current));
        setData({ ...latestData.current });

        // todo: filter just the ship in question
        filterObjectsInView(map, { ...latestData.current });
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
          setTimeout(() => {
            setConnectionStatus(ConnectionStatus.RetryStarting);
          }, getMillisecondsToNextTry(latestStartConnectionTries.current - 1));
        });
    }

    async function stopConnection() {
      if (connection && connectionStatus === ConnectionStatus.Running) {
        connection.stop();
      }
    }

    return stopConnection;
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

  function filterObjectsInView(m, objs) {
    const bounds = m.getBounds();
    const offset = 0.005;

    // we'll add a bit of an offset to every edge of the map's bounds
    // to display ships that are not fully visible in the map
    bounds._northEast.lat += offset;
    bounds._northEast.lng += offset;
    bounds._southWest.lat -= offset;
    bounds._southWest.lng -= offset;

    setObjectsInView(getObjectsInView(objs, bounds));
  }

  function objectInView(dto, bounds) {
    return (
      dto.latitude &&
      dto.longitude &&
      bounds.contains([dto.latitude, dto.longitude])
    );
  }

  function getObjectsInView(objs, bounds) {
    return Object.fromEntries(
      Object.entries(objs).filter(([k, v]) => objectInView(v, bounds))
    );
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
        .filter((key) => data[key].latitude && data[key].longitude)
        .map((key) => (
          <AisShipObject key={key} data={data[key]} zoom={zoom} />
        ))}
    </React.Fragment>
  );
}

export default AisMap;
