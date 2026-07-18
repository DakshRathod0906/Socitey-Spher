import { Building, Users, Activity, AlertCircle, Plus } from "lucide-react";
import { useState } from "react";
import { PageHeader, StatCard, DataTable, FilterBar } from "../../components/shared";
import { Badge, Button } from "../../components/ui";
import { useSuperAdminDashboard } from "../dashboard/hooks/useDashboard";
import { LoadingScreen } from "../../components/feedback";



import { useNavigate } from "react-router-dom";

export default function SuperAdminDashboard() {
  const { data: stats, isLoading, isError } = useSuperAdminDashboard();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("All");

  const columns = [
    { header: "Society Name", accessor: "name", sortable: true, cell: (row) => <span className="font-medium">{row.name}</span> },
    { header: "Location", accessor: "location", sortable: true },
    { header: "Total Users", accessor: "users", sortable: true, align: "right" },
    { header: "Join Date", accessor: "joinDate", sortable: true },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => (
        <Badge 
          variant={
            row.status === "ACTIVE" ? "success" : 
            row.status === "SUSPENDED" ? "danger" : 
            "warning"
          }
        >
          {row.status}
        </Badge>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      cell: (row) => (
        <Button variant="outline" size="sm" onClick={() => navigate(`/super-admin/societies/${row.id}`)}>
          Manage
        </Button>
      )
    }
  ];

  if (isLoading) {
    return <LoadingScreen message="Loading platform metrics..." />;
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-danger-light text-danger rounded-xl border border-danger/20">
        <p className="font-semibold">Failed to load platform metrics.</p>
        <p className="text-sm mt-1 opacity-80">Please try refreshing the page.</p>
      </div>
    );
  }

  const filteredSocieties = stats?.societies?.filter(soc => {
    if (statusFilter === "All") return true;
    return soc.status.toUpperCase() === statusFilter.toUpperCase();
  }) || [];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Super Admin Overview" 
        subtitle="Manage all registered societies on the platform."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Societies" 
          value={stats?.totalSocieties || 0} 
          icon={Building} 
        />
        <StatCard 
          title="Total Platform Users" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
        />
        <StatCard 
          title="Approved Societies" 
          value={stats?.approved || 0} 
          icon={Activity} 
        />
        <StatCard 
          title="Suspended/Pending" 
          value={(stats?.suspended || 0) + (stats?.pending || 0)} 
          icon={AlertCircle} 
        />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-text mb-4">Platform Societies</h2>
        <div className="flex gap-2 mb-4">
          {["All", "Pending", "Active", "Suspended", "Rejected"].map(status => (
            <Badge 
              key={status} 
              variant={statusFilter === status ? "primary" : "neutral"}
              className="cursor-pointer"
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </Badge>
          ))}
        </div>
        <DataTable 
          columns={columns}
          data={filteredSocieties}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
}
