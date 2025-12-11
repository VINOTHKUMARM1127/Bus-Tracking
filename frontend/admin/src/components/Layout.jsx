import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const NavLink = ({ to, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        active ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  );
};

export default function Layout({ children, loading }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Smart Bus Tracking</h1>
            <p className="text-sm text-gray-500">Admin dashboard</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" label="Dashboard" />
            <NavLink to="/drivers" label="Drivers" />
            <NavLink to="/map" label="Map" />
          </nav>
          <div className="flex items-center gap-3 sm:self-end">
            <div className="text-sm text-right">
              <div className="font-medium text-gray-800">{user?.username}</div>
              <div className="text-gray-500 capitalize">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="px-3 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {loading && (
        <div className="bg-yellow-100 text-yellow-800 text-sm px-4 py-2 text-center">
          Loading data...
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

