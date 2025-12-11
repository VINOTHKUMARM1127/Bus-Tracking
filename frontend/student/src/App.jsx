import { useState, useEffect } from 'react';
import { api } from './api.js';

// Simple student app to view live buses
export default function StudentApp() {
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuses();
    const interval = setInterval(fetchBuses, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchBuses = async () => {
    try {
      const { data } = await api.get('/buses/live');
      setBuses(data || []);
      if (selectedBus) {
        const updated = data.find(b => b.busId === selectedBus.busId);
        if (updated) setSelectedBus(updated);
      }
    } catch (err) {
      console.error('Failed to fetch buses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading buses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Live Bus Tracking</h1>

        {!selectedBus ? (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Select a Bus</h2>
            {buses.length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <p className="text-gray-600">No buses currently tracking</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {buses.map((bus) => (
                  <button
                    key={bus.busId}
                    onClick={() => setSelectedBus(bus)}
                    className="bg-white shadow rounded-lg p-4 text-left hover:bg-gray-50"
                  >
                    <div className="font-semibold">{bus.busId}</div>
                    <div className="text-sm text-gray-600">
                      Route: {bus.routeName || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last update: {new Date(bus.updatedAt).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{selectedBus.busId}</h2>
              <button
                onClick={() => setSelectedBus(null)}
                className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Back
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Current Location</div>
                <div className="font-medium">
                  {selectedBus.lat.toFixed(6)}, {selectedBus.lng.toFixed(6)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Speed</div>
                <div className="font-medium">
                  {selectedBus.speed ? `${selectedBus.speed.toFixed(1)} km/h` : 'N/A'}
                </div>
              </div>
            </div>

            {selectedBus.etaToStops && selectedBus.etaToStops.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">ETA to Stops</h3>
                <div className="space-y-2">
                  {selectedBus.etaToStops.map((stop, idx) => (
                    <div key={idx} className="border rounded p-2">
                      <div className="font-medium">{stop.stopName}</div>
                      <div className="text-sm text-gray-600">
                        Distance: {stop.distance}m
                        {stop.etaMinutes && ` • ETA: ${stop.etaMinutes} min`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 text-center">
              Updates every 10 seconds
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

