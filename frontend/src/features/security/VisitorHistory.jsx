import { useState } from "react";
import { PageHeader, DataTable } from "../../components/shared";
import { Badge, Button, Input, Select } from "../../components/ui";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../services/queryKeys";
import api from "../../services/api";
import { LogOut, Search } from "lucide-react";
import { useCheckOutVisit } from "./hooks/useSecurityVisits";

export default function VisitorHistory() {
  const [filters, setFilters] = useState({ page: 1, limit: 10, status: "", search: "" });
  const [searchInput, setSearchInput] = useState("");

  const { data: response, isLoading } = useQuery({
    queryKey: [...queryKeys.visits, filters],
    queryFn: async () => {
      // we can pass filters to standard visit list
      const query = new URLSearchParams();
      if (filters.status) query.append("status", filters.status);
      if (filters.search) query.append("search", filters.search);
      query.append("page", filters.page);
      query.append("limit", filters.limit);
      const res = await api.get(`/visits?${query.toString()}`);
      return res.data;
    },
    keepPreviousData: true
  });

  const { mutate: checkOut, isPending: isCheckingOut } = useCheckOutVisit();

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
  };

  const columns = [
    { header: "Visitor", accessor: "visitorId.name", cell: (row) => <span className="font-medium">{row.visitorId?.name}</span> },
    { header: "Destination", accessor: "flat", cell: (row) => `Tower ${row.flatId?.towerId?.name || 'A'}, Flat ${row.flatId?.flatNumber}` },
    { header: "Expected/Arrived", accessor: "time", cell: (row) => new Date(row.checkInTime || row.expectedArrival || row.createdAt).toLocaleString() },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => {
        const variants = {
          "CHECKED_OUT": "default",
          "CHECKED_IN": "primary",
          "PENDING": "warning",
          "APPROVED": "success",
          "EXPIRED": "danger",
          "REJECTED": "danger"
        };
        return <Badge variant={variants[row.status] || "default"}>{row.status}</Badge>;
      }
    },
    {
      header: "Action",
      accessor: "action",
      align: "right",
      cell: (row) => row.status === "CHECKED_IN" ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => checkOut(row._id)}
          disabled={isCheckingOut}
        >
          <LogOut className="h-4 w-4 mr-1" /> Check Out
        </Button>
      ) : <span className="text-muted text-xs">-</span>
    }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Visitor History" 
        subtitle="Log of all expected, active, and past visitors."
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input 
            placeholder="Search by name, phone, flat..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <div className="w-full sm:w-48">
          <Select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            options={[
              { value: "", label: "All Statuses" },
              { value: "APPROVED", label: "Expected (Approved)" },
              { value: "CHECKED_IN", label: "Currently Inside" },
              { value: "CHECKED_OUT", label: "Checked Out" },
              { value: "PENDING", label: "Pending Walk-in" },
              { value: "REJECTED", label: "Rejected" },
            ]}
          />
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={response?.data || []}
        isLoading={isLoading}
        pagination={{
          currentPage: filters.page,
          totalPages: response?.meta?.totalPages || 1,
          onPageChange: (page) => setFilters({ ...filters, page })
        }}
      />
    </div>
  );
}
