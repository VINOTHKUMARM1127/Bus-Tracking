const Stat = ({ label, value, color }) => (
  <div className="bg-white shadow rounded-lg p-4">
    <div className="text-sm text-gray-500">{label}</div>
    <div className={`text-2xl font-semibold ${color}`}>{value}</div>
  </div>
);

export default function DashboardStats({ totalDrivers, activeDrivers, trackedBuses }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Stat label="Drivers" value={totalDrivers} color="text-indigo-600" />
      <Stat label="Active Drivers" value={activeDrivers} color="text-green-600" />
      <Stat label="Live Buses" value={trackedBuses} color="text-orange-600" />
    </div>
  );
}



