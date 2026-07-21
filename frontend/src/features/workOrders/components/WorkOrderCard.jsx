import { Card } from "../../../components/ui";
import WorkOrderStatusBadge from "./WorkOrderStatusBadge";
import { format } from "date-fns";

export default function WorkOrderCard({ workOrder, onStart, onResolve }) {
  const { complaintId, status, assignedAt } = workOrder;

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-slate-800">
            {complaintId?.title || "Unknown Task"}
          </h3>
          <span className="text-sm text-slate-500">
            #{complaintId?.complaintNumber || "N/A"}
          </span>
        </div>
        <WorkOrderStatusBadge status={status} />
      </div>

      <div className="text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-700">Category:</span>{" "}
          {complaintId?.category || "N/A"}
        </p>
        <p>
          <span className="font-medium text-slate-700">Priority:</span>{" "}
          <span className={`capitalize ${complaintId?.priority === "high" ? "text-red-600 font-semibold" : ""}`}>
            {complaintId?.priority || "Normal"}
          </span>
        </p>
        <p>
          <span className="font-medium text-slate-700">Assigned:</span>{" "}
          {assignedAt ? format(new Date(assignedAt), "MMM dd, yyyy - hh:mm a") : "N/A"}
        </p>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        {status === "ASSIGNED" && (
          <button
            onClick={() => onStart(workOrder._id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
            aria-label={`Start work for task ${complaintId?.title}`}
          >
            Start Work
          </button>
        )}
        {status === "IN_PROGRESS" && (
          <button
            onClick={() => onResolve(workOrder._id)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-colors"
            aria-label={`Resolve task ${complaintId?.title}`}
          >
            Resolve
          </button>
        )}
      </div>
    </Card>
  );
}
