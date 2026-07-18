const StatCard = ({ label, value, accent = "brand" }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
    <div className="text-sm text-slate-500">{label}</div>
    <div className={`text-3xl font-bold mt-1 text-${accent}-600`}>{value}</div>
  </div>
);

export default StatCard;
