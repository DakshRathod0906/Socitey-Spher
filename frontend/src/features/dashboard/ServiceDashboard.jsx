import { useState } from "react";
import { ClipboardList, Wrench as Tool, CheckCircle, Clock } from "lucide-react";
import { PageHeader, StatCard, DataTable } from "../../components/shared";
import { Badge, Button, Modal, Input } from "../../components/ui";
import { useActiveWorkOrders, useStartWorkOrder, useResolveWorkOrder } from "../complaints/hooks/useComplaints";

export default function ServiceDashboard() {
  const [resolveModalData, setResolveModalData] = useState(null);
  
  const { data: workOrders = [], isLoading } = useActiveWorkOrders();
  const startMutation = useStartWorkOrder();
  const resolveMutation = useResolveWorkOrder();

  const handleResolveSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    // Include photo logic here eventually if needed
    
    if (resolveModalData) {
      resolveMutation.mutate(
        { id: resolveModalData._id, formData },
        { onSuccess: () => setResolveModalData(null) }
      );
    }
  };

  const columns = [
    { 
      header: "Ticket", 
      accessor: "complaint", 
      cell: (row) => (
        <div>
          <p className="font-medium text-text">{row.complaintId?.title}</p>
          <p className="text-xs text-muted">{row.complaintId?.complaintNumber} • {row.complaintId?.category}</p>
        </div>
      )
    },
    { 
      header: "Assigned Date", 
      accessor: "assignedAt",
      cell: (row) => new Date(row.assignedAt).toLocaleDateString()
    },
    { 
      header: "Status", 
      accessor: "status",
      cell: (row) => {
        const variants = {
          "RESOLVED": "success",
          "IN_PROGRESS": "primary",
          "ASSIGNED": "warning"
        };
        return <Badge variant={variants[row.status] || "default"}>{row.status.replace("_", " ")}</Badge>;
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      align: "right",
      cell: (row) => {
        if (row.status === "ASSIGNED") {
          return (
            <Button size="sm" onClick={() => startMutation.mutate(row._id)} isLoading={startMutation.isPending}>
              Start Work
            </Button>
          );
        }
        if (row.status === "IN_PROGRESS") {
          return (
            <Button size="sm" variant="outline" onClick={() => setResolveModalData(row)}>
              Resolve
            </Button>
          );
        }
        return null;
      }
    }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title="Service Dashboard" 
        subtitle="Manage assigned work orders and complaints."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Assigned" value={workOrders.length} icon={ClipboardList} />
        <StatCard title="In Progress" value={workOrders.filter(w => w.status === "IN_PROGRESS").length} icon={Tool} />
        <StatCard title="New Orders" value={workOrders.filter(w => w.status === "ASSIGNED").length} icon={CheckCircle} />
        <StatCard title="Average TAT" value="--" icon={Clock} />
      </div>

      <div className="bg-card rounded-xl border border-border mt-8 overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-text">Active Work Orders</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted">Loading orders...</div>
        ) : (
          <DataTable 
            columns={columns}
            data={workOrders}
            pagination={false}
          />
        )}
      </div>

      {/* Resolve Modal */}
      <Modal 
        open={!!resolveModalData} 
        onClose={() => setResolveModalData(null)}
        title="Resolve Work Order"
        description={`Add completion details for ${resolveModalData?.complaintId?.complaintNumber}`}
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4 pt-4">
          <Input 
            name="resolutionNotes" 
            label="Resolution Notes" 
            placeholder="What was fixed?" 
            required
          />
          {/* Note: File upload input can be added here for completionPhotos */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={() => setResolveModalData(null)}>Cancel</Button>
            <Button type="submit" isLoading={resolveMutation.isPending}>Submit Resolution</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
