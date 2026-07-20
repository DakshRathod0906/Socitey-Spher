import { useState } from "react";
import { PageHeader, DataTable, FilterBar } from "../../components/shared";
import { LoadingScreen } from "../../components/feedback";
import { useSocietyAdmins } from "./hooks/useSuperAdminUsers";

export default function SocietyAdmins() {
  const [search, setSearch] = useState("");
  const { data: admins, isLoading, isError } = useSocietyAdmins();

  const filteredAdmins = admins.filter(admin => 
    admin.name?.toLowerCase().includes(search.toLowerCase()) ||
    admin.email?.toLowerCase().includes(search.toLowerCase()) ||
    admin.societyId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { 
      header: "Name", 
      accessor: "name", 
      cell: (row) => <span className="font-medium">{row.name}</span> 
    },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone", cell: (row) => row.phone || "-" },
    { 
      header: "Society", 
      accessor: "society", 
      cell: (row) => (
        <div>
          <p className="font-medium text-text">{row.societyId?.name || "-"}</p>
          <p className="text-sm text-muted">{row.societyId?.location || ""}</p>
        </div>
      )
    },
    { 
      header: "Status", 
      accessor: "accountStatus", 
      cell: (row) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
          row.accountStatus === 'ACTIVE' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
        }`}>
          {row.accountStatus}
        </span>
      )
    }
  ];

  if (isLoading) return <LoadingScreen message="Loading society admins..." />;
  if (isError) return <div className="p-8 text-center bg-danger-light text-danger rounded-xl">Failed to load admins.</div>;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Society Admins" 
        subtitle="View and manage all registered society administrators."
      />

      <FilterBar 
        searchPlaceholder="Search by name, email, or society..."
        onSearch={setSearch}
      />

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <DataTable 
          columns={columns}
          data={filteredAdmins}
        />
      </div>
    </div>
  );
}
