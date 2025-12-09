import { useState } from 'react';
import { api } from '../api.js';

export default function DriverList({ drivers, onUpdate }) {
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');

  const updateBus = async (driverId, busNumber) => {
    setBusyId(driverId);
    setMessage('');
    try {
      await api.patch(`/admin/drivers/${driverId}/bus`, { busNumber });
      setMessage('Bus updated');
      onUpdate?.();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const toggleStatus = async (driverId, isActive) => {
    setBusyId(driverId);
    setMessage('');
    try {
      await api.patch(`/admin/drivers/${driverId}/status`, { isActive });
      onUpdate?.();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Status update failed');
    } finally {
      setBusyId(null);
    }
  };

  const changePassword = async (driverId) => {
    const password = window.prompt('Enter new password for this driver:');
    if (!password) return;
    setBusyId(driverId);
    setMessage('');
    try {
      await api.patch(`/admin/drivers/${driverId}/password`, { password });
      setMessage('Password updated');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Password update failed');
    } finally {
      setBusyId(null);
    }
  };

  const deleteDriver = async (driverId, username) => {
    const confirmed = window.confirm(`Delete driver "${username}"? This cannot be undone.`);
    if (!confirmed) return;
    setBusyId(driverId);
    setMessage('');
    try {
      await api.delete(`/admin/drivers/${driverId}`);
      setMessage('Driver deleted');
      onUpdate?.();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  if (!drivers.length) {
    return <p className="text-sm text-gray-600">No drivers yet.</p>;
  }

  return (
    <div className="space-y-3">
      {message && <div className="text-sm text-gray-700">{message}</div>}

      {/* Mobile cards */}
      <div className="grid gap-3 sm:hidden">
        {drivers.map((driver) => (
          <div key={driver._id || driver.id} className="border rounded p-3 space-y-3 bg-white">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold text-gray-800">{driver.username}</div>
                <div className="text-xs text-gray-500">
                  Status:{' '}
                  <span
                    className={`px-2 py-1 rounded text-[11px] ${
                      driver.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {driver.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <input
                defaultValue={driver.busNumber || ''}
                onBlur={(e) => updateBus(driver._id || driver.id, e.target.value)}
                className="border rounded px-2 py-1 w-28 text-sm"
                placeholder="Bus #"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="text-xs px-3 py-1 rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
                onClick={() => changePassword(driver._id || driver.id)}
                disabled={busyId === (driver._id || driver.id)}
              >
                Change Password
              </button>
              <button
                className="text-xs px-3 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                onClick={() => toggleStatus(driver._id || driver.id, !driver.isActive)}
                disabled={busyId === (driver._id || driver.id)}
              >
                {driver.isActive ? 'Disable' : 'Enable'}
              </button>
              <button
                className="text-xs px-3 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                onClick={() =>
                  deleteDriver(driver._id || driver.id, driver.username || 'driver')
                }
                disabled={busyId === (driver._id || driver.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Table for sm+ */}
      <div className="overflow-x-auto border rounded hidden sm:block">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">Username</th>
              <th className="text-left px-3 py-2">Bus</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-right px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver._id || driver.id} className="border-t">
                <td className="px-3 py-2 font-medium text-gray-800">
                  {driver.username}
                </td>
                <td className="px-3 py-2">
                  <input
                    defaultValue={driver.busNumber || ''}
                    onBlur={(e) => updateBus(driver._id || driver.id, e.target.value)}
                    className="border rounded px-2 py-1 w-32"
                    placeholder="Bus #"
                  />
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      driver.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {driver.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button
                    className="text-xs px-3 py-1 rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
                    onClick={() => changePassword(driver._id || driver.id)}
                    disabled={busyId === (driver._id || driver.id)}
                  >
                    Change Password
                  </button>
                  <button
                    className="text-xs px-3 py-1 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                    onClick={() => toggleStatus(driver._id || driver.id, !driver.isActive)}
                    disabled={busyId === (driver._id || driver.id)}
                  >
                    {driver.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    className="text-xs px-3 py-1 rounded bg-red-100 text-red-800 hover:bg-red-200"
                    onClick={() =>
                      deleteDriver(driver._id || driver.id, driver.username || 'driver')
                    }
                    disabled={busyId === (driver._id || driver.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {busyId && <p className="text-xs text-gray-500">Updating...</p>}
    </div>
  );
}


