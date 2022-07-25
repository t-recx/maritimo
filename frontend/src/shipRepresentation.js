import * as turf from "@turf/turf";

function getPolygonCentroid(objectPolygon) {
  const p = [
    objectPolygon
      .map((point) => [point[1], point[0]])
      .concat([[objectPolygon[0][1], objectPolygon[0][0]]]),
  ];
  const centroid = turf.centroid(turf.polygon(p));

  return [centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]];
}

function getPolygon(
  dimension_to_bow,
  dimension_to_port,
  dimension_to_starboard,
  dimension_to_stern,
  true_heading,
  latitude,
  longitude
) {
  const angle = ((true_heading + 180) % 360) - 180;

  const beakSize = (dimension_to_bow + dimension_to_stern) / 10;

  const gpsLocation = turf.point([longitude, latitude]);

  const horizontalAngle = angle + 90;
  const a = turf.destination(
    gpsLocation,
    (dimension_to_bow - beakSize) / 1000,
    angle
  );
  const b = turf.destination(gpsLocation, -dimension_to_stern / 1000, angle);
  const c = turf.destination(b, dimension_to_starboard / 1000, horizontalAngle);
  const d = turf.destination(a, dimension_to_starboard / 1000, horizontalAngle);
  const e = turf.destination(b, -dimension_to_port / 1000, horizontalAngle);
  const f = turf.destination(a, -dimension_to_port / 1000, horizontalAngle);
  const midPoint = turf.midpoint(d, f);
  const spike = turf.destination(midPoint, beakSize / 1000, angle);
  const newPolygon = [
    [e.geometry.coordinates[1], e.geometry.coordinates[0]],
    [c.geometry.coordinates[1], c.geometry.coordinates[0]],
    [d.geometry.coordinates[1], d.geometry.coordinates[0]],

    [spike.geometry.coordinates[1], spike.geometry.coordinates[0]],

    [f.geometry.coordinates[1], f.geometry.coordinates[0]],
  ];

  return newPolygon;
}

function shipHasDimensionsAndDirection(
  dimension_to_bow,
  dimension_to_port,
  dimension_to_starboard,
  dimension_to_stern,
  true_heading
) {
  return (
    dimension_to_bow != null &&
    dimension_to_port != null &&
    dimension_to_starboard != null &&
    dimension_to_stern != null &&
    true_heading != null
  );
}

export { getPolygon, getPolygonCentroid, shipHasDimensionsAndDirection };
