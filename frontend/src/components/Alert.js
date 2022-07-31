import React, { useEffect } from "react";
import "./Alert.css";
import { useLocation } from "react-router-dom";

function Alert({ type, message, isOpened, close }) {
  const location = useLocation();

  useEffect(() => {
    close();
  }, [location.pathname]);

  return (
    <React.Fragment>
      {isOpened && (
        <div
          className={
            "alert-notification notification is-" + (type || "default")
          }
        >
          <button className="delete" onClick={close}></button>
          {message}
        </div>
      )}
    </React.Fragment>
  );
}

export default Alert;
