import { useState } from 'react';
import { api } from '../api.js';

export default function DriverList({
  drivers,
  onUpdate,
  loading = false,
  liveStatusByDriver
}) {
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

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

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
            <div className="flex justify-between gap-3">
              <div className="space-y-1">
                <div className="font-semibold text-gray-800 break-words">
                  {driver.username}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  {liveStatusByDriver?.get(driver._id || driver.id) && (
                    <span>
                      Live:{' '}
                      <span
                        className={`px-2 py-1 rounded text-[11px] ${
                          liveStatusByDriver.get(driver._id || driver.id).isTracking
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {liveStatusByDriver.get(driver._id || driver.id).isTracking
                          ? 'Tracking'
                          : 'Stopped'}
                      </span>
                    </span>
                  )}
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
              {/* View action removed */}
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
              <th className="text-left px-3 py-2">Live</th>
              <th className="text-left px-3 py-2">Bus</th>
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
                  {liveStatusByDriver?.get(driver._id || driver.id) ? (
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        liveStatusByDriver.get(driver._id || driver.id).isTracking
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {liveStatusByDriver.get(driver._id || driver.id).isTracking
                        ? 'Tracking'
                        : 'Stopped'}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">No data</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <input
                    defaultValue={driver.busNumber || ''}
                    onBlur={(e) => updateBus(driver._id || driver.id, e.target.value)}
                    className="border rounded px-2 py-1 w-32"
                    placeholder="Bus #"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end flex-wrap gap-2">
                  <button
                    className="text-xs px-3 py-1 rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
                    onClick={() => changePassword(driver._id || driver.id)}
                    disabled={busyId === (driver._id || driver.id)}
                  >
                    Change Password
                  </button>
                  {/* View action removed */}
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


