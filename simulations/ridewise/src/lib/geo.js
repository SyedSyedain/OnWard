/**
 * Geographic helpers.
 */

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/**
 * Great-circle distance between two points in kilometres (haversine formula).
 * @param {{lat: number, lng: number}} a
 * @param {{lat: number, lng: number}} b
 * @returns {number}
 */
export function distanceKm(a, b) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * True when the value looks like a { lat, lng } coordinate.
 * @param {unknown} point
 * @returns {boolean}
 */
export function isValidPoint(point) {
  return (
    point != null &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    Math.abs(point.lat) <= 90 &&
    Math.abs(point.lng) <= 180
  );
}
