import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// fix default icon paths for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const defaultCenter = [12.9716, 77.5946]; // Bangalore fallback

export default function MapView({ locations }) {
  const center = locations?.[0]
    ? [locations[0].lat, locations[0].lng]
    : defaultCenter;

  return (
    <MapContainer center={center} zoom={12} className="h-full w-full rounded">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {(locations || []).map((loc) => (
        <Marker key={loc._id} position={[loc.lat, loc.lng]}>
          <Popup>
            <div className="text-sm">
              <div className="font-semibold">{loc.busNumber || 'Unassigned'}</div>
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
    </MapContainer>
  );
}


