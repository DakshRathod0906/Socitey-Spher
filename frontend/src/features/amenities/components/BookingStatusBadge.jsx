import { Badge } from "../../../components/ui";

const STATUS_MAP = {
  CONFIRMED: { label: "Confirmed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
  COMPLETED: { label: "Completed", variant: "default" },
};

export default function BookingStatusBadge({ status }) {
  const mapping = STATUS_MAP[status] || { label: status, variant: "default" };
  
  return (
    <Badge variant={mapping.variant}>
      {mapping.label}
    </Badge>
  );
}
