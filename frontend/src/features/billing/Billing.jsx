import { useState, useMemo } from "react";
import {
  CreditCard,
  FileText,
  Send,
  CheckCircle2,
  Download,
  Plus,
  Eye,
  AlertCircle,
  Clock,
  MoreVertical,
  Calendar,
  Building2,
  DollarSign,
  Ban,
  Percent,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, DataTable, FilterBar } from "../../components/shared";
import { Badge, Button, Modal, Input, Select, Card, Dropdown } from "../../components/ui";
import { LoadingScreen } from "../../components/feedback";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";
import { exportToCSV } from "../../lib/exportUtils";

export default function Billing() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedRows, setSelectedRows] = useState([]);

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [lateFeeModalBill, setLateFeeModalBill] = useState(null);

  // Form State for Bulk Invoices
  const [generateForm, setGenerateForm] = useState({
    billingMonth: new Date().toISOString().slice(0, 7), // "YYYY-MM"
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    maintenanceCharge: "3500",
    waterCharge: "500",
    securityCharge: "500",
  });

  const [lateFeeAmount, setLateFeeAmount] = useState("250");

  // Fetch Bills from API
  const { data: billsData, isLoading, isError, refetch } = useQuery({
    queryKey: ["bills", statusFilter],
    queryFn: async () => {
      const res = await api.get("/billing/bills", {
        params: { status: statusFilter === "ALL" ? undefined : statusFilter },
      });
      const list = res.data?.data?.bills || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      return list;
    },
  });

  // Fetch Summary Metrics
  const { data: summaryData } = useQuery({
    queryKey: ["billingSummary"],
    queryFn: async () => {
      try {
        const res = await api.get("/billing/bills/dashboard/summary");
        return res.data?.data || null;
      } catch {
        return null;
      }
    },
  });

  // Generate Invoices Mutation
  const generateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/billing/bills/generate", payload);
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["billingSummary"] });
      toast.success(res.message || "Monthly maintenance bills generated successfully!");
      setIsGenerateModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to generate invoices");
    },
  });

  // Add Late Fee Mutation
  const lateFeeMutation = useMutation({
    mutationFn: async ({ billId, amount }) => {
      const res = await api.post(`/billing/bills/${billId}/add-late-fee`, { feeAmount: Number(amount) });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Late fee added to invoice");
      setLateFeeModalBill(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add late fee");
    },
  });

  // Cancel Bill Mutation
  const cancelBillMutation = useMutation({
    mutationFn: async (billId) => {
      const res = await api.patch(`/billing/bills/${billId}/cancel`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      toast.success("Invoice cancelled successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to cancel invoice");
    },
  });

  const bills = Array.isArray(billsData) ? billsData : [];

  // Financial Metrics Calculation
  const metrics = useMemo(() => {
    const calculatedCollected = bills
      .filter((b) => b.status === "PAID" || (b.amountPaid && b.amountPaid > 0))
      .reduce((sum, b) => {
        if (b.status === "PAID") {
          return sum + ((b.amountPaid && b.amountPaid > 0) ? b.amountPaid : (b.totalAmount || 0));
        }
        return sum + (b.amountPaid || 0);
      }, 0);

    const calculatedPending = bills
      .filter((b) => b.status === "PENDING" || b.status === "OVERDUE" || b.status === "PARTIAL")
      .reduce((sum, b) => {
        const paid = b.status === "PAID" ? (b.totalAmount || 0) : (b.amountPaid || 0);
        return sum + Math.max(0, (b.totalAmount || 0) - paid);
      }, 0);

    const overdueCount = bills.filter((b) => b.status === "OVERDUE").length;
    const paidCount = bills.filter((b) => b.status === "PAID").length;

    const totalCollected = (summaryData?.totalCollected && summaryData.totalCollected > 0)
      ? summaryData.totalCollected
      : calculatedCollected;

    return {
      totalCollected,
      totalPending: summaryData?.totalPending ?? calculatedPending,
      overdueCount: summaryData?.overdueCount ?? overdueCount,
      paidCount: summaryData?.paidCount ?? paidCount,
      totalBills: bills.length,
    };
  }, [bills, summaryData]);

  // Client-side filtering
  const filteredBills = useMemo(() => {
    return bills.filter((b) => {
      const flatNum = b.flatId?.flatNumber || b.flat || "";
      const invoiceNo = b.billNumber || b.invoiceNo || "";
      const residentName = b.residentId?.name || "";

      const matchSearch =
        !searchQuery ||
        flatNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        residentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "ALL" || b.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [bills, searchQuery, statusFilter]);

  const handleGenerateSubmit = (e) => {
    e.preventDefault();
    const items = [
      { title: "Monthly Maintenance Charge", amount: Number(generateForm.maintenanceCharge) || 0 },
      { title: "Water Supply Charge", amount: Number(generateForm.waterCharge) || 0 },
      { title: "Security & Common Services", amount: Number(generateForm.securityCharge) || 0 },
    ].filter((item) => item.amount > 0);

    if (items.length === 0) {
      toast.error("Please specify at least one charge amount greater than 0.");
      return;
    }

    const payload = {
      billingCycle: `${generateForm.billingMonth}-01`,
      issueDate: generateForm.issueDate,
      dueDate: generateForm.dueDate,
      items,
    };

    generateMutation.mutate(payload);
  };

  const columns = [
    {
      header: "Invoice No.",
      accessor: "billNumber",
      cell: (row) => (
        <div>
          <span className="font-semibold text-text text-sm block font-mono">
            {row.billNumber || row.invoiceNo || "BILL-001"}
          </span>
          <span className="text-xs text-muted">
            Cycle: {row.billingCycle ? new Date(row.billingCycle).toLocaleDateString([], { month: "short", year: "numeric" }) : "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Flat & Resident",
      accessor: "flatId",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
            {row.flatId?.flatNumber ? row.flatId.flatNumber.charAt(0) : "F"}
          </div>
          <div>
            <span className="font-semibold text-text text-sm block">Flat {row.flatId?.flatNumber || row.flat || "N/A"}</span>
            <span className="text-xs text-muted">{row.residentId?.name || "Resident"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Amount Dues",
      accessor: "totalAmount",
      cell: (row) => (
        <div>
          <span className="font-bold text-text text-sm block">₹{(row.totalAmount || 0).toLocaleString()}</span>
          {row.amountPaid > 0 && row.status !== "PAID" && (
            <span className="text-xs text-emerald-600 font-medium block">
              Paid: ₹{row.amountPaid.toLocaleString()}
            </span>
          )}
          {row.lateFee > 0 && (
            <span className="text-xs text-amber-600 block">Late Fee: +₹{row.lateFee}</span>
          )}
        </div>
      ),
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      cell: (row) => (
        <span className="text-xs text-text flex items-center gap-1 font-medium">
          <Calendar className="w-3.5 h-3.5 text-muted shrink-0" />
          {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "N/A"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        const variants = {
          PAID: "success",
          PENDING: "warning",
          OVERDUE: "danger",
          PARTIAL: "primary",
          CANCELLED: "default",
        };
        return <Badge variant={variants[row.status] || "default"}>{row.status || "PENDING"}</Badge>;
      },
    },
  ];

  const handleExport = () => {
    const dataToExport =
      selectedRows.length > 0 ? filteredBills.filter((r) => selectedRows.includes(r._id)) : filteredBills;
    exportToCSV(dataToExport, "Society_Maintenance_Bills", columns.filter((c) => c.accessor !== "actions"));
  };

  if (isLoading) return <LoadingScreen message="Loading billing data..." />;

  if (isError) {
    return (
      <div className="p-8 text-center bg-danger/10 text-danger rounded-xl border border-danger/20">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-semibold">Failed to load billing invoices.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Billing & Financial Collections"
        subtitle="Manage society maintenance dues, generate bulk monthly invoices, track payments, and enforce late fees."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!filteredBills.length}>
              <Download size={16} className="mr-2" />
              {selectedRows.length > 0 ? `Export Selected (${selectedRows.length})` : "Export CSV"}
            </Button>
            <Button size="sm" onClick={() => setIsGenerateModalOpen(true)}>
              <FileText size={16} className="mr-2" />
              Generate Monthly Invoices
            </Button>
          </div>
        }
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-surface border border-border rounded-xl shadow-xs">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Total Collected</p>
            <h4 className="text-2xl font-bold text-text mt-0.5">₹{metrics.totalCollected.toLocaleString()}</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-surface border border-border rounded-xl shadow-xs">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Pending Dues</p>
            <h4 className="text-2xl font-bold text-text mt-0.5">₹{metrics.totalPending.toLocaleString()}</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-surface border border-border rounded-xl shadow-xs">
          <div className="p-3 bg-danger/10 text-danger rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Overdue Invoices</p>
            <h4 className="text-2xl font-bold text-text mt-0.5">{metrics.overdueCount}</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-surface border border-border rounded-xl shadow-xs">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Total Invoices</p>
            <h4 className="text-2xl font-bold text-text mt-0.5">{metrics.totalBills}</h4>
          </div>
        </Card>
      </div>

      {/* Filter Bar & Status Pills */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-4 shadow-xs">
        <div className="flex flex-wrap gap-2">
          {["ALL", "PENDING", "PAID", "OVERDUE", "PARTIAL", "CANCELLED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-primary text-white shadow-xs"
                  : "bg-background border border-border text-muted hover:text-text"
              }`}
            >
              {st === "ALL" ? "All Invoices" : st}
            </button>
          ))}
        </div>

        <FilterBar
          searchPlaceholder="Search by flat, invoice number, or resident name..."
          onSearch={(val) => setSearchQuery(val)}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredBills}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
      />

      {/* Generate Invoices Modal */}
      {isGenerateModalOpen && (
        <Modal
          open={isGenerateModalOpen}
          onClose={() => setIsGenerateModalOpen(false)}
          title="Generate Bulk Maintenance Invoices"
          size="lg"
        >
          <form onSubmit={handleGenerateSubmit} className="space-y-4 pt-2">
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-primary">Automated Bulk Billing Engine</p>
              <p className="text-muted">
                Generating invoices will automatically compute charges for every active occupied flat in your society for the selected month.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                type="month"
                label="Billing Month"
                value={generateForm.billingMonth}
                onChange={(e) => setGenerateForm({ ...generateForm, billingMonth: e.target.value })}
                required
              />
              <Input
                type="date"
                label="Issue Date"
                value={generateForm.issueDate}
                onChange={(e) => setGenerateForm({ ...generateForm, issueDate: e.target.value })}
                required
              />
              <Input
                type="date"
                label="Due Date"
                value={generateForm.dueDate}
                onChange={(e) => setGenerateForm({ ...generateForm, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-semibold text-xs text-text uppercase tracking-wider">Fee Structure Breakdown</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  type="number"
                  label="Monthly Maintenance (₹)"
                  value={generateForm.maintenanceCharge}
                  onChange={(e) => setGenerateForm({ ...generateForm, maintenanceCharge: e.target.value })}
                  required
                />
                <Input
                  type="number"
                  label="Water Supply Charge (₹)"
                  value={generateForm.waterCharge}
                  onChange={(e) => setGenerateForm({ ...generateForm, waterCharge: e.target.value })}
                />
                <Input
                  type="number"
                  label="Security & Operations (₹)"
                  value={generateForm.securityCharge}
                  onChange={(e) => setGenerateForm({ ...generateForm, securityCharge: e.target.value })}
                />
              </div>
            </div>

            <div className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between text-sm font-semibold">
              <span>Total Invoice Amount Per Flat:</span>
              <span className="text-primary text-base font-bold">
                ₹
                {(
                  (Number(generateForm.maintenanceCharge) || 0) +
                  (Number(generateForm.waterCharge) || 0) +
                  (Number(generateForm.securityCharge) || 0)
                ).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsGenerateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={generateMutation.isPending}>
                Generate Invoices Now
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Late Fee Modal */}
      {lateFeeModalBill && (
        <Modal open={!!lateFeeModalBill} onClose={() => setLateFeeModalBill(null)} title="Apply Late Fee Penalty">
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted">
              Add a late payment fee to invoice <strong className="text-text font-mono">{lateFeeModalBill.billNumber}</strong> for Flat {lateFeeModalBill.flatId?.flatNumber}.
            </p>

            <Input
              type="number"
              label="Late Fee Amount (₹)"
              value={lateFeeAmount}
              onChange={(e) => setLateFeeAmount(e.target.value)}
              required
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setLateFeeModalBill(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => lateFeeMutation.mutate({ billId: lateFeeModalBill._id, amount: lateFeeAmount })}
                loading={lateFeeMutation.isPending}
              >
                Apply Penalty
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Bill Details Modal */}
      {selectedBill && (
        <Modal open={!!selectedBill} onClose={() => setSelectedBill(null)} title="Invoice Breakdown">
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-4 bg-surface border border-border rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-base text-text block font-mono">
                    {selectedBill.billNumber || "INV-001"}
                  </span>
                  <span className="text-xs text-muted">
                    Flat {selectedBill.flatId?.flatNumber || selectedBill.flat || "N/A"} • {selectedBill.residentId?.name || "Resident"}
                  </span>
                </div>
                <Badge variant={selectedBill.status === "PAID" ? "success" : "warning"}>
                  {selectedBill.status}
                </Badge>
              </div>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface text-muted text-xs border-b border-border">
                  <tr>
                    <th className="p-3 font-semibold">Description</th>
                    <th className="p-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedBill.items && selectedBill.items.length > 0 ? (
                    selectedBill.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-text font-medium">{item.title || item.description}</td>
                        <td className="p-3 text-right text-text font-semibold">₹{item.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 text-text font-medium">Monthly Society Maintenance</td>
                      <td className="p-3 text-right text-text font-semibold">₹{(selectedBill.subTotal || selectedBill.totalAmount || 0).toLocaleString()}</td>
                    </tr>
                  )}

                  {selectedBill.lateFee > 0 && (
                    <tr className="bg-amber-500/5">
                      <td className="p-3 text-amber-700 font-semibold">Late Payment Fee</td>
                      <td className="p-3 text-right text-amber-700 font-bold">+₹{selectedBill.lateFee}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-surface border-t border-border font-bold text-sm">
                  <tr>
                    <td className="p-3 text-text">Total Dues Amount:</td>
                    <td className="p-3 text-right text-primary text-base">
                      ₹{(selectedBill.totalAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="pt-4 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedBill(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
