import { useState } from "react";
import { ClipboardList, Wrench as Tool, CheckCircle, Clock } from "lucide-react";
import { PageHeader, StatCard } from "../../components/shared";
import { Tabs } from "../../components/ui";
import { useActiveWorkOrders, useStartWorkOrder, useResolveWorkOrder } from "../workOrders/hooks/useWorkOrders";
import WorkOrderCard from "../workOrders/components/WorkOrderCard";
import ResolveWorkOrderModal from "../workOrders/components/ResolveWorkOrderModal";

export default function ServiceDashboard() {
  const [resolveModalData, setResolveModalData] = useState(null);
  
  const { data: workOrders = [], isLoading, isError, refetch } = useActiveWorkOrders();
  const startMutation = useStartWorkOrder();
  const resolveMutation = useResolveWorkOrder();

  const handleResolveSubmit = (formData) => {
    if (resolveModalData) {
      resolveMutation.mutate(
        { id: resolveModalData._id, formData },
        { onSuccess: () => setResolveModalData(null) }
      );
    }
  };

  const assignedOrders = workOrders.filter(w => w.status === "ASSIGNED");
  const inProgressOrders = workOrders.filter(w => w.status === "IN_PROGRESS");
  const resolvedOrders = workOrders.filter(w => w.status === "RESOLVED");

  const renderEmptyState = (message) => (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl bg-slate-50">
      <ClipboardList className="w-12 h-12 text-slate-300 mb-3" />
      <h3 className="text-lg font-medium text-slate-700">All caught up</h3>
      <p className="text-sm text-slate-500 mt-1">{message}</p>
    </div>
  );

  const renderList = (list) => {
    if (list.length === 0) return renderEmptyState("No tasks in this category right now.");
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map(wo => (
          <WorkOrderCard
            key={wo._id}
            workOrder={wo}
            onStart={(id) => startMutation.mutate(id)}
            onResolve={() => setResolveModalData(wo)}
          />
        ))}
      </div>
    );
  };

  const tabsData = [
    {
      value: "assigned",
      label: "New",
      count: assignedOrders.length,
      icon: CheckCircle,
      content: renderList(assignedOrders),
    },
    {
      value: "in_progress",
      label: "In Progress",
      count: inProgressOrders.length,
      icon: Tool,
      content: renderList(inProgressOrders),
    },
    {
      value: "resolved",
      label: "Resolved",
      count: resolvedOrders.length,
      icon: ClipboardList,
      content: renderList(resolvedOrders),
    }
  ];

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <PageHeader 
        title="Service Dashboard" 
        subtitle="Manage assigned work orders and complaints."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Active" value={workOrders.length} icon={ClipboardList} />
        <StatCard title="In Progress" value={inProgressOrders.length} icon={Tool} />
        <StatCard title="New Orders" value={assignedOrders.length} icon={CheckCircle} />
        <StatCard title="Average TAT" value="--" icon={Clock} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border mt-8 overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 h-64">
             <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
             <p className="mt-4 text-slate-500 font-medium">Loading your tasks...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-12 h-64 text-center">
            <p className="text-red-500 font-medium mb-2">Failed to load work orders.</p>
            <button 
              onClick={() => refetch()} 
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Try again
            </button>
          </div>
        ) : (
          <Tabs 
            tabs={tabsData} 
            defaultValue="assigned"
            className="p-4 sm:p-6"
          />
        )}
      </div>

      {/* Resolve Modal */}
      {resolveModalData && (
        <ResolveWorkOrderModal 
          isOpen={!!resolveModalData}
          onClose={() => setResolveModalData(null)}
          onSubmit={handleResolveSubmit}
          isSubmitting={resolveMutation.isPending}
        />
      )}
    </div>
  );
}
