import { useState } from 'react';
import { api } from '../api.js';

export default function DriverList({
  drivers,
  onUpdate,
  loading = false,
  liveStatusByDriver,
  readOnly = false
}) {
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState('');

  const updateBus = async (driverId, busNumber) => {
    if (readOnly) return;
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!drivers.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No drivers found.</p>
        <p className="text-sm text-gray-500">Create a driver to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!readOnly && message && (
        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 px-4 py-2 rounded-xl text-sm mb-4">
          {message}
        </div>
      )}

      {/* Mobile cards */}
      <div className="grid gap-4 sm:hidden">
        {drivers.map((driver) => (
          <div key={driver._id || driver.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="font-bold text-white text-lg break-words">
                  {driver.username}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {liveStatusByDriver?.get(driver._id || driver.id) ? (
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${liveStatusByDriver.get(driver._id || driver.id).isTracking
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        }`}
                    >
                      {liveStatusByDriver.get(driver._id || driver.id).isTracking
                        ? 'Tracking Live'
                        : 'Stopped'}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs italic">Offline</span>
                  )}
                </div>
              </div>
              <input
                defaultValue={driver.busNumber || ''}
                onBlur={
                  readOnly ? undefined : (e) => updateBus(driver._id || driver.id, e.target.value)
                }
                className={`bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 w-24 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 ${readOnly ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                placeholder="Bus #"
                disabled={readOnly}
              />
            </div>
            {!readOnly && (
              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button
                  className="flex-1 text-xs px-3 py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  onClick={() => changePassword(driver._id || driver.id)}
                  disabled={busyId === (driver._id || driver.id)}
                >
                  Reset Pass
                </button>
                <button
                  className="flex-1 text-xs px-3 py-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors border border-red-500/20"
                  onClick={() =>
                    deleteDriver(driver._id || driver.id, driver.username || 'driver')
                  }
                  disabled={busyId === (driver._id || driver.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table for sm+ */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-white/5 text-gray-400 uppercase text-xs font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Bus Number</th>
              {!readOnly && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-white/5 text-gray-300">
            {drivers.map((driver) => (
              <tr key={driver._id || driver.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white">
                  {driver.username}
                </td>
                <td className="px-6 py-4">
                  {liveStatusByDriver?.get(driver._id || driver.id) ? (
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${liveStatusByDriver.get(driver._id || driver.id).isTracking
                          ? 'bg-green-400/10 text-green-400 border-green-400/20'
                          : 'bg-orange-400/10 text-orange-400 border-orange-400/20'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${liveStatusByDriver.get(driver._id || driver.id).isTracking ? 'bg-green-400' : 'bg-orange-400'
                        }`}></span>
                      {liveStatusByDriver.get(driver._id || driver.id).isTracking
                        ? 'Tracking'
                        : 'Stopped'}
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs">Offline</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <input
                    defaultValue={driver.busNumber || ''}
                    onBlur={
                      readOnly
                        ? undefined
                        : (e) => updateBus(driver._id || driver.id, e.target.value)
                    }
                    className={`bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 w-32 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all ${readOnly ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    placeholder="Bus #"
                    disabled={readOnly}
                  />
                </td>
                {!readOnly && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={() => changePassword(driver._id || driver.id)}
                        disabled={busyId === (driver._id || driver.id)}
                      >
                        Change Pass
                      </button>
                      <button
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors border border-red-500/20"
                        onClick={() =>
                          deleteDriver(driver._id || driver.id, driver.username || 'driver')
                        }
                        disabled={busyId === (driver._id || driver.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {busyId && <p className="text-xs text-center text-purple-300 animate-pulse">Processing update...</p>}
    </div>
  );
}


