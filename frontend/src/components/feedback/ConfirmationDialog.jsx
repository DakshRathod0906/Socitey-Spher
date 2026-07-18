import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { AlertTriangle } from "lucide-react";

export default function ConfirmationDialog({
  open = false,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
    >
      <div className="flex flex-col items-center text-center">
        <div
          className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${
            variant === "danger" ? "bg-danger-light" : "bg-warning-light"
          }`}
        >
          <AlertTriangle
            className={`h-6 w-6 ${
              variant === "danger" ? "text-danger" : "text-warning"
            }`}
          />
        </div>
        <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
        <p className="text-sm text-muted mb-6">{message}</p>
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
