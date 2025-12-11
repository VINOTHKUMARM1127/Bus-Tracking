import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.jsx';
import { useSocket } from './hooks/useSocket.js';
import { api } from './api.js';
import Layout from './components/Layout.jsx';
import LoginForm from './components/LoginForm.jsx';
import DriverForm from './components/DriverForm.jsx';
import DriverList from './components/DriverList.jsx';
import MapView from './components/MapView.jsx';
import DashboardStats from './components/DashboardStats.jsx';
import RouteList from './pages/Routes/RouteList.jsx';
import RouteEditor from './pages/Routes/RouteEditor.jsx';
import AssignDriverModal from './pages/Routes/AssignDriverModal.jsx';
import TripHistory from './pages/Trips/TripHistory.jsx';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard.jsx';
import AlertsPage from './pages/Alerts/AlertsPage.jsx';

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
  loading
}) => {
  return (
    <div className="space-y-6">
      <DashboardStats
        totalDrivers={drivers.length}
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
          <DriverList drivers={drivers} loading={loading} readOnly />
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

const DriversListPage = ({ drivers, refreshDrivers, loading }) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">Drivers</h3>
          <p className="text-sm text-gray-500">Manage all drivers</p>
        </div>
        <button
          className="text-sm px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={() => navigate('/drivers/new')}
        >
          Create Driver
        </button>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="font-semibold mb-4">All Drivers</h3>
        <DriverList drivers={drivers} onUpdate={refreshDrivers} loading={loading} />
      </div>
    </div>
  );
};

const DriverCreatePage = ({ refreshDrivers }) => {
  const navigate = useNavigate();
  const handleCreated = () => {
    refreshDrivers?.();
    navigate('/drivers');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">Create Driver</h3>
          <p className="text-sm text-gray-500">Add a new driver account</p>
        </div>
        <button
          className="text-sm px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
          onClick={() => navigate('/drivers')}
        >
          Back to list
        </button>
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <DriverForm onCreated={handleCreated} />
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
  const { socket, connected, on, off } = useSocket(isAuthed);

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

    // Socket.io real-time updates
    if (socket && connected) {
      on('location:update', (location) => {
        setLocations((prev) => {
          const index = prev.findIndex((l) => l.driver?.toString() === location.driver?.toString());
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = location;
            return updated;
          }
          return [...prev, location];
        });
        setLastUpdate(new Date());
      });

      on('trip:update', (data) => {
        // Refresh trips if needed
        console.log('Trip update:', data);
      });

      on('alert:new', (alert) => {
        // Show notification or update alerts list
        console.log('New alert:', alert);
      });
    }

    // Polling interval - fallback if socket not connected
    const intervalId = setInterval(() => {
      if (!connected) {
        fetchLocations();
      }
    }, 10000);

    // Handle page visibility
    const handleVisibilityChange = () => {
      if (!document.hidden && !connected) {
        fetchLocations();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (socket) {
        off('location:update');
        off('trip:update');
        off('alert:new');
      }
    };
  }, [isAuthed, socket, connected, on, off]);

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
                    />
                  }
                />
                <Route
                  path="/drivers"
                  element={
                    <DriversListPage
                      drivers={drivers}
                      refreshDrivers={fetchDrivers}
                      loading={loading}
                      liveStatusByDriver={liveStatusByDriver}
                    />
                  }
                />
                <Route
                  path="/drivers/new"
                  element={<DriverCreatePage refreshDrivers={fetchDrivers} />}
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
                <Route path="/routes" element={<RouteList />} />
                <Route path="/routes/new" element={<RouteEditor />} />
                <Route path="/routes/:id/edit" element={<RouteEditor />} />
                <Route path="/routes/:id/assign" element={<AssignDriverRoute />} />
                <Route path="/trips" element={<TripHistory />} />
                <Route path="/trips/:id" element={<TripDetails />} />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/alerts" element={<AlertsPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// Helper component for assign driver route
function AssignDriverRoute() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showModal, setShowModal] = useState(true);

  return showModal ? (
    <AssignDriverModal
      routeId={id}
      onClose={() => {
        setShowModal(false);
        navigate('/routes');
      }}
      onSuccess={() => {
        setShowModal(false);
        navigate('/routes');
      }}
    />
  ) : null;
}

// Placeholder for trip details
function TripDetails() {
  const { id } = useParams();
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Trip Details</h3>
      <p className="text-gray-600">Trip ID: {id}</p>
      <p className="text-sm text-gray-500">Full trip details view - TODO: Implement</p>
    </div>
  );
}

