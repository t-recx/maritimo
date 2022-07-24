import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import AisMap from "./components/AisMap";
import Navbar from "./components/Navbar";
import Station from "./components/Station";
import Stations from "./components/Stations";
import Vessel from "./components/Vessel";
import Vessels from "./components/Vessels";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <React.Fragment>
      <div className="main-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<AisMap />}></Route>
          <Route path="/station/:stationId" element={<Station />}></Route>
          <Route path="/stations" element={<Stations />}></Route>
          <Route path="/vessel/:mmsi" element={<Vessel />}></Route>
          <Route path="/vessels" element={<Vessels />}></Route>
        </Routes>
      </div>
    </React.Fragment>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
