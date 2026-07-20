import { useState } from "react";
import { Plus, MessageSquare } from "lucide-react";
import { PageHeader, DataTable } from "../../components/shared";
import { Badge, Button, Modal, Input, Select, Textarea } from "../../components/ui";
import { EmptyState } from "../../components/feedback";
import { useComplaints, useCreateComplaint, useCancelComplaint } from "./hooks/useComplaints";

export default function MyComplaints() {
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("PLUMBING");

  const { data, isLoading } = useComplaints();
  const createMutation = useCreateComplaint();
  const cancelMutation = useCancelComplaint();

  const columns = [
    { 
      header: "Ticket Details", 
      accessor: "title", 
      cell: (row) => (
        <div>
          <p className="font-medium text-text">{row.title}</p>
          <p className="text-xs text-muted">{row.complaintNumber} • {row.category}</p>
        </div>
      )
    },
    { 
      header: "Date Raised", 
      accessor: "createdAt",
      cell: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => {
        const variants = {
          "RESOLVED": "success",
          "CLOSED": "success",
          "IN_PROGRESS": "primary",
          "ASSIGNED": "primary",
          "OPEN": "warning",
          "REOPEN_REQUESTED": "warning",
          "CANCELLED": "danger",
          "REJECTED": "danger"
        };
        return <Badge variant={variants[row.status] || "default"}>{row.status.replace("_", " ")}</Badge>;
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          {row.status === "OPEN" && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if(window.confirm("Are you sure you want to cancel this complaint?")) {
                  cancelMutation.mutate(row._id);
                }
              }}
              disabled={cancelMutation.isPending}
            >
              Cancel
            </Button>
          )}
          {/* Note: In a real app we'd route to a detail page here to see history and leave feedback */}
        </div>
      )
    }
  ];

  const handleRaiseTicket = () => {
    if(!title || !description) return;
    
    // In a real app we'd handle FormData for images, here we just pass json for now
    createMutation.mutate(
      { title, description, category },
      {
        onSuccess: () => {
          setIsRaiseModalOpen(false);
          setTitle("");
          setDescription("");
          setCategory("PLUMBING");
        }
      }
    );
  };

  const complaints = data?.complaints || [];

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

      {complaints.length === 0 && !isLoading ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center mb-8">
          <MessageSquare className="h-12 w-12 text-muted mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold text-text mb-2">Need help?</h3>
          <p className="text-muted mb-6 max-w-md mx-auto">
            If you are facing any issues with plumbing, electricals, or society amenities, raise a ticket and our service staff will assist you.
          </p>
          <Button onClick={() => setIsRaiseModalOpen(true)}>Raise a Ticket</Button>
        </div>
      ) : null}

      <h2 className="text-lg font-semibold text-text mb-4 mt-8">My Ticket History</h2>
      {isLoading ? (
        <div className="text-center py-12 text-muted">Loading complaints...</div>
      ) : (
        <DataTable 
          columns={columns}
          data={complaints}
          pagination={false}
        />
      )}

      <Modal 
        open={isRaiseModalOpen} 
        onClose={() => setIsRaiseModalOpen(false)}
        title="Raise a Complaint"
        description="Provide details about the issue so we can assign the right personnel."
        footer={
          <>
            <Button variant="outline" onClick={() => setIsRaiseModalOpen(false)}>Cancel</Button>
            <Button onClick={handleRaiseTicket} isLoading={createMutation.isPending}>Submit Ticket</Button>
          </>
        }
      >
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Category</label>
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="PLUMBING">Plumbing</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="CARPENTRY">Carpentry</option>
              <option value="CLEANING">Housekeeping / Cleaning</option>
              <option value="AMENITIES">Society Amenities</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <Input 
            label="Issue Title" 
            placeholder="Brief summary of the issue"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea 
            label="Detailed Description" 
            placeholder="Explain the issue in detail..." 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
