import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';

export default function RouteList() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/routes');
      setRoutes(data || []);
      setError('');
    } catch (err) {
      console.error('Failed to load routes:', err);
      setError('Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;

    try {
      await api.delete(`/routes/${routeId}`);
      fetchRoutes();
    } catch (err) {
      alert('Failed to delete route');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading routes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-800">Routes</h3>
          <p className="text-sm text-gray-500">Manage bus routes and stops</p>
        </div>
        <button
          className="text-sm px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={() => navigate('/routes/new')}
        >
          Create Route
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded">{error}</div>
      )}

      {routes.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-600">No routes yet. Create your first route!</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stops</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speed Limit</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routes.map((route) => (
                <tr key={route._id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{route.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{route.stops?.length || 0} stops</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {route.assignedDriver?.username || 'Not assigned'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {route.speedLimit ? `${route.speedLimit} km/h` : 'Default'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right space-x-2">
                    <button
                      onClick={() => navigate(`/routes/${route._id}/edit`)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/routes/${route._id}/assign`)}
                      className="text-green-600 hover:text-green-800"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => handleDelete(route._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
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

