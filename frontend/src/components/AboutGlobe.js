import Globe from "react-globe.gl";
import { useMemo, useRef, useEffect, useState } from "react";
import { getShipColorScheme } from "../shipColorSchemes";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { getTypeOfObject, TypeOfObject } from "../mmsi";
import http from "../http";
import Color, { rgb } from "color";
import countriesJson from "../countries.json";

const ConnectionStatus = {
  NotBuilt: "NotBuilt",
  Built: "Built",
  Starting: "Starting",
  Running: "Running",
  ErrorStarting: "ErrorStarting",
  RetryStarting: "RetryStarting",
};

function AboutGlobe({ alert, width, height }) {
  const transparent = useMemo(() => "rgba(0, 0, 0, 0)");
  const onlyObjectsFromHoursAgo =
    process.env.REACT_APP_MAP_OBJECT_LIFESPAN_HOURS;
  const [data, setData] = useState({});
  const latestData = useRef(null);
  const [connectionStatus, setConnectionStatus] = useState(
    ConnectionStatus.NotBuilt
  );
  const [connection, setConnection] = useState(null);
  const [startConnectionTries, setStartConnectionTries] = useState(0);
  const latestStartConnectionTries = useRef(null);
  const [fetchConnectionTries, setFetchConnectionTries] = useState(0);
  const latestFetchConnectionTries = useRef(null);
  const [pointsData, setPointsData] = useState([]);

  latestData.current = data;
  latestStartConnectionTries.current = startConnectionTries;
  latestFetchConnectionTries.current = fetchConnectionTries;

  const globeEl = useRef();

  useEffect(() => {
    return () => {
      console.log("unmounting...");
      if (connection) {
        console.log("stopping connection...");
        connection.stop();
      }
    };
  }, [connection]);

  useEffect(() => {
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 0.8;

    globeEl.current.pointOfView({ lat: 42, lng: 24 }, 0);
    globeEl.current.controls().enableZoom = false;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (latestData && latestData.current) {
        updatePointsData(latestData.current);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function updatePointsData(updatedData) {
    let newPointsData = [];
    const currentDate = new Date();
    Object.keys(updatedData).map((mmsi) => {
      const item = updatedData[mmsi];
      const msSinceUpdate = currentDate - new Date(item.updated);

      if (msSinceUpdate < 60000) {
        newPointsData.push({
          latitude: item.latitude,
          longitude: item.longitude,
          name: item.name,
          size: 0,
          color: getShipColorScheme(updatedData[mmsi].ship_type).fillColor,
        });
      }
    });

    setPointsData(newPointsData);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      //setIsLoading(true);
      console.log("Fetching data");
      setFetchConnectionTries(latestFetchConnectionTries.current + 1);

      try {
        const result = await http.plain.get("/ais", {
          signal: controller.signal,
          params: {
            fromHoursAgo: onlyObjectsFromHoursAgo,
            excludeObjectTypes: [TypeOfObject.Unknown].join(","),
          },
        });

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

        console.log("finished fetching data");
      } catch (error) {
        //alert(
        //"danger",
        //"Unable to load ship data, schedulling another try for later."
        //);
        console.error(error);

        // todo clean up timeout on unmount component
        if (!controller.signal.aborted) {
          console.log("schedulling another fetch try for later");
          setTimeout(() => {
            fetchData();
          }, getMillisecondsToNextTry(latestFetchConnectionTries.current - 1));
        }
      } finally {
        //setIsLoading(false);
      }
    }

    fetchData();

    return () => controller.abort();
  }, [onlyObjectsFromHoursAgo]);

  function x(list) {
    const newData = { ...latestData.current };

    list.forEach((dto) => {
      if (dto.object_type != TypeOfObject.Unknown) {
        newData[dto.mmsi] = dto;
      }
    });

    latestData.current = newData;

    setData(newData);
  }

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
        const times = 24;
        const timeoutDuration = 6000 / times;
        const nItems = list.length / times;
        for (let index = 0; index < times; index++) {
          let dataSlice = null;

          if (index == times - 1) {
            dataSlice = list.slice(nItems * index, list.length);
          } else {
            dataSlice = list.slice(nItems * index, nItems * index + nItems);
          }

          setTimeout(() => x(dataSlice), timeoutDuration * index);
        }
      });

      setConnection(newConnection);
      setConnectionStatus(ConnectionStatus.Built);
    }
  }, [connectionStatus]);

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
  }, [connection, connectionStatus]);

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

  const [countries, setCountries] = useState({ features: [] });

  useEffect(() => {
    setCountries(countriesJson);
  }, []);

  return (
    <Globe
      width={width >= 700 ? 700 : width}
      height={width >= 700 ? 700 : width}
      backgroundColor={transparent}
      atmosphereColor="#37426d"
      globeImageUrl="/aboutglobeearth.png"
      ref={globeEl}
      atmosphereAltitude={0.4}
      pointsData={pointsData}
      pointLat="latitude"
      pointLng="longitude"
      pointAltitude={0.0}
      pointLabel={null}
      pointsTransitionDuration={0}
      pointColor="color"
      pointRadius={0.1}
      animateIn={false}
      polygonsData={countries.features.filter(
        (d) => d.properties.ISO_A2 !== "AQ"
      )}
      polygonAltitude={0.006}
      polygonSideColor={() => "#73abd9"}
      polygonCapColor={() => "#73abd9"}
      polygonsTransitionDuration={0}
      rendererConfig={{ antialias: false }}
    />
  );
}

export default AboutGlobe;
