import { Shield, MessageSquare, CreditCard, Bell, ArrowRight, UserCheck, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, StatCard } from "../../components/shared";
import { Card, Badge, Button } from "../../components/ui";
import { useResidentDashboard } from "./hooks/useDashboard";
import { useAuth } from "../../contexts/AuthContext";
import { LoadingScreen } from "../../components/feedback";
import { fetchVisits } from "../visitors/api/visit.api";
import { getNotices } from "../notices/api/noticeApi";

export default function ResidentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading, isError } = useResidentDashboard();

  // Fetch upcoming/recent visitors for resident
  const { data: visitsRes } = useQuery({
    queryKey: ["residentDashboardVisits"],
    queryFn: () => fetchVisits(),
  });

  // Fetch active notices
  const { data: noticesList = [] } = useQuery({
    queryKey: ["residentDashboardNotices"],
    queryFn: () => getNotices({ archived: "false" }),
  });

  const allVisits = visitsRes?.data || [];
  const upcomingVisitors = allVisits.filter(
    (v) => v.status === "EXPECTED" || v.status === "APPROVED" || v.status === "INSIDE"
  );

  const activeNotices = Array.isArray(noticesList)
    ? noticesList.filter((n) => !n.isArchived)
    : [];

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
        <StatCard title="Active Notices" value={activeNotices.length} icon={Bell} trendLabel={`${activeNotices.length} active announcements`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {/* Upcoming Visitors Section */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-text">Upcoming Guests</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/resident/visitors")}>
                View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>

            {upcomingVisitors.length === 0 ? (
              <div className="text-center py-8 text-muted bg-surface/50 rounded-xl border border-border">
                <UserCheck className="h-10 w-10 mx-auto mb-2 opacity-30 text-muted" />
                <p className="text-sm font-medium text-text">No upcoming guests expected today.</p>
                <p className="text-xs text-muted mt-1 mb-4">Pre-approve guests to generate quick entry passcodes.</p>
                <Button size="sm" onClick={() => navigate("/resident/visitors")}>
                  Pre-Approve Guest
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingVisitors.slice(0, 4).map((visit) => (
                  <div 
                    key={visit.id || visit._id}
                    className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between hover:border-primary/30 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-text">{visit.visitorName || visit.name || "Guest"}</span>
                        <Badge variant={visit.status === "INSIDE" ? "success" : "primary"}>
                          {visit.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted mt-0.5 font-mono">
                        {visit.phone || visit.visitorPhone || "N/A"} • Passcode: <span className="font-bold text-primary">{visit.entryCode || visit.passcode || "N/A"}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted font-medium block">
                        {visit.expectedDate || visit.entryTime ? new Date(visit.expectedDate || visit.entryTime).toLocaleDateString() : "Today"}
                      </span>
                      <span className="text-[11px] text-primary font-semibold">
                        {visit.purpose || "Visitor"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Today's Notices Section */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-text">Today's Notices</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/resident/notices")}>
                View Notice Board <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>

            {activeNotices.length === 0 ? (
              <div className="text-center py-8 text-muted bg-surface/50 rounded-xl border border-border">
                <Bell className="h-10 w-10 mx-auto mb-2 opacity-30 text-muted" />
                <p className="text-sm font-medium text-text">No active notices published today.</p>
                <p className="text-xs text-muted mt-1">Check back later for society announcements.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeNotices.slice(0, 4).map((notice) => {
                  const priorityVariants = {
                    URGENT: "danger",
                    HIGH: "danger",
                    MEDIUM: "warning",
                    LOW: "primary",
                  };
                  return (
                    <div 
                      key={notice._id || notice.id}
                      className="p-3 bg-surface border border-border rounded-xl space-y-1.5 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-text">{notice.title}</span>
                          <Badge variant={priorityVariants[notice.priority] || "default"}>
                            {notice.priority || "NORMAL"}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-muted shrink-0" />
                          {notice.createdAt ? new Date(notice.createdAt).toLocaleDateString() : "Today"}
                        </span>
                      </div>
                      <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                        {notice.content || notice.description || notice.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
