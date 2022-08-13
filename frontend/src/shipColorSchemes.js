import * as colorScheme from "color-scheme";
import { ShipTypes } from "./shipTypes";

let shipColorSchemes = {};

function getShipColorScheme(shipType) {
  let hue = 0;
  const factor = 20;

  if (ShipTypes.CargoShip.includes(shipType)) {
    hue = factor * 1;
  } else if (ShipTypes.TankerShip.includes(shipType)) {
    hue = factor * 2;
  } else if (ShipTypes.PassengerShip.includes(shipType)) {
    hue = factor * 3;
  } else if (ShipTypes.HighSpeedCraftShip.includes(shipType)) {
    hue = factor * 4;
  } else if (ShipTypes.FishingShip.includes(shipType)) {
    hue = factor * 5;
  } else if (ShipTypes.TowingShip.includes(shipType)) {
    hue = factor * 6;
  } else if (ShipTypes.MilitaryShip.includes(shipType)) {
    hue = factor * 7;
  } else if (ShipTypes.SailingShip.includes(shipType)) {
    hue = factor * 8;
  } else if (ShipTypes.LawEnforcementShip.includes(shipType)) {
    hue = factor * 9;
  } else if (ShipTypes.PleasureCraft.includes(shipType)) {
    hue = factor * 10;
  } else if (ShipTypes.PilotVessel.includes(shipType)) {
    hue = factor * 11;
  } else if (ShipTypes.SearchAndRescueVessel.includes(shipType)) {
    hue = factor * 12;
  } else if (ShipTypes.AntiPolutionEquipment.includes(shipType)) {
    hue = factor * 13;
  } else if (ShipTypes.MedicalTransport.includes(shipType)) {
    hue = factor * 14;
  } else if (ShipTypes.WingInGround.includes(shipType)) {
    hue = factor * 15;
  }

  if (!shipColorSchemes[hue]) {
    console.log("filling schemes for " + hue);
    shipColorSchemes[hue] = new colorScheme()
      .from_hue(hue)
      .scheme("monochromatic")
      .distance(0.5)
      .add_complement(false)
      .variation("default")
      .web_safe(true)
      .colors()
      .map((x) => "#" + x);
  }

  const [color, fillColor, colorTransmitter, fillColorTransmitter] =
    shipColorSchemes[hue];
  return {
    color,
    fillColor,
    colorTransmitter,
    fillColorTransmitter,
  };
}

export { getShipColorScheme };
