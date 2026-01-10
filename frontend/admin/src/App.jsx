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
  loading
}) => {
  return (
    <div className="space-y-8">
      <DashboardStats
        totalDrivers={drivers.length}
        trackedBuses={locations.length}
      />
      {(error || lastUpdate) && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <div className="text-sm">
            {error ? (
              <span className="text-red-400 font-medium bg-red-400/10 px-2 py-1 rounded">{error}</span>
            ) : (
              <span className="text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Last updated: <span className="text-white font-mono">{lastUpdate?.toLocaleTimeString() || 'Never'}</span>
              </span>
            )}
          </div>
          <button
            onClick={onRefresh}
            className="text-xs px-4 py-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/30 transition-colors uppercase tracking-wider font-semibold"
          >
            Refresh Now
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Drivers Directory
          </h3>
          <DriverList drivers={drivers} loading={loading} readOnly />
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0121 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7" /></svg>
            Live Map
          </h3>
          <div className="flex-1 min-h-[420px] rounded-2xl overflow-hidden border border-white/10 relative">
            {loading ? (
              <div className="absolute inset-0 bg-white/5 animate-pulse" />
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-bold text-2xl text-white tracking-tight">Drivers Management</h3>
          <p className="text-sm text-gray-400">View and manage your driver fleet</p>
        </div>
        <button
          className="text-sm font-semibold px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 shadow-lg shadow-purple-500/20 transform hover:-translate-y-0.5 transition-all"
          onClick={() => navigate('/drivers/new')}
        >
          + Add New Driver
        </button>
      </div>
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl">
        <h3 className="font-bold text-white mb-6 text-lg">All Drivers Directory</h3>
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-bold text-2xl text-white tracking-tight">Create Driver</h3>
          <p className="text-sm text-gray-400">Add a new driver account to the system</p>
        </div>
        <button
          className="text-sm font-medium px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/10 transition-colors"
          onClick={() => navigate('/drivers')}
        >
          ← Back to list
        </button>
      </div>
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
        <DriverForm onCreated={handleCreated} />
      </div>
    </div>
  );
};

const MapPage = ({ locations, onRefresh, lastUpdate, error, loading }) => {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl h-[calc(100vh-140px)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-bold text-xl text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Live Bus Locations
          </h3>
          <p className="text-sm text-gray-400 ml-8">Real-time tracking of active buses</p>
        </div>
        <div className="flex items-center gap-4 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
          <div className="text-sm text-gray-300">
            Active Buses: <span className="font-bold text-white ml-1">{locations.length}</span>
          </div>
          <div className="h-4 w-px bg-white/10"></div>
          {lastUpdate && (
            <p className="text-xs text-gray-500 font-mono">
              {lastUpdate.toLocaleTimeString()}
            </p>
          )}
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 hover:text-indigo-200 transition-colors"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
      <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 relative">
        {loading ? (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        ) : (
          <MapView locations={locations} />
        )}
      </div>
    </div>
  );
};

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
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

