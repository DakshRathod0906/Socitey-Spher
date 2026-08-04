import { useState, useMemo } from "react";
import {
  MessageSquare,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Building2,
  Filter,
  Eye,
  XCircle,
  RotateCcw,
  Check,
  UserPlus,
  Tag,
  Star,
  RefreshCw,
  Download,
} from "lucide-react";
import { PageHeader, DataTable, FilterBar } from "../../components/shared";
import { Badge, Dropdown, Modal, Select, Button, Input, Card } from "../../components/ui";
import { LoadingScreen } from "../../components/feedback";
import {
  useComplaints,
  useApproveReopen,
  useRejectReopen,
  useRejectComplaint,
  useAssignWorkOrder,
  useCancelWorkOrder,
  useResolveComplaint,
  useUpdateComplaintStatus,
} from "./hooks/useComplaints";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import { exportToCSV } from "../../lib/exportUtils";
import { toast } from "sonner";

// Hook to fetch available service staff
const useServiceStaff = () => {
  return useQuery({
    queryKey: ["serviceStaff"],
    queryFn: async () => {
      const res = await api.get("/users?role=service_staff");
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      return list;
    },
  });
};

export default function Complaints() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [selectedRows, setSelectedRows] = useState([]);

  // Modals
  const [assignModalData, setAssignModalData] = useState(null);
  const [rejectModalData, setRejectModalData] = useState(null);
  const [viewDetailData, setViewDetailData] = useState(null);

  // Queries
  const { data: complaintsData, isLoading, isError, refetch } = useComplaints({});
  const { data: staffList = [] } = useServiceStaff();

  // Mutations
  const assignMutation = useAssignWorkOrder();
  const approveReopenMutation = useApproveReopen();
  const rejectReopenMutation = useRejectReopen();
  const rejectComplaintMutation = useRejectComplaint();
  const resolveMutation = useResolveComplaint();
  const updateStatusMutation = useUpdateComplaintStatus();

  const rawComplaints = Array.isArray(complaintsData)
    ? complaintsData
    : (complaintsData?.complaints || complaintsData?.data || []);

  // Compute Metrics
  const metrics = useMemo(() => {
    return {
      total: rawComplaints.length,
      pending: rawComplaints.filter((c) => c.status === "OPEN" || c.status === "SUBMITTED" || c.status === "REOPEN_REQUESTED").length,
      inProgress: rawComplaints.filter((c) => c.status === "IN_PROGRESS" || c.status === "ASSIGNED").length,
      resolved: rawComplaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length,
    };
  }, [rawComplaints]);

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return rawComplaints.filter((c) => {
      const matchSearch =
        !searchQuery ||
        (c.title && c.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.complaintNumber && c.complaintNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.flatId?.flatNumber && c.flatId.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchStatus = true;
      if (statusFilter === "SUBMITTED") {
        matchStatus = c.status === "OPEN" || c.status === "SUBMITTED";
      } else if (statusFilter === "IN_PROGRESS") {
        matchStatus = c.status === "IN_PROGRESS" || c.status === "ASSIGNED";
      } else if (statusFilter === "RESOLVED") {
        matchStatus = c.status === "RESOLVED" || c.status === "CLOSED";
      } else if (statusFilter !== "ALL") {
        matchStatus = c.status === statusFilter;
      }

      const matchCategory = categoryFilter === "ALL" || (c.category && c.category.toUpperCase() === categoryFilter.toUpperCase());
      const matchPriority = priorityFilter === "ALL" || (c.priority && c.priority.toUpperCase() === priorityFilter.toUpperCase());

      return matchSearch && matchStatus && matchCategory && matchPriority;
    });
  }, [rawComplaints, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const assignedTo = formData.get("assignedTo");
    const department = formData.get("department") || "General";

    if (assignModalData && assignedTo) {
      assignMutation.mutate(
        {
          complaintId: assignModalData._id,
          assignedTo,
          assignedDepartment: department,
        },
        {
          onSuccess: () => setAssignModalData(null),
        }
      );
    } else {
      toast.error("Please select a staff member to assign");
    }
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const reason = formData.get("reason");

    if (rejectModalData && reason) {
      if (rejectModalData.status === "REOPEN_REQUESTED") {
        rejectReopenMutation.mutate(
          { id: rejectModalData._id, reason },
          { onSuccess: () => setRejectModalData(null) }
        );
      } else {
        rejectComplaintMutation.mutate(
          { id: rejectModalData._id, reason },
          { onSuccess: () => setRejectModalData(null) }
        );
      }
    } else {
      toast.error("Please enter a reason for rejection");
    }
  };

  const handleApproveReopen = (complaint) => {
    if (confirm(`Approve reopen request for ticket ${complaint.complaintNumber || complaint.title}?`)) {
      approveReopenMutation.mutate(complaint._id);
    }
  };

  const columns = [
    {
      header: "Ticket & Flat",
      accessor: "title",
      cell: (row) => (
        <div>
          <span className="font-semibold text-text text-sm block">{row.title}</span>
          <span className="text-xs text-muted font-mono flex items-center gap-1.5 mt-0.5">
            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">{row.complaintNumber || "CMP"}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3 text-muted" /> Flat {row.flatId?.flatNumber || "N/A"}</span>
          </span>
        </div>
      ),
    },
    {
      header: "Category",
      accessor: "category",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface border border-border text-text capitalize">
          <Tag className="w-3 h-3 mr-1 text-primary" />
          {row.category ? row.category.toLowerCase() : "General"}
        </span>
      ),
    },
    {
      header: "Priority",
      accessor: "priority",
      cell: (row) => {
        const variants = {
          URGENT: "danger",
          HIGH: "warning",
          MEDIUM: "primary",
          LOW: "default",
        };
        return <Badge variant={variants[row.priority?.toUpperCase()] || "default"}>{row.priority || "MEDIUM"}</Badge>;
      },
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        const variants = {
          OPEN: "warning",
          SUBMITTED: "warning",
          ASSIGNED: "primary",
          IN_PROGRESS: "primary",
          RESOLVED: "success",
          CLOSED: "default",
          REJECTED: "danger",
          REOPEN_REQUESTED: "warning",
        };
        return (
          <Badge variant={variants[row.status] || "default"}>
            {row.status ? row.status.replace("_", " ") : "OPEN"}
          </Badge>
        );
      },
    },
    {
      header: "Assigned Staff",
      accessor: "assignedTo",
      cell: (row) => (
        <span className="text-xs font-medium text-text">
          {row.assignedTo?.name || row.workOrderId?.assignedTo?.name ? (
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <UserCheck className="w-3.5 h-3.5" />
              {row.assignedTo?.name || row.workOrderId?.assignedTo?.name}
            </span>
          ) : (
            <span className="text-muted italic">Unassigned</span>
          )}
        </span>
      ),
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
              label: "View Details",
              icon: Eye,
              onClick: () => setViewDetailData(row),
            },
            ...(row.status === "OPEN" || row.status === "SUBMITTED" || row.status === "REOPEN_REQUESTED"
              ? [
                  {
                    label: "Assign Staff",
                    icon: UserPlus,
                    onClick: () => setAssignModalData(row),
                  },
                ]
              : []),
            ...(row.status === "OPEN" || row.status === "SUBMITTED"
              ? [
                  {
                    label: "Mark In Progress",
                    icon: Clock,
                    onClick: () => updateStatusMutation.mutate({ id: row._id, status: "IN_PROGRESS" }),
                  },
                ]
              : []),
            ...(row.status !== "RESOLVED" && row.status !== "CLOSED" && row.status !== "REJECTED"
              ? [
                  {
                    label: "Mark as Resolved",
                    icon: CheckCircle2,
                    onClick: () => resolveMutation.mutate({ id: row._id }),
                  },
                ]
              : []),
            ...(row.status === "REOPEN_REQUESTED"
              ? [
                  {
                    label: "Approve Reopen",
                    icon: Check,
                    onClick: () => handleApproveReopen(row),
                  },
                ]
              : []),
            ...(row.status !== "RESOLVED" && row.status !== "CLOSED" && row.status !== "REJECTED"
              ? [
                  {
                    label: "Reject Ticket",
                    icon: XCircle,
                    onClick: () => setRejectModalData(row),
                  },
                ]
              : []),
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

  const handleExport = () => {
    const dataToExport =
      selectedRows.length > 0
        ? filteredComplaints.filter((r) => selectedRows.includes(r._id))
        : filteredComplaints;
    exportToCSV(dataToExport, "Society_Complaints", columns.filter((c) => c.accessor !== "actions"));
  };

  if (isLoading) return <LoadingScreen message="Loading complaints catalog..." />;

  if (isError) {
    return (
      <div className="p-8 text-center bg-danger/10 text-danger rounded-xl border border-danger/20">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        <p className="font-semibold">Failed to load complaints.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 mr-2" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Helpdesk & Complaints"
        description="Track resident service requests, assign work orders to staff, and manage ticket lifecycles."
        action={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!filteredComplaints.length}>
            <Download size={16} className="mr-2" />
            {selectedRows.length > 0 ? `Export Selected (${selectedRows.length})` : "Export CSV"}
          </Button>
        }
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-surface border border-border rounded-xl shadow-xs">
          <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Total Tickets</p>
            <h4 className="text-2xl font-bold text-text mt-0.5">{metrics.total}</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-surface border border-border rounded-xl shadow-xs">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Open / Pending</p>
            <h4 className="text-2xl font-bold text-text mt-0.5">{metrics.pending}</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-surface border border-border rounded-xl shadow-xs">
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">In Progress</p>
            <h4 className="text-2xl font-bold text-text mt-0.5">{metrics.inProgress}</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4 bg-surface border border-border rounded-xl shadow-xs">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Resolved / Closed</p>
            <h4 className="text-2xl font-bold text-text mt-0.5">{metrics.resolved}</h4>
          </div>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="bg-surface border border-border rounded-xl p-4 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "ALL", label: "All Tickets" },
              { id: "IN_PROGRESS", label: "In Progress" },
              { id: "RESOLVED", label: "Resolved" },
              { id: "REJECTED", label: "Rejected" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-primary text-white shadow-xs ring-2 ring-primary/20"
                    : "bg-background border border-border text-muted hover:text-text hover:bg-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Select
              className="text-xs py-1.5 h-9 w-36"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="CARPENTRY">Carpentry</option>
              <option value="CIVIL">Civil</option>
              <option value="CLEANLINESS">Cleanliness</option>
              <option value="SECURITY">Security</option>
              <option value="OTHER">Other</option>
            </Select>

            <Select
              className="text-xs py-1.5 h-9 w-32"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </Select>
          </div>
        </div>

        <FilterBar
          searchPlaceholder="Search complaints by title, ticket #, or flat..."
          onSearch={(val) => setSearchQuery(val)}
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredComplaints}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
      />

      {/* Assign Staff Modal */}
      {assignModalData && (
        <Modal open={!!assignModalData} onClose={() => setAssignModalData(null)} title="Assign Service Staff">
          <form onSubmit={handleAssignSubmit} className="space-y-4 pt-2">
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-xs space-y-1">
              <p className="font-semibold text-text text-sm">{assignModalData.title}</p>
              <p className="text-muted">
                Ticket: <span className="font-mono">{assignModalData.complaintNumber}</span> • Category:{" "}
                <span className="capitalize">{assignModalData.category}</span>
              </p>
            </div>

            <Select label="Assign to Staff Member" name="assignedTo" required>
              <option value="">Select Staff Member</option>
              {staffList.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.name} ({staff.serviceCategory || "General Staff"})
                </option>
              ))}
            </Select>

            <Input label="Department / Notes" name="department" defaultValue={assignModalData.category || "Maintenance"} />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setAssignModalData(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={assignMutation.isPending}>
                Create Work Order
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectModalData && (
        <Modal open={!!rejectModalData} onClose={() => setRejectModalData(null)} title="Reject Ticket">
          <form onSubmit={handleRejectSubmit} className="space-y-4 pt-2">
            <p className="text-sm text-muted">
              Specify the reason for rejecting ticket <strong className="text-text">{rejectModalData.complaintNumber}</strong>.
            </p>

            <Input label="Rejection Reason" name="reason" placeholder="e.g. Duplicate ticket / Out of scope" required />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setRejectModalData(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                loading={rejectComplaintMutation.isPending || rejectReopenMutation.isPending}
              >
                Reject Complaint
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Detail Modal */}
      {viewDetailData && (
        <Modal open={!!viewDetailData} onClose={() => setViewDetailData(null)} title="Complaint Details">
          <div className="space-y-4 pt-2 text-xs">
            <div className="p-4 bg-surface border border-border rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-text">{viewDetailData.title}</span>
                <Badge variant={viewDetailData.priority === "URGENT" ? "danger" : "primary"}>
                  {viewDetailData.priority}
                </Badge>
              </div>
              <p className="text-muted leading-relaxed">{viewDetailData.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-surface border border-border rounded-lg space-y-1">
                <span className="text-muted block">Ticket Number</span>
                <span className="font-mono font-bold text-text text-sm">{viewDetailData.complaintNumber}</span>
              </div>
              <div className="p-3 bg-surface border border-border rounded-lg space-y-1">
                <span className="text-muted block">Category</span>
                <span className="font-bold text-text capitalize">{viewDetailData.category}</span>
              </div>
              <div className="p-3 bg-surface border border-border rounded-lg space-y-1">
                <span className="text-muted block">Created Date</span>
                <span className="font-semibold text-text">
                  {viewDetailData.createdAt ? new Date(viewDetailData.createdAt).toLocaleString() : "N/A"}
                </span>
              </div>
              <div className="p-3 bg-surface border border-border rounded-lg space-y-1">
                <span className="text-muted block">Assigned Staff</span>
                <span className="font-semibold text-text">
                  {viewDetailData.assignedTo?.name || "Unassigned"}
                </span>
              </div>
            </div>

            {viewDetailData.residentRating && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-1">
                <span className="font-semibold text-amber-700 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  Resident Rating: {viewDetailData.residentRating}/5
                </span>
                {viewDetailData.residentFeedback && (
                  <p className="text-muted italic">"{viewDetailData.residentFeedback}"</p>
                )}
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <Button variant="outline" onClick={() => setViewDetailData(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
