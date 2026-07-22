import React from "react";
import { MessageSquare, IndianRupee, Users, Car } from "lucide-react";

const KPICard = ({ title, value, icon: Icon, colorClass, bgColorClass }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
    <div className={`p-4 rounded-full ${bgColorClass} ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const KPICards = ({ dashboard }) => {
  if (!dashboard) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <KPICard
        title="Total Complaints"
        value={dashboard.total_complaints || 0}
        icon={MessageSquare}
        colorClass="text-red-600"
        bgColorClass="bg-red-50"
      />
      <KPICard
        title="Total Expenses"
        value={`₹${(dashboard.total_expenses || 0).toLocaleString()}`}
        icon={IndianRupee}
        colorClass="text-emerald-600"
        bgColorClass="bg-emerald-50"
      />
      <KPICard
        title="Total Visitors"
        value={dashboard.total_visitors || 0}
        icon={Users}
        colorClass="text-blue-600"
        bgColorClass="bg-blue-50"
      />
      <KPICard
        title="Total Vehicles"
        value={dashboard.total_vehicles || 0}
        icon={Car}
        colorClass="text-indigo-600"
        bgColorClass="bg-indigo-50"
      />
    </div>
  );
};

export default KPICards;
