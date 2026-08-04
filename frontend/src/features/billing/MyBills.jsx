import { useState } from "react";
import { CreditCard, Download, Calendar, CheckCircle2, AlertCircle, RefreshCw, Eye, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, DataTable } from "../../components/shared";
import { Badge, Button, Card, Modal, Select } from "../../components/ui";
import { LoadingScreen } from "../../components/feedback";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/api";

export default function MyBills() {
  const [selectedBill, setSelectedBill] = useState(null);
  const [payModalBill, setPayModalBill] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const queryClient = useQueryClient();

  const { data: bills = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["myBills"],
    queryFn: async () => {
      const res = await api.get("/billing/bills");
      const list = res.data?.data?.bills || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      return list;
    },
  });

  const payMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/billing/payments", payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["myBills"] });
      toast.success(`Payment of ₹${(payModalBill?.totalAmount || 0).toLocaleString()} completed successfully!`);
      setPayModalBill(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Payment transaction failed. Please try again.");
    },
  });

  const currentDue = bills.find((b) => b.status === "PENDING" || b.status === "OVERDUE");

  const handlePayNowClick = (bill) => {
    setPayModalBill(bill);
  };

  const handleConfirmPayment = () => {
    if (!payModalBill) return;
    payMutation.mutate({
      billId: payModalBill._id,
      amount: payModalBill.totalAmount,
      paymentMethod: paymentMethod,
    });
  };

  const columns = [
    {
      header: "Billing Cycle",
      accessor: "billingCycle",
      cell: (row) => (
        <span className="font-semibold text-text text-sm">
          {row.billingCycle ? new Date(row.billingCycle).toLocaleDateString([], { month: "long", year: "numeric" }) : "Maintenance Dues"}
        </span>
      ),
    },
    {
      header: "Invoice No.",
      accessor: "billNumber",
      cell: (row) => <span className="font-mono text-xs font-semibold text-muted">{row.billNumber || "BILL-001"}</span>,
    },
    {
      header: "Total Amount",
      accessor: "totalAmount",
      cell: (row) => <span className="font-bold text-text text-sm">₹{(row.totalAmount || 0).toLocaleString()}</span>,
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
        };
        return <Badge variant={variants[row.status] || "default"}>{row.status}</Badge>;
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedBill(row)}>
            <Eye className="h-4 w-4" />
          </Button>
          {row.status !== "PAID" && (
            <Button size="sm" onClick={() => handlePayNowClick(row)}>
              Pay Now
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) return <LoadingScreen message="Loading maintenance dues..." />;

  if (isError) {
    return (
      <div className="p-8 text-center bg-danger/10 text-danger rounded-xl border border-danger/20">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-semibold">Failed to load maintenance bills.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="My Bills & Payments"
        description="View your monthly maintenance dues, make online payments, and download receipts."
      />

      {currentDue ? (
        <Card className="p-6 bg-gradient-to-br from-primary/5 via-surface to-surface border border-primary/20 shadow-xs">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={currentDue.status === "OVERDUE" ? "danger" : "warning"}>
                  {currentDue.status === "OVERDUE" ? "Overdue" : "Action Required"}
                </Badge>
                <span className="text-xs font-medium text-muted">
                  Due by {currentDue.dueDate ? new Date(currentDue.dueDate).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-text">
                {currentDue.billingCycle ? new Date(currentDue.billingCycle).toLocaleDateString([], { month: "long", year: "numeric" }) : "Monthly"} Maintenance
              </h3>
              <p className="text-xs text-muted mt-1 font-mono">Invoice #{currentDue.billNumber || "BILL-001"}</p>
            </div>

            <div className="flex flex-col items-start md:items-end">
              <span className="text-3xl font-black text-primary mb-3">₹{(currentDue.totalAmount || 0).toLocaleString()}</span>
              <Button size="lg" onClick={() => handlePayNowClick(currentDue)}>
                <CreditCard className="h-5 w-5 mr-2" /> Pay Maintenance Now
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-base">All Dues Cleared!</h4>
            <p className="text-xs text-emerald-700">You have no pending maintenance dues. Thank you for your timely payments!</p>
          </div>
        </Card>
      )}

      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-text">Billing History & Invoices</h2>
        <DataTable columns={columns} data={bills} pagination={{ currentPage: 1, totalPages: 1 }} />
      </div>

      {/* Bill Details Modal */}
      {selectedBill && (
        <Modal open={!!selectedBill} onClose={() => setSelectedBill(null)} title="Maintenance Invoice Breakdown">
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-text block font-mono">{selectedBill.billNumber || "BILL-001"}</span>
                <span className="text-xs text-muted">
                  {selectedBill.billingCycle ? new Date(selectedBill.billingCycle).toLocaleDateString([], { month: "long", year: "numeric" }) : "Monthly Dues"}
                </span>
              </div>
              <Badge variant={selectedBill.status === "PAID" ? "success" : "warning"}>{selectedBill.status}</Badge>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-surface text-muted text-xs border-b border-border">
                  <tr>
                    <th className="p-3 font-semibold">Line Item</th>
                    <th className="p-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedBill.items && selectedBill.items.length > 0 ? (
                    selectedBill.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 text-text font-medium">{item.title}</td>
                        <td className="p-3 text-right text-text font-semibold">₹{item.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 text-text font-medium">Monthly Maintenance Dues</td>
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
                    <td className="p-3 text-right text-primary text-base">₹{(selectedBill.totalAmount || 0).toLocaleString()}</td>
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

      {/* Pay Maintenance Modal */}
      {payModalBill && (
        <Modal
          open={!!payModalBill}
          onClose={() => setPayModalBill(null)}
          title="Complete Maintenance Payment"
          description={`Invoice #${payModalBill.billNumber || payModalBill._id}`}
        >
          <div className="space-y-6 pt-2">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs text-muted font-medium">Total Amount Due</p>
                <p className="text-2xl font-black text-primary">₹{(payModalBill.totalAmount || 0).toLocaleString()}</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-primary opacity-80" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text">Payment Method</label>
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="UPI">UPI / Instant Transfer (Fast)</option>
                <option value="CREDIT_CARD">Credit / Debit Card</option>
                <option value="NET_BANKING">Net Banking</option>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setPayModalBill(null)} disabled={payMutation.isPending}>
                Cancel
              </Button>
              <Button onClick={handleConfirmPayment} loading={payMutation.isPending}>
                Confirm & Pay ₹{(payModalBill.totalAmount || 0).toLocaleString()}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
