import { useState } from "react";
import { MoreVertical, Trash2, Download } from "lucide-react";
import { DataTable, FilterBar } from "../../components/shared";
import { Dropdown, Button } from "../../components/ui";
import { LoadingScreen } from "../../components/feedback";
import { useUsers } from "./hooks/useResidents";
import { canManageResidents } from "../../lib/permissions";
import { useAuth } from "../../contexts/AuthContext";
import { exportToCSV } from "../../lib/exportUtils";
import DeactivateModal from "./components/DeactivateModal";

export default function StaffDirectory() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedUserForDeactivation, setSelectedUserForDeactivation] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  
  const { data: users, isLoading, isError } = useUsers({ status: "ACTIVE" });

  const staffUsers = users.filter(u => ["security", "service_staff"].includes(u.role));

  const filteredStaff = staffUsers.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      header: "Name", 
      accessor: "name", 
      cell: (row) => <span className="font-medium">{row.name}</span> 
    },
    { header: "Email", accessor: "email" },
    { 
      header: "Role", 
      accessor: "role", 
      cell: (row) => <span className="capitalize">{row.role?.replace("_", " ")}</span> 
    },
    { 
      header: "Category", 
      accessor: "serviceCategory", 
      cell: (row) => row.serviceCategory ? <span className="capitalize">{row.serviceCategory?.replace("_", " ")}</span> : "-" 
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
      ? filteredStaff.filter(r => selectedRows.includes(r._id))
      : filteredStaff;
    
    exportToCSV(dataToExport, "Staff", columns.filter(c => c.accessor !== "actions"));
  };

  if (isLoading) return <LoadingScreen message="Loading staff directory..." />;
  if (isError) return <div className="p-8 text-center bg-danger-light text-danger rounded-xl">Failed to load staff directory.</div>;

  return (
    <div className="space-y-4">
      <FilterBar 
        searchPlaceholder="Search staff by name or email..."
        onSearch={setSearch}
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredStaff.length === 0}>
            <Download size={16} className="mr-2" />
            {selectedRows.length > 0 ? `Export Selected (${selectedRows.length})` : "Export Filtered"}
          </Button>
        }
      />

      <DataTable 
        columns={columns}
        data={filteredStaff}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
      />

      <DeactivateModal 
        open={!!selectedUserForDeactivation}
        onClose={() => setSelectedUserForDeactivation(null)}
        user={selectedUserForDeactivation}
      />
    </div>
  );
}
