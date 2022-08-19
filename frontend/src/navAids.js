const NavAidTypeDescriptions = {
  0: "Unspecified aid to navigation",
  1: "Reference point",
  2: "RACon (radar transponder marking a navigation hazard",
  3: "Fixed structure off shore, such as oil ",
  4: "Spare, reserved for future use",
  5: "Light, without sectors",
  6: "Light, with sectors",
  7: "Leading light front",
  8: "Leading light rear",
  9: "Beacon, cardinal N",
  10: "Beacon, cardinal E",
  11: "Beacon, cardinal S",
  12: "Beacon, cardinal W",
  13: "Beacon, port hand",
  14: "Beacon, starboard hand",
  15: "Beacon, preferred channel port hand",
  16: "Beacon, preferred channel starboard hand",
  17: "Beacon, isolated danger",
  18: "Beacon, safe water",
  19: "Beacon, special mark",
  20: "Cardinal mark N",
  21: "Cardinal mark E",
  22: "Cardinal mark S",
  23: "Cardinal mark W",
  24: "Port hand mark",
  25: "Starboard hand mark",
  26: "Preferred channel port hand",
  27: "Preferred channel starboard hand",
  28: "Isolated danger",
  29: "Safe water",
  30: "Special mark",
  31: "Light vessel / LANBY",
};

function getNavAidTypeDescription(navAidType) {
  if (navAidType == null) {
    return "Unknown type";
  }

  const description = NavAidTypeDescriptions[navAidType];

  if (description == null) {
    return "Unknown type";
  }

  return description;
}

export { getNavAidTypeDescription, NavAidTypeDescriptions };
