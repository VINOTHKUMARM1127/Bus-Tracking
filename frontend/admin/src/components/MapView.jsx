import { useEffect, useMemo, useState } from 'react';
import { LayerGroup, LayersControl, MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
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
      className="h-full w-full rounded-2xl z-0"
    >
      <LayersControl position="topleft">
        <LayersControl.BaseLayer name="Street View">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked name="Satellite View">
          <LayerGroup>
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            />
          </LayerGroup>
        </LayersControl.BaseLayer>
      </LayersControl>

      <MapUpdater locations={locations} />
      {/* ... rest of the components */}

      <MapUpdater locations={locations} />
      {routeCoords.length > 1 && (
        <Polyline positions={routeCoords} pathOptions={{ color: '#8b5cf6', weight: 4, opacity: 0.7 }} />
      )}
      {(locations || []).map((loc) => (
        <Marker
          key={loc._id || `${loc.lat}-${loc.lng}`}
          position={[loc.lat, loc.lng]}
          eventHandlers={{
            click: () => loadRoute(loc.driver, loc.username, loc.busNumber)
          }}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={0.9} permanent className="glass-tooltip">
            {loc.username || loc.busNumber || 'Driver'}
          </Tooltip>
          <Popup className="glass-popup">
            <div className="text-sm space-y-1">
              <div className="font-bold text-gray-800">{loc.busNumber || 'Unassigned'}</div>
              {loc.username && <div className="text-gray-600">User: <span className="font-medium text-gray-800">{loc.username}</span></div>}
              <div className="text-xs text-gray-500">
                <span className={`inline-block w-2 H-2 rounded-full mr-1 ${loc.isTracking ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                {loc.isTracking ? 'Live Tracking' : 'Stopped'}
              </div>
              <div className="text-[10px] text-gray-400">
                Updated: {new Date(loc.updatedAt).toLocaleTimeString()}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      <div className="leaflet-top leaflet-right">
        <div className="m-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl px-4 py-3 text-sm text-gray-200 space-y-2 min-w-[200px] transition-all">
          <div className="font-bold text-white border-b border-white/10 pb-1">Driver Route</div>
          {routeLoading && <div className="text-purple-300 animate-pulse">Loading route...</div>}
          {!routeLoading && routeTitle && <div className="text-white font-medium">{routeTitle}</div>}
          {!routeLoading && routeError && <div className="text-red-400 text-xs">{routeError}</div>}
          {!routeLoading && !routeError && routeCoords.length > 1 && (
            <div className="text-gray-300 text-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              {routeCoords.length} track points
            </div>
          )}
          {!routeLoading && routeCoords.length <= 1 && !routeError && (
            <div className="text-gray-500 text-xs italic">Click a bus marker to view route history</div>
          )}
        </div>
      </div>
    </MapContainer>
  );
}


