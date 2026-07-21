import { useState } from "react";
import { Star } from "lucide-react";
import { Modal, Button, Textarea } from "../../../components/ui";

export default function FeedbackModal({ isOpen, onClose, complaint, onSubmit, isSubmitting }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (rating === 0) {
      setError("Please select a rating to continue.");
      return;
    }
    onSubmit({ rating, feedback: feedback.trim() });
  };

  if (!complaint) return null;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Close Complaint & Leave Feedback"
      description={`How was your experience resolving ${complaint.complaintNumber}?`}
    >
      <div className="space-y-6 pt-4 animate-fade-in">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center justify-center space-y-2">
          <label className="text-sm font-medium text-slate-700">Rate the resolution</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRating(star);
                  setError("");
                }}
                className={`p-1 transition-colors ${
                  star <= rating ? "text-yellow-400" : "text-slate-200"
                } hover:text-yellow-400`}
              >
                <Star className="w-8 h-8 fill-current" />
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="Additional Comments (Optional)"
          placeholder="Tell us what went well or what could be improved..."
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Submit & Close Ticket
          </Button>
        </div>
      </div>
    </Modal>
  );
}
