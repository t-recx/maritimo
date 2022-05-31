const ShipStatusDescriptions = {
  0: "Under way using engine",
  1: "At anchor",
  2: "Not under command",
  3: "Restricted manoeuverability",
  4: "Constrained by her draught",
  5: "Moored",
  6: "Aground",
  7: "Engaged in Fishing",
  8: "Under way sailing",
  9: "Reserved for future amendment of Navigational Status for HSC",
  10: "Reserved for future amendment of Navigational Status for WIG",
  11: "Reserved for future use",
  12: "Reserved for future use",
  13: "Reserved for future use",
  14: "AIS-SART is active",
  15: "Not defined (default)",
};

function getShipStatusDescription(shipStatus) {
  return ShipStatusDescriptions[shipStatus];
}

export { getShipStatusDescription };
