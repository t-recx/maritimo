import React, { useState, useEffect, useRef } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import axios from "axios";
import AisShipObject from "./AisShipObject";

import { useMap, useMapEvents } from "react-leaflet";

// todo: cleanup older ships
// todo: make popup with ship info
// todo: add some leeway in bounds when filtering ships
// todo: configure rest and ws urls

function AisMap() {
  const [data, setData] = useState({});
  const [objectsInView, setObjectsInView] = useState({});
  const latestData = useRef(null);
  const [zoom, setZoom] = useState(4);

  latestData.current = data;

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
        const result = await axios.get("http://localhost:5245/api/ais", {
          withCredentials: true,
          params: {
            fromHoursAgo: 1,
          },
          headers: {
            "Content-Type": "application/json",
          },
        });

        const dict = result.data.reduce((a, v) => ({ ...a, [v.mmsi]: v }), {});

        setData(dict);

        filterObjectsInView(map, dict);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, [map]);

  useEffect(() => {
    // todo: configure new auto reconnect policy to keep reconnecting
    const newConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5004/hub")
      .withAutomaticReconnect()
      .build();

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

    // todo: start failures are not handled by auto reconnects, so handle them in this method
    newConnection
      .start()
      .then((result) => {
        console.log("Connected");
      })
      .catch((err) => {
        console.error("Connection failed: " + err.toString());
      });

    // todo: subscribe on reconnecting method to display something indicating connection was lost

    async function stopConnection() {
      newConnection.stop();
    }

    return stopConnection;
  }, [map]);

  function filterObjectsInView(map, objs) {
    setObjectsInView(getObjectsInView(objs, map.getBounds()));
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
