import { Users, Shield, MessageSquare, CreditCard, Activity } from "lucide-react";
import { PageHeader, StatCard, DataTable } from "../../components/shared";
import { useAdminDashboard } from "./hooks/useDashboard";
import { LoadingScreen } from "../../components/feedback";

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useAdminDashboard();

  if (isLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-danger-light text-danger rounded-xl border border-danger/20">
        <p className="font-semibold">Failed to load dashboard metrics.</p>
        <p className="text-sm mt-1 opacity-80">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Society Overview" 
        subtitle="Welcome back, here's what's happening today."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Residents" value={stats?.totalResidents || 0} icon={Users} />
        <StatCard title="Active Visitors" value={stats?.todayVisitors || 0} icon={Shield} />
        <StatCard title="Open Complaints" value={stats?.openComplaints || 0} icon={MessageSquare} />
        <StatCard title="Pending Dues" value={stats?.unpaidBills || 0} icon={CreditCard} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          {/* Note: Activity feed is a placeholder. Future feature: Fetch recent audit logs. */}
          <h2 className="text-lg font-semibold text-text mb-4">Complaint Categories</h2>
          <div className="bg-card rounded-xl border border-border p-5">
            {stats?.complaintsByCategory?.length > 0 ? (
              <ul className="space-y-3">
                {stats.complaintsByCategory.map((cat) => (
                  <li key={cat._id} className="flex justify-between items-center text-sm">
                    <span className="capitalize">{cat._id}</span>
                    <span className="font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                      {cat.count}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted text-sm">No open complaints.</p>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold text-text mb-4">System Health</h2>
          <div className="bg-card rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success-light flex items-center justify-center">
                <Activity className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-text">All systems operational</p>
                <p className="text-xs text-muted">Connected to Backend</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
