import { useState, useEffect } from 'react';
import { api } from '../../api.js';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    acknowledged: ''
  });

  useEffect(() => {
    fetchAlerts();
  }, [filters]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      );
      const { data } = await api.get(`/alerts?${params}`);
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await api.post(`/alerts/${alertId}/acknowledge`);
      fetchAlerts();
    } catch (err) {
      alert('Failed to acknowledge alert');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'overspeed': return 'Overspeed';
      case 'out_of_route': return 'Out of Route';
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-800">Alerts</h3>
      </div>

      <div className="bg-white shadow rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="overspeed">Overspeed</option>
            <option value="out_of_route">Out of Route</option>
          </select>
          <select
            value={filters.acknowledged}
            onChange={(e) => setFilters({ ...filters, acknowledged: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">All</option>
            <option value="false">Unacknowledged</option>
            <option value="true">Acknowledged</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading alerts...</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {alerts.map((alert) => (
                <tr key={alert._id}>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {getTypeLabel(alert.type)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {alert.driverId?.username || 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{alert.message}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(alert.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert._id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.acknowledged && (
                      <span className="text-gray-400 text-xs">Acknowledged</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

