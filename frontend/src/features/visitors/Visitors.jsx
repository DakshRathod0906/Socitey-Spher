import { useState } from "react";
import { Shield, MoreVertical, ExternalLink } from "lucide-react";
import { PageHeader, DataTable, FilterBar } from "../../components/shared";
import { Badge, Dropdown } from "../../components/ui";
import { LoadingScreen } from "../../components/feedback";
import { useVisits } from "./hooks/useVisits";

export default function Visitors() {
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: "" });
  const { data: visits, meta, isLoading, isError } = useVisits(filters);

  const columns = [
    { header: "Visitor Name", accessor: "visitorName", cell: (row) => <span className="font-medium">{row.visitorName}</span> },
    { header: "Visiting Flat", accessor: "flat", cell: (row) => row.flatNumber },
    { header: "Type", accessor: "visitorType", cell: (row) => <span className="capitalize">{row.visitorType.toLowerCase()}</span> },
    { header: "Expected", accessor: "expectedArrival", cell: (row) => new Date(row.expectedArrival).toLocaleString() },
    { header: "Check In", accessor: "checkInTime", cell: (row) => row.checkInTime ? new Date(row.checkInTime).toLocaleTimeString() : "-" },
    { header: "Check Out", accessor: "checkOutTime", cell: (row) => row.checkOutTime ? new Date(row.checkOutTime).toLocaleTimeString() : "-" },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => {
        const variants = {
          "CHECKED_OUT": "default",
          "CHECKED_IN": "primary",
          "PENDING": "warning",
          "APPROVED": "success",
          "EXPIRED": "danger"
        };
        return <Badge variant={variants[row.status] || "default"}>{row.status}</Badge>;
      }
    },
    {
      header: "Details",
      accessor: "actions",
      align: "right",
      cell: () => (
        <Dropdown 
          align="right"
          items={[
            { label: "View Details", icon: ExternalLink, onClick: () => {} },
          ]}
          trigger={
            <button className="p-1.5 rounded-lg text-muted hover:bg-secondary-light hover:text-text transition-colors">
              <MoreVertical size={16} />
            </button>
          }
        />
      )
    }
  ];

  if (isLoading) return <LoadingScreen message="Loading visitor logs..." />;

  if (isError) {
    return (
      <div className="p-8 text-center bg-danger-light text-danger rounded-xl">
        Failed to load visitor logs.
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Visitor Logs" 
        subtitle="Monitor all guest, delivery, and service staff entries."
      />

      <FilterBar 
        searchPlaceholder="Search visitors by name or flat..."
        onSearch={(val) => setFilters({ ...filters, search: val, page: 1 })}
      />

      <DataTable 
        columns={columns}
        data={visits}
        pagination={{
          currentPage: filters.page,
          totalPages: meta?.totalPages || 1,
          onPageChange: (page) => setFilters({ ...filters, page })
        }}
      />
    </div>
  );
}
