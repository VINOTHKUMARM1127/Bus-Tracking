import { useState, useEffect } from 'react';
import { api } from '../../api.js';

export default function AssignDriverModal({ routeId, onClose, onSuccess }) {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const { data } = await api.get('/admin/drivers');
      setDrivers(data || []);
    } catch (err) {
      console.error('Failed to load drivers:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/routes/${routeId}/assign-driver`, {
        driverId: selectedDriver || null
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      alert('Failed to assign driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="font-semibold text-lg mb-4">Assign Driver to Route</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Driver
            </label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">No driver (unassign)</option>
              {drivers.map((driver) => (
                <option key={driver._id || driver.id} value={driver._id || driver.id}>
                  {driver.username} {driver.busNumber ? `(${driver.busNumber})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

