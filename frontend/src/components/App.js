import React, { useState } from "react";
import MainMap from "./MainMap";
import Navbar from "./Navbar";
import Station from "./Station";
import Stations from "./Stations";
import Vessel from "./Vessel";
import Vessels from "./Vessels";
import NotFound from "./NotFound";
import ScrollToTop from "./ScrollToTop";
import Alert from "./Alert";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);

  function setAlert(type, message) {
    setAlertType(type);
    setAlertMessage(message);
    setAlertOpen(true);
  }

  function closeAlert() {
    setAlertOpen(false);
  }

  return (
    <BrowserRouter>
      <React.Fragment>
        <div className="main-container">
          <Navbar />
          <Alert
            message={alertMessage}
            type={alertType}
            close={closeAlert}
            isOpened={alertOpen}
          />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<MainMap alert={setAlert} />}></Route>
            <Route
              path="/station/:stationId"
              element={<Station alert={setAlert} />}
            ></Route>
            <Route
              path="/stations"
              element={<Stations alert={setAlert} />}
            ></Route>
            <Route
              path="/vessel/:mmsi"
              element={<Vessel alert={setAlert} />}
            ></Route>
            <Route
              path="/vessels"
              element={<Vessels alert={setAlert} />}
            ></Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </React.Fragment>
    </BrowserRouter>
  );
}

export default App;
