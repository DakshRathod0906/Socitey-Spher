import { Shield, MessageSquare, CreditCard, Bell } from "lucide-react";
import { PageHeader, StatCard } from "../../components/shared";
import { Card } from "../../components/ui";
import { useResidentDashboard } from "./hooks/useDashboard";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingScreen } from "../../components/feedback";

export default function ResidentDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading, isError } = useResidentDashboard();

  if (isLoading) {
    return <LoadingScreen message="Loading your dashboard..." />;
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-danger-light text-danger rounded-xl border border-danger/20">
        <p className="font-semibold">Failed to load your dashboard.</p>
        <p className="text-sm mt-1 opacity-80">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="My Dashboard" 
        subtitle={`Welcome home, ${user?.name || "Resident"}. Here's your summary for Flat ${user?.flatId?.flatNumber || "N/A"}.`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Visitors Today" value={stats?.myVisitorsToday || 0} icon={Shield} />
        <StatCard title="Pending Dues" value={stats?.myUnpaidBills || 0} icon={CreditCard} trend={stats?.myUnpaidBills === 0 ? "up" : "none"} trendLabel={stats?.myUnpaidBills === 0 ? "All clear!" : ""} />
        <StatCard title="Open Complaints" value={stats?.myComplaints || 0} icon={MessageSquare} />
        <StatCard title="Notices" value="-" icon={Bell} trendLabel="Check notices page" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-text mb-4">Upcoming Visitors</h2>
          <div className="text-center py-8 text-muted">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Go to My Visitors to pre-approve guests.</p>
          </div>
        </Card>
        
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-text mb-4">Recent Notices</h2>
          <div className="text-center py-8 text-muted">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Go to Notices to view society updates.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
