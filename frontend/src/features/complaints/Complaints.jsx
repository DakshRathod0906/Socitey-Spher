import { useState } from "react";
import { MessageSquare, MoreVertical, CheckCircle, Clock } from "lucide-react";
import { PageHeader, DataTable, FilterBar } from "../../components/shared";
import { Badge, Dropdown, Modal, Select, Button, Input } from "../../components/ui";
import { useComplaints, useAssignWorkOrder, useApproveReopen, useRejectReopen, useRejectComplaint, useCancelWorkOrder } from "./hooks/useComplaints";
import ViewFeedbackModal from "./components/ViewFeedbackModal";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";

// Custom hook for fetching staff
const useStaff = () => {
  return useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const { data } = await api.get("/api/societies/staff");
      // Filter for service staff only
      return data.data.filter(s => s.role === "service_staff");
    }
  });
};

export default function Complaints() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  // Modals state
  const [assignModalData, setAssignModalData] = useState(null);
  const [rejectModalData, setRejectModalData] = useState(null);
  const [viewFeedbackModalData, setViewFeedbackModalData] = useState(null);

  // Queries
  const { data, isLoading } = useComplaints({ status: statusFilter, category: categoryFilter });
  const { data: staffList } = useStaff();

  // Mutations
  const assignMutation = useAssignWorkOrder();
  const approveReopenMutation = useApproveReopen();
  const rejectReopenMutation = useRejectReopen();
  const rejectComplaintMutation = useRejectComplaint();
  const cancelWorkOrderMutation = useCancelWorkOrder();

  const complaints = data?.complaints || [];

  // Local filtering for search query
  const filteredComplaints = complaints.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.complaintNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.flatId?.flatNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const assignedTo = formData.get("assignedTo");
    
    if (assignModalData && assignedTo) {
      assignMutation.mutate(
        { 
          complaintId: assignModalData._id, 
          assignedTo,
          assignedDepartment: "General" 
        },
        {
          onSuccess: () => setAssignModalData(null)
        }
      );
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const reason = formData.get("reason");
    
    if (rejectModalData && reason) {
      if (rejectModalData.status === "REOPEN_REQUESTED") {
        rejectReopenMutation.mutate({ id: rejectModalData._id, reason }, { onSuccess: () => setRejectModalData(null) });
      } else {
        rejectComplaintMutation.mutate({ id: rejectModalData._id, reason }, { onSuccess: () => setRejectModalData(null) });
      }
    }
  };

  const columns = [
    { 
      header: "Ticket", 
      accessor: "title", 
      cell: (row) => (
        <div>
          <p className="font-medium text-text">{row.title}</p>
          <p className="text-xs text-muted">{row.complaintNumber} • Flat {row.flatId?.flatNumber || "N/A"}</p>
        </div>
      )
    },
    { 
      header: "Category", 
      accessor: "category",
      cell: (row) => <span className="text-sm text-text capitalize">{row.category.toLowerCase()}</span>
    },
    { 
      header: "Date", 
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
      align: "right",
      cell: (row) => {
        const actions = [];
        
        if (row.status === "OPEN") {
          actions.push({ label: "Assign Staff", onClick: () => setAssignModalData(row) });
          actions.push({ label: "Reject Ticket", onClick: () => setRejectModalData(row) });
        }
        
        if (row.status === "REOPEN_REQUESTED") {
          actions.push({ label: "Approve Reopen", onClick: () => approveReopenMutation.mutate(row._id) });
          actions.push({ label: "Reject Reopen", onClick: () => setRejectModalData(row) });
        }
        
        if (row.status === "CLOSED" && (row.residentRating || row.residentFeedback)) {
          actions.push({ label: "View Feedback", onClick: () => setViewFeedbackModalData(row) });
        }

        if (actions.length === 0) return <span className="text-muted text-xs">No Actions</span>;

        return (
          <Dropdown 
            align="right"
            items={actions}
            trigger={
              <button className="p-1.5 rounded-lg text-muted hover:bg-secondary-light hover:text-text transition-colors">
                <MoreVertical size={16} />
              </button>
            }
          />
        );
      }
    }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Helpdesk & Complaints" 
        subtitle="Manage resident tickets and assign service staff."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
        <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-danger-light flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-danger" />
          </div>
          <div>
            <p className="text-sm text-muted">Open / Reopen Requests</p>
            <p className="text-2xl font-bold text-text">
              {complaints.filter(c => c.status === "OPEN" || c.status === "REOPEN_REQUESTED").length}
            </p>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary-light flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted">Active Work Orders</p>
            <p className="text-2xl font-bold text-text">
              {complaints.filter(c => c.status === "ASSIGNED" || c.status === "IN_PROGRESS").length}
            </p>
          </div>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-success-light flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted">Resolved / Closed</p>
            <p className="text-2xl font-bold text-text">
              {complaints.filter(c => c.status === "RESOLVED" || c.status === "CLOSED").length}
            </p>
          </div>
        </div>
      </div>

      <FilterBar 
        searchPlaceholder="Search ticket # or flat..."
        onSearch={setSearchQuery}
        filters={[
          { 
            label: "Category", 
            options: [
              { label: "All", value: "" },
              { label: "Plumbing", value: "PLUMBING" }, 
              { label: "Electrical", value: "ELECTRICAL" },
              { label: "Cleaning", value: "CLEANING" },
              { label: "Other", value: "OTHER" }
            ],
            onChange: setCategoryFilter
          },
          { 
            label: "Status", 
            options: [
              { label: "All", value: "" },
              { label: "Open", value: "OPEN" },
              { label: "Assigned", value: "ASSIGNED" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Resolved", value: "RESOLVED" },
              { label: "Reopen Requested", value: "REOPEN_REQUESTED" },
            ],
            onChange: setStatusFilter
          }
        ]}
      />

      {isLoading ? (
        <div className="text-center py-12 text-muted">Loading complaints...</div>
      ) : (
        <DataTable 
          columns={columns}
          data={filteredComplaints}
          itemsPerPage={10}
        />
      )}

      {/* Assign Modal */}
      <Modal 
        open={!!assignModalData} 
        onClose={() => setAssignModalData(null)}
        title="Assign Work Order"
        description={`Assign staff to ${assignModalData?.complaintNumber}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 pt-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Assign To</label>
            <Select name="assignedTo" required>
              <option value="">Select Staff...</option>
              {staffList?.map(staff => (
                <option key={staff._id} value={staff._id}>
                  {staff.name} ({staff.serviceCategory || "General"})
                </option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setAssignModalData(null)}>Cancel</Button>
            <Button type="submit" isLoading={assignMutation.isPending}>Assign Ticket</Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal 
        open={!!rejectModalData} 
        onClose={() => setRejectModalData(null)}
        title={rejectModalData?.status === "REOPEN_REQUESTED" ? "Reject Reopen Request" : "Reject Complaint"}
        description={`Provide a reason for rejecting ${rejectModalData?.complaintNumber}`}
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4 pt-4">
          <Input 
            name="reason" 
            label="Rejection Reason" 
            placeholder="Please enter a reason..." 
            required
          />
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setRejectModalData(null)}>Cancel</Button>
            <Button type="submit" variant="danger" isLoading={rejectComplaintMutation.isPending || rejectReopenMutation.isPending}>
              Reject Ticket
            </Button>
          </div>
        </form>
      </Modal>

      <ViewFeedbackModal 
        isOpen={!!viewFeedbackModalData}
        onClose={() => setViewFeedbackModalData(null)}
        complaint={viewFeedbackModalData}
      />
    </div>
  );
}
