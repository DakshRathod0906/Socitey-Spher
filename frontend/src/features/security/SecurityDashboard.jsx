import { useNavigate } from "react-router-dom";
import { Users, Car, Shield, AlertTriangle, Clock, LogOut, CheckCircle, XCircle } from "lucide-react";
import { PageHeader, StatCard } from "../../components/shared";
import { Card, Button, Badge } from "../../components/ui";
import { useTodayMetrics } from "./hooks/useSecurityVisits";
import { LoadingScreen } from "../../components/feedback";

export default function SecurityDashboard() {
  const navigate = useNavigate();
  const { data: metrics, isLoading } = useTodayMetrics();

  if (isLoading) return <LoadingScreen message="Loading dashboard..." />;

  const getStatusBadge = (status) => {
    switch (status) {
      case "CHECKED_IN":
        return <Badge variant="primary" icon={CheckCircle}>In</Badge>;
      case "CHECKED_OUT":
        return <Badge variant="default" icon={LogOut}>Out</Badge>;
      case "REJECTED":
        return <Badge variant="danger" icon={XCircle}>Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Security Command Center" 
        subtitle="Main Gate (Gate 1) - Shift: Morning"
        actions={<Button variant="danger"><AlertTriangle className="h-4 w-4 mr-2"/> Sound Alarm</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Expected Today" value={metrics?.expected || 0} icon={Shield} />
        <StatCard title="Currently Inside" value={metrics?.inside || 0} icon={Users} />
        <StatCard title="Pending Walk-ins" value={metrics?.walkIns || 0} icon={Clock} />
        <StatCard title="Checked Out" value={metrics?.checkedOut || 0} icon={LogOut} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-text mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/security/scan")}
            >
              <Shield className="h-6 w-6" />
              Scan QR Pass
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/security/walk-in")}
            >
              <Users className="h-6 w-6" />
              New Walk-in Entry
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text">Recent Activity</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/security/history")}>View All</Button>
          </div>
          
          <div className="space-y-4">
            {metrics?.recentActivity?.length > 0 ? (
              metrics.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                  <div>
                    <p className="font-medium text-text">{activity.name}</p>
                    <p className="text-xs text-muted">{new Date(activity.time).toLocaleTimeString()}</p>
                  </div>
                  {getStatusBadge(activity.status)}
                </div>
              ))
            ) : (
              <p className="text-muted text-sm text-center py-4">No recent activity</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
