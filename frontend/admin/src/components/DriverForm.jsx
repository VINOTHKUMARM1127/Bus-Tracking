import { useState } from 'react';
import { api } from '../api.js';

export default function DriverForm({ onCreated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');
    setLoading(true);
    try {
      await api.post('/admin/drivers', { username, password, busNumber });
      setStatus('Driver created');
      setUsername('');
      setPassword('');
      setBusNumber('');
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Driver Username</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Password</label>
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-1">Bus Number</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={busNumber}
          onChange={(e) => setBusNumber(e.target.value)}
          placeholder="e.g., BUS-12"
        />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {status && <div className="text-sm text-green-600">{status}</div>}
      <button
        type="submit"
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Create Driver'}
      </button>
    </form>
  );
}


