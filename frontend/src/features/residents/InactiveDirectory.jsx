import { useState } from "react";
import { DataTable, FilterBar } from "../../components/shared";
import { LoadingScreen } from "../../components/feedback";
import { useUsers } from "./hooks/useResidents";

export default function InactiveDirectory() {
  const [search, setSearch] = useState("");
  
  const { data: users, isLoading, isError } = useUsers({ status: "INACTIVE" });

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      header: "Name", 
      accessor: "name", 
      cell: (row) => <span className="font-medium text-muted">{row.name}</span> 
    },
    { header: "Email", accessor: "email", cell: (row) => <span className="text-muted">{row.email}</span> },
    { 
      header: "Role", 
      accessor: "role", 
      cell: (row) => <span className="capitalize text-muted">{row.role?.replace("_", " ")}</span> 
    },
    { 
      header: "Deactivated On", 
      accessor: "deletedAt", 
      cell: (row) => <span className="text-muted">{row.deletedAt ? new Date(row.deletedAt).toLocaleDateString() : "-"}</span> 
    },
  ];

  if (isLoading) return <LoadingScreen message="Loading inactive users..." />;
  if (isError) return <div className="p-8 text-center bg-danger-light text-danger rounded-xl">Failed to load inactive users.</div>;

  return (
    <div className="space-y-4">
      <FilterBar 
        searchPlaceholder="Search inactive users by name or email..."
        onSearch={setSearch}
      />

      <DataTable 
        columns={columns}
        data={filteredUsers}
      />
    </div>
  );
}
