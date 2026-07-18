import { useState } from "react";
import { CreditCard, FileText, Send, CheckCircle2, Download } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, DataTable, FilterBar } from "../../components/shared";
import { Badge, Button, Modal, Input, Select } from "../../components/ui";

const MOCK_INVOICES = [
  { id: 1, invoiceNo: "INV-2023-10-001", flat: "A-101", amount: "₹4,500", date: "01 Oct 2023", status: "Paid" },
  { id: 2, invoiceNo: "INV-2023-10-002", flat: "A-102", amount: "₹4,500", date: "01 Oct 2023", status: "Pending" },
  { id: 3, invoiceNo: "INV-2023-10-003", flat: "B-205", amount: "₹5,200", date: "01 Oct 2023", status: "Overdue" },
  { id: 4, invoiceNo: "INV-2023-10-004", flat: "C-401", amount: "₹4,500", date: "01 Oct 2023", status: "Paid" },
];

export default function Billing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  
  const filteredInvoices = MOCK_INVOICES.filter(i => 
    i.flat.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { header: "Invoice No.", accessor: "invoiceNo", sortable: true, cell: (row) => <span className="font-medium">{row.invoiceNo}</span> },
    { header: "Flat", accessor: "flat", sortable: true },
    { header: "Amount", accessor: "amount" },
    { header: "Due Date", accessor: "date" },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => {
        const variants = {
          "Paid": "success",
          "Pending": "warning",
          "Overdue": "danger"
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      cell: (row) => (
        <div className="flex justify-end gap-2">
          {row.status !== "Paid" && (
            <Button variant="outline" size="sm" onClick={() => toast.success("Reminder sent")}>
              <Send className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Billing & Collections" 
        subtitle="Manage society maintenance dues, generate invoices, and track payments."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-success-light flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted">Collected (This Month)</p>
            <p className="text-2xl font-bold text-text">₹2.4L</p>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-warning-light flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted">Pending Payments</p>
            <p className="text-2xl font-bold text-text">₹45,200</p>
          </div>
        </div>
      </div>

      <FilterBar 
        searchPlaceholder="Search by flat or invoice no..."
        onSearch={setSearchQuery}
        actionButton={{ label: "Generate Invoices", icon: FileText, onClick: () => setIsGenerateModalOpen(true) }}
        filters={[
          { label: "Status", options: [{ label: "Paid" }, { label: "Pending" }, { label: "Overdue" }] }
        ]}
      />

      <DataTable 
        columns={columns}
        data={filteredInvoices}
        itemsPerPage={10}
      />

      <Modal 
        open={isGenerateModalOpen} 
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Maintenance Invoices"
        description="Run the billing cycle for the current month. Invoices will be emailed to all residents."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success("Invoices generated and dispatched!");
              setIsGenerateModalOpen(false);
            }}>Run Billing Cycle</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Billing Month</label>
            <Select>
              <option value="oct-2023">October 2023</option>
              <option value="nov-2023">November 2023</option>
            </Select>
          </div>
          <Input label="Base Maintenance Amount (₹)" defaultValue="4500" type="number" />
          <p className="text-xs text-muted">
            Note: Flats with pending dues from the previous month will have late fees automatically applied according to the society bylaws.
          </p>
        </div>
      </Modal>
    </div>
  );
}
