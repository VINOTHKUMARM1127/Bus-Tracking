import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api.js';

export default function RouteEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    stops: [],
    geofence: null,
    speedLimit: ''
  });

  useEffect(() => {
    if (isEdit) {
      fetchRoute();
    }
  }, [id]);

  const fetchRoute = async () => {
    try {
      const { data } = await api.get(`/routes/${id}`);
      setFormData({
        name: data.name || '',
        stops: data.stops || [],
        geofence: data.geofence || null,
        speedLimit: data.speedLimit || ''
      });
    } catch (err) {
      alert('Failed to load route');
      navigate('/routes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        stops: formData.stops,
        speedLimit: formData.speedLimit ? Number(formData.speedLimit) : undefined
      };

      if (formData.geofence) {
        payload.geofence = formData.geofence;
      }

      if (isEdit) {
        await api.put(`/routes/${id}`, payload);
      } else {
        await api.post('/routes', payload);
      }

      navigate('/routes');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save route');
    } finally {
      setLoading(false);
    }
  };

  const addStop = () => {
    setFormData({
      ...formData,
      stops: [
        ...formData.stops,
        { lat: 0, lng: 0, name: '', etaOrder: formData.stops.length }
      ]
    });
  };

  const updateStop = (index, field, value) => {
    const stops = [...formData.stops];
    stops[index] = { ...stops[index], [field]: value };
    setFormData({ ...formData, stops });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-gray-800">
          {isEdit ? 'Edit Route' : 'Create Route'}
        </h3>
        <button
          onClick={() => navigate('/routes')}
          className="text-sm px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Route Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Speed Limit (km/h) - Optional
          </label>
          <input
            type="number"
            value={formData.speedLimit}
            onChange={(e) => setFormData({ ...formData, speedLimit: e.target.value })}
            className="w-full border rounded px-3 py-2"
            placeholder="Leave empty for default"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Stops
            </label>
            <button
              type="button"
              onClick={addStop}
              className="text-sm px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Add Stop
            </button>
          </div>

          <div className="space-y-3">
            {formData.stops.map((stop, index) => (
              <div key={index} className="border rounded p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Stop name"
                    value={stop.name}
                    onChange={(e) => updateStop(index, 'name', e.target.value)}
                    className="border rounded px-2 py-1"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Order"
                    value={stop.etaOrder}
                    onChange={(e) => updateStop(index, 'etaOrder', Number(e.target.value))}
                    className="border rounded px-2 py-1"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={stop.lat}
                    onChange={(e) => updateStop(index, 'lat', Number(e.target.value))}
                    className="border rounded px-2 py-1"
                    required
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={stop.lng}
                    onChange={(e) => updateStop(index, 'lng', Number(e.target.value))}
                    className="border rounded px-2 py-1"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Note: Use map picker in production to select coordinates
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Route'}
          </button>
        </div>
      </form>
    </div>
  );
}

