import { ClipboardList, Wrench as Tool, CheckCircle, Clock } from "lucide-react";
import { PageHeader, StatCard } from "../../components/shared";

export default function ServiceDashboard() {
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Service Dashboard" 
        subtitle="Manage assigned work orders and complaints."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="My Work Orders" value="12" icon={ClipboardList} />
        <StatCard title="In Progress" value="3" icon={Tool} />
        <StatCard title="Completed Today" value="4" icon={CheckCircle} />
        <StatCard title="Avg Response Time" value="2.5 hrs" icon={Clock} />
      </div>
    </div>
  );
}
