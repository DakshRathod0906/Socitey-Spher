import { useState, useMemo } from "react";
import { Plus, Receipt, TrendingDown, Clock, AlertCircle, MoreVertical, CheckCircle, XCircle } from "lucide-react";
import { PageHeader, DataTable, FilterBar } from "../../components/shared";
import { Badge, Button, Dropdown } from "../../components/ui";
import { useExpenses, useCreateExpense, useUpdateExpenseStatus } from "./hooks/useExpenses";
import CreateExpenseModal from "./components/CreateExpenseModal";

export default function Expenses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useExpenses({ status: statusFilter, category: categoryFilter });
  const createMutation = useCreateExpense();
  const updateStatusMutation = useUpdateExpenseStatus();

  const expenses = data?.expenses || [];

  // Local filtering for search query, status, and category
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchSearch =
        !searchQuery ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.vendorName && e.vendorName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = !statusFilter || e.status === statusFilter;
      const matchCategory = !categoryFilter || e.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [expenses, searchQuery, statusFilter, categoryFilter]);

  // Derived metrics
  const metrics = useMemo(() => {
    let totalSpend = 0;
    let pendingCount = 0;
    let approvedCount = 0;

    expenses.forEach(e => {
      if (e.status === "APPROVED") totalSpend += e.amount;
      if (e.status === "PENDING") pendingCount++;
      if (e.status === "APPROVED") approvedCount++;
    });

    return { totalSpend, pendingCount, approvedCount };
  }, [expenses]);

  const handleCreateExpense = (payload) => {
    createMutation.mutate(payload, {
      onSuccess: () => setIsModalOpen(false)
    });
  };

  const columns = [
    { 
      header: "Date", 
      accessor: "expenseDate",
      cell: (row) => new Date(row.expenseDate).toLocaleDateString()
    },
    { 
      header: "Title", 
      accessor: "title", 
      cell: (row) => (
        <div>
          <p className="font-medium text-text">{row.title}</p>
        </div>
      )
    },
    { 
      header: "Category", 
      accessor: "category",
      cell: (row) => <span className="text-sm text-text capitalize">{row.category.toLowerCase()}</span>
    },
    { 
      header: "Vendor", 
      accessor: "vendorName",
      cell: (row) => <span className="text-sm text-text">{row.vendorName || "—"}</span>
    },
    { 
      header: "Amount", 
      accessor: "amount",
      cell: (row) => <span className="font-semibold">₹{row.amount.toLocaleString("en-IN")}</span>
    },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => {
        const variants = {
          "APPROVED": "success",
          "PENDING": "warning",
          "REJECTED": "danger"
        };
        return <Badge variant={variants[row.status] || "default"}>{row.status}</Badge>;
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      cell: (row) => (
        <Dropdown
          align="right"
          items={[
            {
              label: "Approve Expense",
              icon: CheckCircle,
              onClick: () => updateStatusMutation.mutate({ id: row._id, status: "APPROVED" }),
            },
            {
              label: "Mark Pending",
              icon: Clock,
              onClick: () => updateStatusMutation.mutate({ id: row._id, status: "PENDING" }),
            },
            {
              label: "Reject Expense",
              icon: XCircle,
              onClick: () => updateStatusMutation.mutate({ id: row._id, status: "REJECTED" }),
            },
          ]}
          trigger={
            <button className="p-1.5 rounded-lg text-muted hover:bg-surface hover:text-text transition-colors">
              <MoreVertical size={16} />
            </button>
          }
        />
      ),
    },
  ];

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto">
      <PageHeader 
        title="Expenses" 
        subtitle="Manage society expenses and track outgoing payments."
        action={
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Record Expense
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
        <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-danger-light flex items-center justify-center">
            <TrendingDown className="h-6 w-6 text-danger" />
          </div>
          <div>
            <p className="text-sm text-muted">Total Spend (Visible)</p>
            <p className="text-xl font-bold text-text">₹{metrics.totalSpend.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-warning-light flex items-center justify-center">
            <Clock className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted">Pending Approvals</p>
            <p className="text-xl font-bold text-text">{metrics.pendingCount}</p>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-success-light flex items-center justify-center">
            <Receipt className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted">Approved Expenses</p>
            <p className="text-xl font-bold text-text">{metrics.approvedCount}</p>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary-light flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted">Total Records</p>
            <p className="text-xl font-bold text-text">{expenses.length}</p>
          </div>
        </div>
      </div>

      {/* Interactive Status & Category Filters */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {["ALL", "APPROVED", "PENDING", "REJECTED"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st === "ALL" ? "" : st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  (statusFilter === "" && st === "ALL") || statusFilter === st
                    ? "bg-primary text-white shadow-xs"
                    : "bg-background border border-border text-muted hover:text-text"
                }`}
              >
                {st === "ALL" ? "All Statuses" : st.replace("_", " ")}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              className="text-xs py-1.5 px-3 h-9 rounded-lg border border-border bg-background text-text font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="UTILITIES">Utilities</option>
              <option value="SALARY">Salary</option>
              <option value="SECURITY">Security</option>
              <option value="EVENT">Event</option>
              <option value="ADMINISTRATION">Administration</option>
              <option value="REPAIR">Repair</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <FilterBar 
          searchPlaceholder="Search by title or vendor..."
          onSearch={setSearchQuery}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
           <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl bg-slate-50">
          <Receipt className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-medium text-slate-700">No expenses found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {searchQuery || categoryFilter || statusFilter ? "Try adjusting your filters." : "Record the first expense using the button above."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <DataTable 
            columns={columns}
            data={filteredExpenses}
            itemsPerPage={15}
          />
        </div>
      )}

      <CreateExpenseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateExpense}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
