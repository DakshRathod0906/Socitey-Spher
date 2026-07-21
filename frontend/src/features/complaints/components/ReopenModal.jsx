import { useState } from "react";
import { Modal, Button, Textarea } from "../../../components/ui";

export default function ReopenModal({ isOpen, onClose, complaint, onSubmit, isSubmitting }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError("Please provide a reason for reopening the ticket.");
      return;
    }
    onSubmit({ reason: reason.trim() });
  };

  if (!complaint) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Request Reopen"
      description={`Are you unsatisfied with the resolution for ${complaint.complaintNumber}?`}
    >
      <div className="space-y-4 pt-4 animate-fade-in">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
            {error}
          </div>
        )}

        <Textarea
          label="Reason for Reopen"
          placeholder="Please explain why the issue is not fully resolved..."
          rows={4}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setError("");
          }}
          required
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting} variant="primary">
            Submit Request
          </Button>
        </div>
      </div>
    </Modal>
  );
}
