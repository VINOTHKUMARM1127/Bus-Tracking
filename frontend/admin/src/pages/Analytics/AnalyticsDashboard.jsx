import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../../api.js';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [tripsPerDay, setTripsPerDay] = useState([]);
  const [topOverspeed, setTopOverspeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [statsRes, tripsRes, overspeedRes] = await Promise.all([
        api.get('/analytics/dashboard-stats'),
        api.get('/analytics/trips-per-day'),
        api.get('/analytics/top-overspeed-drivers')
      ]);

      setStats(statsRes.data);
      setTripsPerDay(tripsRes.data || []);
      setTopOverspeed(overspeedRes.data || []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg text-gray-800">Analytics Dashboard</h3>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Trips</div>
            <div className="text-2xl font-bold">{stats.totalTrips}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Today's Trips</div>
            <div className="text-2xl font-bold">{stats.todayTrips}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Active Trips</div>
            <div className="text-2xl font-bold">{stats.activeTrips}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Total Alerts</div>
            <div className="text-2xl font-bold">{stats.totalAlerts}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Unacknowledged</div>
            <div className="text-2xl font-bold text-red-600">{stats.unacknowledgedAlerts}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm text-gray-500">Active Drivers</div>
            <div className="text-2xl font-bold">{stats.activeDrivers}</div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="font-semibold mb-4">Trips Per Day</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tripsPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#4f46e5" name="Trips" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h4 className="font-semibold mb-4">Top Overspeed Drivers</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topOverspeed}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="driverName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="alertCount" fill="#dc2626" name="Overspeed Alerts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

