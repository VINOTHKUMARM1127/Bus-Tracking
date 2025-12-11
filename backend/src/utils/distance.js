/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate total distance from an array of location points
 * @param {Array} points - Array of {lat, lng} objects
 * @returns {number} Total distance in meters
 */
export function calculateTotalDistance(points) {
  if (!points || points.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    totalDistance += haversineDistance(
      prev.lat,
      prev.lng,
      curr.lat,
      curr.lng
    );
  }
  return totalDistance;
}

/**
 * Calculate average speed from location points
 * @param {Array} points - Array of {lat, lng, ts, speed} objects
 * @returns {number} Average speed in km/h
 */
export function calculateAverageSpeed(points) {
  if (!points || points.length < 2) return 0;

  const speeds = points
    .filter((p) => p.speed != null && p.speed > 0)
    .map((p) => p.speed);

  if (speeds.length === 0) {
    // Calculate from distance and time
    const first = points[0];
    const last = points[points.length - 1];
    const distance = calculateTotalDistance(points) / 1000; // km
    const timeHours = (last.ts - first.ts) / (1000 * 60 * 60); // hours
    return timeHours > 0 ? distance / timeHours : 0;
  }

  const sum = speeds.reduce((acc, s) => acc + s, 0);
  return sum / speeds.length;
}

/**
 * Calculate maximum speed from location points
 * @param {Array} points - Array of {speed} objects
 * @returns {number} Maximum speed in km/h
 */
export function calculateMaxSpeed(points) {
  if (!points || points.length === 0) return 0;

  const speeds = points
    .filter((p) => p.speed != null && p.speed > 0)
    .map((p) => p.speed);

  return speeds.length > 0 ? Math.max(...speeds) : 0;
}

