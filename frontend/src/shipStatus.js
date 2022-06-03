const ShipStatus = {
  Underwayusingengine: 0,
  Atanchor: 1,
  Notundercommand: 2,
  Restrictedmanoeuverability: 3,
  Constrainedbyherdraught: 4,
  Moored: 5,
  Aground: 6,
  EngagedinFishing: 7,
  Underwaysailing: 8,
  ReservedforfutureamendmentofNavigationalStatusforHSC: 9,
  ReservedforfutureamendmentofNavigationalStatusforWIG: 10,
  Reservedforfutureuse: 11,
  Reservedforfutureuse: 12,
  Reservedforfutureuse: 13,
  AISSARTisactive: 14,
  Notdefined: 15,
};
const ShipStatusDescriptions = {
  0: "Under way using engine",
  1: "At anchor",
  2: "Not under command",
  3: "Restricted manoeuverability",
  4: "Constrained by her draught",
  5: "Moored",
  6: "Aground",
  7: "Engaged in fishing",
  8: "Under way sailing",
  9: "Reserved for future use (HSC)",
  10: "Reserved for future use (WIG)",
  11: "Reserved for future use",
  12: "Reserved for future use",
  13: "Reserved for future use",
  14: "AIS-SART is active",
  15: "Not defined (default)",
};

function getShipStatusDescription(shipStatus) {
  return ShipStatusDescriptions[shipStatus];
}

export { getShipStatusDescription, ShipStatus };
