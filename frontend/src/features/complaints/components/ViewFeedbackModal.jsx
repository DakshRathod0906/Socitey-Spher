import { Star, MessageSquare } from "lucide-react";
import { Modal, Button } from "../../../components/ui";

export default function ViewFeedbackModal({ isOpen, onClose, complaint }) {
  if (!complaint) return null;

  const hasFeedback = complaint.residentRating > 0 || complaint.residentFeedback;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Resident Feedback"
      description={`Feedback provided for ticket ${complaint.complaintNumber}`}
    >
      <div className="space-y-6 pt-4 animate-fade-in">
        {!hasFeedback ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-lg border border-slate-100">
            <MessageSquare className="w-10 h-10 text-slate-300 mb-3 opacity-50" />
            <p className="text-sm font-medium text-slate-600">No feedback available.</p>
            <p className="text-xs text-slate-400 mt-1">This ticket was closed without a rating or comment.</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center space-y-2 py-4 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-sm font-medium text-slate-600 uppercase tracking-wide">Rating</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 ${
                      star <= complaint.residentRating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-200 fill-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>

            {complaint.residentFeedback && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700 block">Comments</span>
                <div className="p-4 bg-white border border-slate-200 rounded-md shadow-sm text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  "{complaint.residentFeedback}"
                </div>
              </div>
            )}
            
            {complaint.actualResolutionAt && (
              <div className="text-xs text-slate-400 text-right">
                Resolved on: {new Date(complaint.actualResolutionAt).toLocaleString()}
              </div>
            )}
          </>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
