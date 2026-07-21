import { useState } from "react";
import { MoreVertical, Edit, Trash2, Download } from "lucide-react";
import { DataTable, FilterBar } from "../../components/shared";
import { Badge, Dropdown, Button } from "../../components/ui";
import { LoadingScreen } from "../../components/feedback";
import { useResidents } from "./hooks/useResidents";
import { canManageResidents } from "../../lib/permissions";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { exportToCSV } from "../../lib/exportUtils";
import DeactivateModal from "./components/DeactivateModal";

export default function ResidentDirectory() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: "" });
  const [selectedUserForDeactivation, setSelectedUserForDeactivation] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  
  const { data: residents, meta, isLoading, isError } = useResidents(filters);

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
                onClick: () => setSelectedUserForDeactivation(row)
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

  const handleExport = () => {
    const dataToExport = selectedRows.length > 0 
      ? residents.filter(r => selectedRows.includes(r._id))
      : residents;
    
    exportToCSV(dataToExport, "Residents", columns.filter(c => c.accessor !== "actions"));
  };

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
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!residents || residents.length === 0}>
            <Download size={16} className="mr-2" />
            {selectedRows.length > 0 ? `Export Selected (${selectedRows.length})` : "Export Filtered"}
          </Button>
        }
      />

      <DataTable 
        columns={columns}
        data={residents}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        pagination={{
          currentPage: filters.page,
          totalPages: meta?.totalPages || 1,
          onPageChange: (page) => setFilters({ ...filters, page })
        }}
      />

      <DeactivateModal 
        open={!!selectedUserForDeactivation}
        onClose={() => setSelectedUserForDeactivation(null)}
        user={selectedUserForDeactivation}
      />
    </div>
  );
}
