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
    <form className="space-y-6 max-w-lg mx-auto" onSubmit={submit}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Driver Username</label>
        <input
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Enter username"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Password</label>
        <input
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">Bus Number</label>
        <input
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          value={busNumber}
          onChange={(e) => setBusNumber(e.target.value)}
          placeholder="e.g., BUS-12"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}
      {status && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-xl text-sm">
          {status}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
      >
        {loading ? 'Creating Driver...' : 'Create Driver Account'}
      </button>
    </form>
  );
}






