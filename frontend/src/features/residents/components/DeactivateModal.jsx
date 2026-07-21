import { AlertTriangle } from "lucide-react";
import { Modal, Button } from "../../../components/ui";
import { useDeactivateUser } from "../hooks/useResidents";

export default function DeactivateModal({ open, onClose, user }) {
  const { mutate: deactivateUser, isPending } = useDeactivateUser();

  if (!user) return null;

  const handleDeactivate = () => {
    deactivateUser(user._id, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const isStaff = ["security", "service_staff"].includes(user.role);

  return (
    <Modal 
      open={open} 
      onClose={isPending ? undefined : onClose} 
      title="Deactivate User" 
      size="sm"
    >
      <div className="space-y-4">
        <div className="p-4 bg-danger-light text-danger rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-1">
              Are you sure you want to deactivate {user.name}?
            </p>
            <p className="opacity-90 leading-relaxed">
              {isStaff
                ? "If this staff member has active work orders, deactivation will fail. Please ensure they are reassigned first. They will lose access to the portal immediately."
                : "This will end their active occupancy and revoke their login access immediately."}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeactivate} 
            disabled={isPending}
          >
            {isPending ? "Deactivating..." : "Deactivate User"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
