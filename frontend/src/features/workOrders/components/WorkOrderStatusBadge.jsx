import { Badge } from "../../../components/ui";

const STATUS_MAP = {
  ASSIGNED: { label: "Assigned", variant: "primary" }, // Re-mapping generic colors to match token guidelines
  IN_PROGRESS: { label: "In Progress", variant: "warning" },
  RESOLVED: { label: "Resolved", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
  CLOSED: { label: "Closed", variant: "default" },
};

export default function WorkOrderStatusBadge({ status }) {
  const mapping = STATUS_MAP[status] || { label: status, variant: "default" };
  
  return (
    <Badge variant={mapping.variant}>
      {mapping.label}
    </Badge>
  );
}
