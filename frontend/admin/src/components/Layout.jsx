import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const NavLink = ({ to, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${active
          ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] border border-white/20 backdrop-blur-md'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
        }`}
    >
      {label}
    </Link>
  );
};

export default function Layout({ children, loading }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen relative">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-purple-900/40 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[25%] h-[25%] rounded-full bg-blue-900/30 blur-[100px]" />
      </div>

      <header className="sticky top-4 z-50 mx-4 mb-8">
        <div className="max-w-7xl mx-auto rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Smart Bus Tracking</h1>
              <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Admin Dashboard</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
            <NavLink to="/" label="Dashboard" />
            <NavLink to="/drivers" label="Drivers" />
            <NavLink to="/map" label="Live Map" />
          </nav>

          <div className="flex items-center gap-4 sm:self-end">
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-white text-sm">{user?.username}</div>
              <div className="text-xs text-purple-300 uppercase tracking-wider font-bold">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="group p-2.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-transparent hover:border-white/10"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {loading && (
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 text-sm px-6 py-3 rounded-xl flex items-center gap-3 animate-pulse">
            <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Updating live data...
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 pb-12">{children}</main>
    </div>
  );
}

