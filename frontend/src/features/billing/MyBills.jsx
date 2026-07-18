import { CreditCard, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, DataTable } from "../../components/shared";
import { Badge, Button, Card } from "../../components/ui";

const MOCK_MY_BILLS = [
  { id: 1, invoiceNo: "INV-2023-10-001", month: "October 2023", amount: "₹4,500", dueDate: "10 Oct 2023", status: "Unpaid" },
  { id: 2, invoiceNo: "INV-2023-09-001", month: "September 2023", amount: "₹4,500", dueDate: "10 Sep 2023", status: "Paid" },
  { id: 3, invoiceNo: "INV-2023-08-001", month: "August 2023", amount: "₹4,500", dueDate: "10 Aug 2023", status: "Paid" },
];

export default function MyBills() {
  const currentDue = MOCK_MY_BILLS.find(b => b.status === "Unpaid");

  const columns = [
    { header: "Month", accessor: "month", cell: (row) => <span className="font-medium">{row.month}</span> },
    { header: "Invoice No.", accessor: "invoiceNo" },
    { header: "Amount", accessor: "amount" },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => (
        <Badge variant={row.status === "Paid" ? "success" : "danger"}>
          {row.status}
        </Badge>
      )
    },
    {
      header: "Receipt",
      accessor: "receipt",
      align: "right",
      cell: (row) => row.status === "Paid" ? (
        <Button variant="outline" size="sm" onClick={() => toast("Downloading receipt...")}>
          <Download className="h-4 w-4" />
        </Button>
      ) : <span className="text-muted text-xs">-</span>
    }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="My Bills & Payments" 
        subtitle="View your maintenance dues, pay online, and download receipts."
      />

      {currentDue && (
        <Card className="p-6 bg-gradient-to-br from-background to-secondary-light/30 border-primary/20">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="danger">Action Required</Badge>
                <span className="text-sm font-medium text-muted">Due by {currentDue.dueDate}</span>
              </div>
              <h3 className="text-2xl font-bold text-text">{currentDue.month} Maintenance</h3>
              <p className="text-sm text-muted mt-1">Invoice: {currentDue.invoiceNo}</p>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-3xl font-extrabold text-primary mb-3">{currentDue.amount}</span>
              <Button onClick={() => toast.success("Redirecting to payment gateway...")}>
                <CreditCard className="h-4 w-4 mr-2" /> Pay Now
              </Button>
            </div>
          </div>
        </Card>
      )}

      <h2 className="text-lg font-semibold text-text mb-4 mt-8">Payment History</h2>
      <DataTable 
        columns={columns}
        data={MOCK_MY_BILLS}
        pagination={false}
      />
    </div>
  );
}
