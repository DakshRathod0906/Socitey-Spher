import ComplaintHistory from "../../models/ComplaintHistory.js";

/**
 * Records a history entry for a complaint.
 * This is the single point for all audit trail writes.
 */
export const recordHistory = async ({
  complaintId,
  action,
  previousStatus = null,
  newStatus = null,
  performedBy,
  performedRole,
  remarks = "",
  metadata = {},
}) => {
  return ComplaintHistory.create({
    complaintId,
    action,
    previousStatus,
    newStatus,
    performedBy,
    performedRole,
    remarks,
    metadata,
  });
};

/**
 * Returns the full timeline for a complaint, ordered chronologically.
 */
export const getTimeline = async (complaintId) => {
  return ComplaintHistory.find({ complaintId })
    .populate("performedBy", "name role")
    .sort({ createdAt: 1 });
};
