import { useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, DataTable } from "../../components/shared";
import { Badge, Button, Modal, Input, Select, Textarea } from "../../components/ui";

const MOCK_MY_COMPLAINTS = [
  { id: 1, title: "Water leakage in master bathroom", category: "Plumbing", date: "Today, 10:00 AM", status: "Open" },
  { id: 2, title: "Main door lock jammed", category: "Carpentry", date: "Last Week", status: "Resolved" },
];

export default function MyComplaints() {
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  const columns = [
    { 
      header: "Ticket Details", 
      accessor: "title", 
      cell: (row) => (
        <div>
          <p className="font-medium text-text">{row.title}</p>
          <p className="text-xs text-muted">{row.category}</p>
        </div>
      )
    },
    { header: "Date Raised", accessor: "date" },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => {
        const variants = {
          "Resolved": "success",
          "In Progress": "primary",
          "Open": "warning"
        };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    }
  ];

  const handleRaiseTicket = () => {
    toast.success("Complaint raised successfully! The facility manager will review it shortly.");
    setIsRaiseModalOpen(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="My Complaints" 
        subtitle="Raise and track service requests for your flat."
        actions={
          <Button onClick={() => setIsRaiseModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Raise Complaint
          </Button>
        }
      />

      <div className="bg-card rounded-xl border border-border p-8 text-center mb-8">
        <MessageSquare className="h-12 w-12 text-muted mx-auto mb-4 opacity-30" />
        <h3 className="text-lg font-semibold text-text mb-2">Need help?</h3>
        <p className="text-muted mb-6 max-w-md mx-auto">
          If you are facing any issues with plumbing, electricals, or society amenities, raise a ticket and our service staff will assist you.
        </p>
        <Button onClick={() => setIsRaiseModalOpen(true)}>Raise a Ticket</Button>
      </div>

      <h2 className="text-lg font-semibold text-text mb-4 mt-8">My Ticket History</h2>
      <DataTable 
        columns={columns}
        data={MOCK_MY_COMPLAINTS}
        pagination={false}
      />

      <Modal 
        open={isRaiseModalOpen} 
        onClose={() => setIsRaiseModalOpen(false)}
        title="Raise a Complaint"
        description="Provide details about the issue so we can assign the right personnel."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsRaiseModalOpen(false)}>Cancel</Button>
            <Button onClick={handleRaiseTicket}>Submit Ticket</Button>
          </>
        }
      >
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Category</label>
            <Select>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="carpentry">Carpentry</option>
              <option value="housekeeping">Housekeeping / Cleaning</option>
              <option value="amenities">Society Amenities</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <Input label="Issue Title" placeholder="Brief summary of the issue" />
          <Textarea label="Detailed Description" placeholder="Explain the issue in detail..." rows={4} />
        </div>
      </Modal>
    </div>
  );
}
