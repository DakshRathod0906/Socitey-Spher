import { useState } from "react";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import { DataTable, FilterBar } from "../../components/shared";
import { Badge, Dropdown } from "../../components/ui";
import { LoadingScreen } from "../../components/feedback";
import { useResidents, useDeactivateResident } from "./hooks/useResidents";
import { canManageResidents } from "../../lib/permissions";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

export default function ResidentDirectory() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: "" });
  
  const { data: residents, meta, isLoading, isError } = useResidents(filters);
  const { mutate: deactivateResident } = useDeactivateResident();

  const columns = [
    { 
      header: "Name", 
      accessor: "name", 
      cell: (row) => row.name ? <span className="font-medium">{row.name}</span> : <span className="text-muted italic">Pending Registration</span> 
    },
    { header: "Flat", accessor: "flat", cell: (row) => row.flat?.flatNumber || "N/A" },
    { 
      header: "Occupancy", 
      accessor: "occupancyType", 
      cell: (row) => <span className="capitalize">{row.occupancyType?.toLowerCase()}</span> 
    },
    { 
      header: "Type", 
      accessor: "residentType", 
      cell: (row) => <span className="capitalize">{row.residentType?.toLowerCase()}</span> 
    },
    { header: "Phone", accessor: "phone" },
    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      cell: (row) => {
        if (!canManageResidents(user)) return null;
        return (
          <Dropdown 
            align="right"
            items={[
              { label: "Edit Details", icon: Edit, onClick: () => toast("Edit coming soon") },
              { type: "separator" },
              { 
                label: "Deactivate", 
                icon: Trash2, 
                danger: true, 
                onClick: () => {
                  if (confirm(`Are you sure you want to deactivate ${row.name}?`)) {
                    deactivateResident(row._id);
                  }
                } 
              },
            ]}
            trigger={
              <button className="p-1.5 rounded-lg text-muted hover:bg-secondary-light hover:text-text transition-colors">
                <MoreVertical size={16} />
              </button>
            }
          />
        );
      }
    }
  ];

  if (isLoading) return <LoadingScreen message="Loading directory..." />;

  if (isError) {
    return (
      <div className="p-8 text-center bg-danger-light text-danger rounded-xl">
        Failed to load resident directory.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FilterBar 
        searchPlaceholder="Search by name or email..."
        onSearch={(val) => setFilters({ ...filters, search: val, page: 1 })}
      />

      <DataTable 
        columns={columns}
        data={residents}
        pagination={{
          currentPage: filters.page,
          totalPages: meta?.totalPages || 1,
          onPageChange: (page) => setFilters({ ...filters, page })
        }}
      />
    </div>
  );
}
