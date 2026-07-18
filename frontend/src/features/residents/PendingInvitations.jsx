import { useInvitations, useRevokeInvitation } from "./hooks/useResidents";
import { DataTable, FilterBar } from "../../components/shared";
import { Badge, Dropdown, Button } from "../../components/ui";
import { LoadingScreen } from "../../components/feedback";
import { MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";

export default function PendingInvitations() {
  const [search, setSearch] = useState("");
  const { data: invitations, isLoading, isError } = useInvitations();
  const { mutate: revokeInvitation } = useRevokeInvitation();

  const columns = [
    { header: "Email", accessor: "email", cell: row => <span className="font-medium">{row.email}</span> },
    { header: "Role", accessor: "role", cell: row => <span className="capitalize">{row.role}</span> },
    { header: "Flat", accessor: "flat", cell: row => row.flatId?.flatNumber || "N/A" },
    { header: "Occupancy", accessor: "occupancyType", cell: row => row.occupancyType ? <span className="capitalize">{row.occupancyType.toLowerCase()}</span> : "-" },
    { header: "Type", accessor: "residentType", cell: row => row.residentType ? <span className="capitalize">{row.residentType.toLowerCase()}</span> : "-" },
    { 
      header: "Status", 
      accessor: "status",
      cell: row => (
        <Badge variant={row.status === "PENDING" ? "warning" : "danger"}>
          {row.status}
        </Badge>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      cell: (row) => {
        if (row.status !== "PENDING") return null;
        return (
          <Dropdown 
            align="right"
            items={[
              { 
                label: "Revoke", 
                icon: Trash2, 
                danger: true, 
                onClick: () => {
                  if (confirm(`Are you sure you want to revoke invitation for ${row.email}?`)) {
                    revokeInvitation(row._id);
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

  if (isLoading) return <LoadingScreen message="Loading invitations..." />;

  if (isError) {
    return (
      <div className="p-8 text-center bg-danger-light text-danger rounded-xl">
        Failed to load invitations.
      </div>
    );
  }

  const filtered = invitations?.filter(inv => inv.email.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-4">
      <FilterBar 
        searchPlaceholder="Search by email..."
        onSearch={setSearch}
      />
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
