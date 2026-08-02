import { Users, Shield, Briefcase, PowerOff } from "lucide-react";

export default function StaffStats({ staffList }) {
  if (!staffList) return null;

  const total = staffList.length;
  const security = staffList.filter((s) => s.role === "security").length;
  const service = staffList.filter((s) => s.role === "service_staff").length;
  const inactive = staffList.filter((s) => s.accountStatus === "INACTIVE").length;

  const statCards = [
    { label: "Total Staff", value: total, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Security", value: security, icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Service Staff", value: service, icon: Briefcase, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { label: "Inactive", value: inactive, icon: PowerOff, color: "text-muted", bg: "bg-surface" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-background border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">{stat.label}</p>
              <h3 className="text-2xl font-bold text-text mt-1">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
