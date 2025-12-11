import { haversineDistance } from './distance.js';

/**
 * Check if a point is inside a polygon using ray casting algorithm
 * @param {number} lat - Latitude of point
 * @param {number} lng - Longitude of point
 * @param {Array} polygon - Array of [lat, lng] coordinates
 * @returns {boolean} True if point is inside polygon
 */
export function pointInPolygon(lat, lng, polygon) {
  if (!polygon || polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > lng !== yj > lng &&
      lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Check if a point is inside a circle
 * @param {number} lat - Latitude of point
 * @param {number} lng - Longitude of point
 * @param {Object} circle - { center: [lat, lng], radius: number } in meters
 * @returns {boolean} True if point is inside circle
 */
export function pointInCircle(lat, lng, circle) {
  if (!circle || !circle.center || !circle.radius) return false;

  const distance = haversineDistance(
    lat,
    lng,
    circle.center[0],
    circle.center[1]
  );
  return distance <= circle.radius;
}

/**
 * Check if a location is within a geofence
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Object} geofence - { type: 'polygon'|'circle', coords: ... }
 * @returns {boolean} True if inside geofence
 */
export function checkGeofence(lat, lng, geofence) {
  if (!geofence || !geofence.type || !geofence.coords) return true; // No geofence = always allowed

  if (geofence.type === 'polygon') {
    return pointInPolygon(lat, lng, geofence.coords);
  } else if (geofence.type === 'circle') {
    return pointInCircle(lat, lng, geofence.coords);
  }

  return true; // Unknown type = allow
}

/**
 * Calculate distance from point to nearest edge of geofence
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Object} geofence - Geofence object
 * @returns {number} Distance in meters (0 if inside)
 */
export function distanceFromGeofence(lat, lng, geofence) {
  if (!geofence || !geofence.type || !geofence.coords) return 0;

  const isInside = checkGeofence(lat, lng, geofence);

  if (isInside) return 0;

  if (geofence.type === 'circle') {
    const distance = haversineDistance(
      lat,
      lng,
      geofence.coords.center[0],
      geofence.coords.center[1]
    );
    return Math.max(0, distance - geofence.coords.radius);
  } else if (geofence.type === 'polygon') {
    // Find minimum distance to any edge of polygon
    let minDistance = Infinity;
    const polygon = geofence.coords;

    for (let i = 0; i < polygon.length; i++) {
      const j = (i + 1) % polygon.length;
      const dist = haversineDistance(
        lat,
        lng,
        polygon[i][0],
        polygon[i][1]
      );
      minDistance = Math.min(minDistance, dist);
    }

    return minDistance;
  }

  return 0;
}

