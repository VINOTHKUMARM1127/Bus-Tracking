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

const DashboardPage = ({ drivers, locations }) => {
  const activeDrivers = drivers.filter((d) => d.isActive).length;
  return (
    <div className="space-y-6">
      <DashboardStats
        totalDrivers={drivers.length}
        activeDrivers={activeDrivers}
        trackedBuses={locations.length}
      />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-semibold mb-4">Drivers</h3>
          <DriverList drivers={drivers} />
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="font-semibold mb-4">Live Map</h3>
          <div className="h-[420px]">
            <MapView locations={locations} />
          </div>
        </div>
      </div>
    </div>
  );
};

const DriversPage = ({ drivers, refreshDrivers }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="font-semibold mb-4">Create Driver</h3>
        <DriverForm onCreated={refreshDrivers} />
      </div>
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="font-semibold mb-4">All Drivers</h3>
        <DriverList drivers={drivers} onUpdate={refreshDrivers} />
      </div>
    </div>
  );
};

const MapPage = ({ locations }) => (
  <div className="bg-white shadow rounded-lg p-4">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-semibold">Live Bus Locations</h3>
        <p className="text-sm text-gray-500">Auto-refreshes every 10 seconds</p>
      </div>
      <span className="text-sm text-gray-600">Buses: {locations.length}</span>
    </div>
    <div className="h-[520px]">
      <MapView locations={locations} />
    </div>
  </div>
);

export default function App() {
  const { isAuthed } = useAuth();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDrivers = async () => {
    try {
      const { data } = await api.get('/admin/drivers');
      setDrivers(data || []);
    } catch (err) {
      console.error('Failed to load drivers', err);
    }
  };

  const fetchLocations = async () => {
    try {
      const { data } = await api.get('/admin/locations');
      setLocations(data || []);
    } catch (err) {
      console.error('Failed to load locations', err);
    }
  };

  useEffect(() => {
    if (!isAuthed) return;
    setLoading(true);
    Promise.all([fetchDrivers(), fetchLocations()]).finally(() => setLoading(false));
    const timer = setInterval(fetchLocations, 10000);
    return () => clearInterval(timer);
  }, [isAuthed]);

  const handleLoginSuccess = () => {
    navigate('/');
  };

  const latestByDriver = useMemo(() => {
    const map = new Map();
    locations.forEach((loc) => map.set(loc.driver, loc));
    return Array.from(map.values());
  }, [locations]);

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
                  element={<DashboardPage drivers={drivers} locations={latestByDriver} />}
                />
                <Route
                  path="/drivers"
                  element={
                    <DriversPage drivers={drivers} refreshDrivers={fetchDrivers} />
                  }
                />
                <Route path="/map" element={<MapPage locations={latestByDriver} />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

