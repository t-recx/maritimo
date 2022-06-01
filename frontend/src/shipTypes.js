const ShipTypes = {
  CargoShip: [70, 71, 72, 73, 74, 75, 76, 77, 78, 79],
  TankerShip: [80, 81, 82, 83, 84, 85, 86, 87, 88, 89],
  PassengerShip: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69],
  HighSpeedCraftShip: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
  FishingShip: [30],
  TowingShip: [31, 32, 52],
  MilitaryShip: [35],
  SailingShip: [36],
  LawEnforcementShip: [55],
  PleasureCraft: [37],
  PilotVessel: [50],
  SearchAndRescueVessel: [51],
  AntiPolutionEquipment: [54],
  MedicalTransport: [58],
  WingInGround: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
};

const ShipTypesDescriptions = {
  0: "Not available",
  1: "Reserved for future use",
  2: "Reserved for future use",
  3: "Reserved for future use",
  4: "Reserved for future use",
  5: "Reserved for future use",
  6: "Reserved for future use",
  7: "Reserved for future use",
  8: "Reserved for future use",
  9: "Reserved for future use",
  10: "Reserved for future use",
  11: "Reserved for future use",
  12: "Reserved for future use",
  13: "Reserved for future use",
  14: "Reserved for future use",
  15: "Reserved for future use",
  16: "Reserved for future use",
  17: "Reserved for future use",
  18: "Reserved for future use",
  19: "Reserved for future use",
  20: "Wing in ground (WIG)",
  21: "Wing in ground (WIG), Hazardous category A",
  22: "Wing in ground (WIG), Hazardous category B",
  23: "Wing in ground (WIG), Hazardous category C",
  24: "Wing in ground (WIG), Hazardous category D",
  25: "Wing in ground (WIG)",
  26: "Wing in ground (WIG)",
  27: "Wing in ground (WIG)",
  28: "Wing in ground (WIG)",
  29: "Wing in ground (WIG)",
  30: "Fishing",
  31: "Towing",
  32: "Towing",
  33: "Dredging or underwater ops",
  34: "Diving ops",
  35: "Military ops",
  36: "Sailing",
  37: "Pleasure Craft",
  38: "Reserved",
  39: "Reserved",
  40: "High speed craft (HSC)",
  41: "High speed craft (HSC), Hazardous category A",
  42: "High speed craft (HSC), Hazardous category B",
  43: "High speed craft (HSC), Hazardous category C",
  44: "High speed craft (HSC), Hazardous category D",
  45: "High speed craft (HSC)",
  46: "High speed craft (HSC)",
  47: "High speed craft (HSC)",
  48: "High speed craft (HSC)",
  49: "High speed craft (HSC)",
  50: "Pilot Vessel",
  51: "Search and Rescue vessel",
  52: "Tug",
  53: "Port Tender",
  54: "Anti-pollution equipment",
  55: "Law Enforcement",
  56: "Local Vessel",
  57: "Local Vessel",
  58: "Medical Transport",
  59: "Non-combatant ship",
  60: "Passenger",
  61: "Passenger, Hazardous category A",
  62: "Passenger, Hazardous category B",
  63: "Passenger, Hazardous category C",
  64: "Passenger, Hazardous category D",
  65: "Passenger",
  66: "Passenger",
  67: "Passenger",
  68: "Passenger",
  69: "Passenger",
  70: "Cargo",
  71: "Cargo, Hazardous category A",
  72: "Cargo, Hazardous category B",
  73: "Cargo, Hazardous category C",
  74: "Cargo, Hazardous category D",
  75: "Cargo",
  76: "Cargo",
  77: "Cargo",
  78: "Cargo",
  79: "Cargo",
  80: "Tanker",
  81: "Tanker, Hazardous category A",
  82: "Tanker, Hazardous category B",
  83: "Tanker, Hazardous category C",
  84: "Tanker, Hazardous category D",
  85: "Tanker",
  86: "Tanker",
  87: "Tanker",
  88: "Tanker",
  89: "Tanker",
  90: "Other Type",
  91: "Other Type, Hazardous category A",
  92: "Other Type, Hazardous category B",
  93: "Other Type, Hazardous category C",
  94: "Other Type, Hazardous category D",
  95: "Other Type",
  96: "Other Type",
  97: "Other Type",
  98: "Other Type",
  99: "Other Type",
};

function getShipTypeDescription(shipType) {
  return ShipTypesDescriptions[shipType];
}

export { getShipTypeDescription };
export { ShipTypes };