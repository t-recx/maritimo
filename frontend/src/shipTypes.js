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
  21: "Wing in ground (WIG), hazardous category A",
  22: "Wing in ground (WIG), hazardous category B",
  23: "Wing in ground (WIG), hazardous category C",
  24: "Wing in ground (WIG), hazardous category D",
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
  37: "Pleasure craft",
  38: "Reserved",
  39: "Reserved",
  40: "High speed craft (HSC)",
  41: "High speed craft (HSC), hazardous category A",
  42: "High speed craft (HSC), hazardous category B",
  43: "High speed craft (HSC), hazardous category C",
  44: "High speed craft (HSC), hazardous category D",
  45: "High speed craft (HSC)",
  46: "High speed craft (HSC)",
  47: "High speed craft (HSC)",
  48: "High speed craft (HSC)",
  49: "High speed craft (HSC)",
  50: "Pilot vessel",
  51: "Search and rescue vessel",
  52: "Tug",
  53: "Port tender",
  54: "Anti-pollution equipment",
  55: "Law enforcement",
  56: "Local vessel",
  57: "Local vessel",
  58: "Medical transport",
  59: "Non-combatant ship",
  60: "Passenger",
  61: "Passenger, hazardous category A",
  62: "Passenger, hazardous category B",
  63: "Passenger, hazardous category C",
  64: "Passenger, hazardous category D",
  65: "Passenger",
  66: "Passenger",
  67: "Passenger",
  68: "Passenger",
  69: "Passenger",
  70: "Cargo",
  71: "Cargo, hazardous category A",
  72: "Cargo, hazardous category B",
  73: "Cargo, hazardous category C",
  74: "Cargo, hazardous category D",
  75: "Cargo",
  76: "Cargo",
  77: "Cargo",
  78: "Cargo",
  79: "Cargo",
  80: "Tanker",
  81: "Tanker, hazardous category A",
  82: "Tanker, hazardous category B",
  83: "Tanker, hazardous category C",
  84: "Tanker, hazardous category D",
  85: "Tanker",
  86: "Tanker",
  87: "Tanker",
  88: "Tanker",
  89: "Tanker",
  90: "Other type",
  91: "Other type, hazardous category A",
  92: "Other type, hazardous category B",
  93: "Other type, hazardous category C",
  94: "Other type, hazardous category D",
  95: "Other type",
  96: "Other type",
  97: "Other type",
  98: "Other type",
  99: "Other type",
};

function getShipTypeDescription(shipType) {
  if (shipType == null) {
    return "Unknown type";
  }

  const description = ShipTypesDescriptions[shipType];

  if (description == null) {
    return "Unknown type";
  }

  return description;
}

export { getShipTypeDescription };
export { ShipTypes };
