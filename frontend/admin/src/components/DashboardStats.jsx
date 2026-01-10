const Stat = ({ label, value, color }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors shadow-xl">
    <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{label}</div>
    <div className={`text-4xl font-bold ${color}`}>{value}</div>
  </div>
);

export default function DashboardStats({ totalDrivers, trackedBuses }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <Stat
        label="Total Drivers"
        value={totalDrivers}
        color="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500"
      />
      <Stat
        label="Live Buses"
        value={trackedBuses}
        color="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500"
      />
    </div>
  );
}



