const colorMap = {
  open: "bg-amber-100 text-amber-700",
  pending: "bg-amber-100 text-amber-700",
  unpaid: "bg-amber-100 text-amber-700",
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-blue-100 text-blue-700",
  checked_in: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  resolved: "bg-emerald-100 text-emerald-700",
  paid: "bg-emerald-100 text-emerald-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  checked_out: "bg-slate-100 text-slate-600",
  closed: "bg-slate-100 text-slate-600",
  completed: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  suspended: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
  expired: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }) => (
  <span
    className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
      colorMap[status] || "bg-slate-100 text-slate-600"
    }`}
  >
    {status?.replace("_", " ")}
  </span>
);

export default StatusBadge;
