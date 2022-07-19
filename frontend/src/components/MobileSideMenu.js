import "./MobileSideMenu.css";
import React, { useEffect, useState } from "react";
import NavbarItems from "./NavbarItems";

function MobileSideMenu({ dropDownVisible, setDropDownHidden }) {
  const [menuTranslateX, setMenuTranslateX] = useState("translate(90vw)");
  const [menuTransitionMs, setMenuTransitionMs] = useState(400);
  const [overlayTransitionMs, setOverlayTransitionMs] = useState(400);
  const [menuWidth, setMenuWidth] = useState(85);
  const [styles, setStyles] = useState({ visibility: "hidden" });
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [overlayPointerEvents, setOverlayPointerEvents] = useState("none");
  const [overlayStyles, setOverlayStyles] = useState({});
  const [menuWidthWhenOpen, setMenuWidthWhenOpen] = useState(null);

  useEffect(() => {
    setMenuWidthBasedOnWindowWidth();
  }, []);

  useEffect(() => {
    if (!dropDownVisible) {
      setMenuTransitionMs(400 / 2);
      setMenuTranslateX("translate(90vw)");
    } else {
      setMenuTransitionMs(400);
      setMenuTranslateX(null);
    }

    setOverlayOpacity(dropDownVisible ? 40 : 0);

    if (dropDownVisible) {
      document.body.style.overflow = "hidden";
      setOverlayPointerEvents("all");

      setTimeout(() => setOverlayTransitionMs(0), 400);
    } else {
      document.body.style.overflow = null;

      setOverlayPointerEvents("none");

      setOverlayTransitionMs(400);
    }

    setMenuWidth(menuWidthWhenOpen);
  }, [dropDownVisible, menuWidthWhenOpen]);

  function setMenuWidthBasedOnWindowWidth() {
    if (window.innerWidth >= 1024) {
      setDropDownHidden();
    } else if (window.innerWidth > 600) {
      setMenuWidthWhenOpen(45);
    } else {
      setMenuWidthWhenOpen(85);
    }
  }

  useEffect(() => {
    window.addEventListener("resize", setMenuWidthBasedOnWindowWidth);

    return () =>
      window.removeEventListener("resize", setMenuWidthBasedOnWindowWidth);
  }, []);

  useEffect(() => {
    let stylesDefinition = {};

    if (menuTranslateX) {
      stylesDefinition["transform"] = menuTranslateX;
    }

    if (menuWidth) {
      stylesDefinition["width"] = menuWidth + "% ";
    }

    if (menuTransitionMs) {
      stylesDefinition["transition"] = menuTransitionMs + "ms";
    }

    if (!dropDownVisible) {
      stylesDefinition["visibility"] = "hidden";
    }

    setStyles(stylesDefinition);
  }, [menuTranslateX, menuWidth, menuTransitionMs, dropDownVisible]);

  useEffect(() => {
    let stylesDefinition = {};

    stylesDefinition["opacity"] = overlayOpacity + "%";
    stylesDefinition["transition"] = overlayTransitionMs + "ms";
    stylesDefinition["pointerEvents"] = overlayPointerEvents;

    setOverlayStyles(stylesDefinition);
  }, [overlayOpacity, overlayTransitionMs, overlayPointerEvents]);

  function overlayClick() {
    if (dropDownVisible) {
      setDropDownHidden();
    }
  }

  return (
    <React.Fragment>
      <div className="menu-dropdown" style={styles}>
        <NavbarItems linkClicked={setDropDownHidden} isDropdown={true} />
      </div>

      <div
        className="menu-overlay-opacity"
        style={overlayStyles}
        onClick={overlayClick}
      ></div>
    </React.Fragment>
  );
}

export default MobileSideMenu;
