import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../api.js';

// fix default icon paths for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const defaultCenter = [12.9716, 77.5946]; // Bangalore fallback

// Component to update map bounds when locations change
function MapUpdater({ locations }) {
  const map = useMap();

  useEffect(() => {
    if (locations && locations.length > 0) {
      const bounds = L.latLngBounds(
        locations.map((loc) => [loc.lat, loc.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [locations, map]);

  return null;
}

export default function MapView({ locations }) {
  const center = useMemo(() => {
    return locations?.[0] ? [locations[0].lat, locations[0].lng] : defaultCenter;
  }, [locations]);

  const [routeCoords, setRouteCoords] = useState([]);
  const [routeTitle, setRouteTitle] = useState('');
  const [routeError, setRouteError] = useState('');
  const [routeLoading, setRouteLoading] = useState(false);

  const loadRoute = async (driverId, username, busNumber) => {
    setRouteLoading(true);
    setRouteError('');
    setRouteTitle(username || busNumber || 'Driver route');
    try {
      const { data } = await api.get(`/admin/drivers/${driverId}/location`);
      const coords = (data?.history || []).map((loc) => [loc.lat, loc.lng]);
      setRouteCoords(coords);
    } catch (err) {
      setRouteCoords([]);
      setRouteError(err.response?.data?.message || 'No route found');
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="h-full w-full rounded"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater locations={locations} />
      {routeCoords.length > 1 && (
        <Polyline positions={routeCoords} pathOptions={{ color: '#2563eb', weight: 4 }} />
      )}
      {(locations || []).map((loc) => (
        <Marker
          key={loc._id || `${loc.lat}-${loc.lng}`}
          position={[loc.lat, loc.lng]}
          eventHandlers={{
            click: () => loadRoute(loc.driver, loc.username, loc.busNumber)
          }}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent>
            {loc.username || loc.busNumber || 'Driver'}
          </Tooltip>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{loc.busNumber || 'Unassigned'}</div>
              {loc.username && <div>User: {loc.username}</div>}
              <div>Lat: {loc.lat.toFixed(4)}</div>
              <div>Lng: {loc.lng.toFixed(4)}</div>
              <div>Status: {loc.isTracking ? 'Tracking' : 'Stopped'}</div>
              <div className="text-xs text-gray-500">
                Updated: {new Date(loc.updatedAt).toLocaleString()}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      <div className="leaflet-top leaflet-right">
        <div className="m-2 bg-white/90 backdrop-blur rounded shadow px-3 py-2 text-xs text-gray-800 space-y-1 min-w-[180px]">
          <div className="font-semibold text-gray-700">Driver Route</div>
          {routeLoading && <div className="text-gray-500">Loading route...</div>}
          {!routeLoading && routeTitle && <div className="text-gray-700">{routeTitle}</div>}
          {!routeLoading && routeError && <div className="text-red-600">{routeError}</div>}
          {!routeLoading && !routeError && routeCoords.length > 1 && (
            <div className="text-gray-600">Points: {routeCoords.length}</div>
          )}
          {!routeLoading && routeCoords.length <= 1 && !routeError && (
            <div className="text-gray-500">Click a marker to load route</div>
          )}
        </div>
      </div>
    </MapContainer>
  );
}


