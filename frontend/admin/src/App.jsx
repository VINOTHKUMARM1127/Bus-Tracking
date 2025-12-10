import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import { api } from './api.js';
import Layout from './components/Layout.jsx';
import LoginForm from './components/LoginForm.jsx';
import DriverForm from './components/DriverForm.jsx';
import DriverList from './components/DriverList.jsx';
import MapView from './components/MapView.jsx';
import DashboardStats from './components/DashboardStats.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthed } = useAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
};

const DashboardPage = ({
  drivers,
  locations,
  onRefresh,
  lastUpdate,
  error,
  loading,
  refreshDrivers
}) => {
  const activeDrivers = drivers.filter((d) => d.isActive).length;
  return (
    <div className="space-y-6">
      <DashboardStats
        totalDrivers={drivers.length}
        activeDrivers={activeDrivers}
        trackedBuses={locations.length}
      />
      {(error || lastUpdate) && (
        <div className="bg-white shadow rounded-lg p-3 flex items-center justify-between">
          <div className="text-sm">
            {error ? (
              <span className="text-red-600">{error}</span>
            ) : (
              <span className="text-gray-600">
                Last updated: {lastUpdate?.toLocaleTimeString() || 'Never'}
              </span>
            )}
          </div>
          <button
            onClick={onRefresh}
            className="text-xs px-3 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200"
          >
            Refresh Now
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-semibold mb-4">Drivers</h3>
          <DriverList drivers={drivers} loading={loading} onUpdate={refreshDrivers} />
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-semibold mb-4">Live Map</h3>
          <div className="h-[420px]">
            {loading ? (
              <div className="h-full w-full bg-gray-100 rounded animate-pulse" />
            ) : (
              <MapView locations={locations} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DriversPage = ({ drivers, refreshDrivers, loading }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="font-semibold mb-4">Create Driver</h3>
        <DriverForm onCreated={refreshDrivers} />
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="font-semibold mb-4">All Drivers</h3>
        <DriverList drivers={drivers} onUpdate={refreshDrivers} loading={loading} />
      </div>
    </div>
  );
};

const MapPage = ({ locations, onRefresh, lastUpdate, error, loading }) => (
  <div className="bg-white shadow rounded-lg p-4">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div>
        <h3 className="font-semibold">Live Bus Locations</h3>
        <p className="text-sm text-gray-500">Auto-refreshes every 10 seconds</p>
        {lastUpdate && (
          <p className="text-xs text-gray-400">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">Buses: {locations.length}</span>
        <button
          onClick={onRefresh}
          className="text-xs px-3 py-1 bg-indigo-100 text-indigo-800 rounded hover:bg-indigo-200"
        >
          Refresh
        </button>
      </div>
    </div>
    <div className="h-[520px]">
      {loading ? (
        <div className="h-full w-full bg-gray-100 rounded animate-pulse" />
      ) : (
        <MapView locations={locations} />
      )}
    </div>
  </div>
);

export default function App() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState('');

  const fetchDrivers = async () => {
    try {
      const { data } = await api.get('/admin/drivers');
      setDrivers(data || []);
      setError('');
    } catch (err) {
      console.error('Failed to load drivers', err);
      setError('Failed to load drivers. Check connection.');
    }
  };

  const fetchLocations = async () => {
    try {
      const { data } = await api.get('/admin/locations');
      setLocations(data || []);
      setLastUpdate(new Date());
      setError('');
    } catch (err) {
      console.error('Failed to load locations', err);
      setError('Failed to load locations. Retrying...');
    }
  };

  useEffect(() => {
    if (!isAuthed) return;

    // Initial load
    setLoading(true);
    Promise.all([fetchDrivers(), fetchLocations()]).finally(() => setLoading(false));

    // Polling interval - refresh every 10 seconds
    const intervalId = setInterval(() => {
      fetchLocations();
    }, 10000);

    // Handle page visibility - pause when tab is hidden, resume when visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, but keep interval running (just slower)
        // Or clear it if you want to pause completely
      } else {
        // Tab is visible, refresh immediately
        fetchLocations();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthed]);

  const handleLoginSuccess = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    fetchLocations();
    fetchDrivers();
  };

  const latestByDriverAll = useMemo(() => {
    const map = new Map();
    locations.forEach((loc) => {
      const existing = map.get(loc.driver);
      if (!existing || new Date(loc.updatedAt) > new Date(existing.updatedAt)) {
        map.set(loc.driver, loc);
      }
    });
    return Array.from(map.values());
  }, [locations]);

  const latestByDriverActive = useMemo(
    () => latestByDriverAll.filter((loc) => loc.isTracking),
    [latestByDriverAll]
  );

  const liveStatusByDriver = useMemo(() => {
    const map = new Map();
    latestByDriverAll.forEach((loc) => {
      map.set(loc.driver, { isTracking: loc.isTracking, updatedAt: loc.updatedAt });
    });
    return map;
  }, [latestByDriverAll]);

  return (
    <Routes>
      <Route path="/login" element={<LoginForm onSuccess={handleLoginSuccess} />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout loading={loading}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <DashboardPage
                      drivers={drivers}
                      locations={latestByDriverActive}
                      onRefresh={handleRefresh}
                      lastUpdate={lastUpdate}
                      error={error}
                      loading={loading}
                      refreshDrivers={fetchDrivers}
                    />
                  }
                />
                <Route
                  path="/drivers"
                  element={
                    <DriversPage
                      drivers={drivers}
                      refreshDrivers={fetchDrivers}
                      loading={loading}
                      liveStatusByDriver={liveStatusByDriver}
                    />
                  }
                />
                <Route
                  path="/map"
                  element={
                    <MapPage
                      locations={latestByDriverActive}
                      onRefresh={handleRefresh}
                      lastUpdate={lastUpdate}
                      error={error}
                      loading={loading}
                    />
                  }
                />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

