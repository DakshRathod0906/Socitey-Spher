import Complaint from "../../models/Complaint.js";
import { COMPLAINT_STATUS, COMPLAINT_ACTIONS } from "../../constants/complaintStatus.js";
import { canTransitionComplaint } from "../../utils/complaintTransitions.js";
import { generateComplaintNumber } from "./ComplaintNumberService.js";
import { recordHistory } from "./ComplaintHistoryService.js";
import eventBus from "../../events/eventBus.js";

/**
 * Create a new complaint (Resident only).
 */
export const createComplaint = async ({ societyId, residentId, flatId, title, description, category, attachments = [] }) => {
  const complaintNumber = await generateComplaintNumber(societyId);

  const complaint = await Complaint.create({
    societyId,
    residentId,
    flatId,
    complaintNumber,
    title,
    description,
    category: category || "OTHER",
    // priority is system-assigned — defaults to MEDIUM
    status: COMPLAINT_STATUS.OPEN,
    attachments,
  });

  await recordHistory({
    complaintId: complaint._id,
    action: COMPLAINT_ACTIONS.CREATED,
    previousStatus: null,
    newStatus: COMPLAINT_STATUS.OPEN,
    performedBy: residentId,
    performedRole: "resident",
    remarks: `Complaint "${title}" created.`,
  });

  eventBus.emit("complaint.created", { complaint });

  return complaint;
};

/**
 * Cancel a complaint (Resident only, must be OPEN).
 */
export const cancelComplaint = async (complaintId, userId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw Object.assign(new Error("Complaint not found"), { statusCode: 404 });

  if (!canTransitionComplaint(complaint.status, COMPLAINT_STATUS.CANCELLED)) {
    throw Object.assign(new Error(`Cannot cancel a complaint with status "${complaint.status}"`), { statusCode: 400 });
  }

  const prev = complaint.status;
  complaint.status = COMPLAINT_STATUS.CANCELLED;
  await complaint.save();

  await recordHistory({
    complaintId: complaint._id,
    action: COMPLAINT_ACTIONS.CANCELLED,
    previousStatus: prev,
    newStatus: COMPLAINT_STATUS.CANCELLED,
    performedBy: userId,
    performedRole: "resident",
  });

  eventBus.emit("complaint.cancelled", { complaint });
  return complaint;
};

/**
 * Reject a complaint (Admin only, must be OPEN).
 */
export const rejectComplaint = async (complaintId, userId, reason = "") => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw Object.assign(new Error("Complaint not found"), { statusCode: 404 });

  if (!canTransitionComplaint(complaint.status, COMPLAINT_STATUS.REJECTED)) {
    throw Object.assign(new Error(`Cannot reject a complaint with status "${complaint.status}"`), { statusCode: 400 });
  }

  const prev = complaint.status;
  complaint.status = COMPLAINT_STATUS.REJECTED;
  await complaint.save();

  await recordHistory({
    complaintId: complaint._id,
    action: COMPLAINT_ACTIONS.REJECTED,
    previousStatus: prev,
    newStatus: COMPLAINT_STATUS.REJECTED,
    performedBy: userId,
    performedRole: "society_admin",
    remarks: reason,
  });

  eventBus.emit("complaint.rejected", { complaint });
  return complaint;
};

/**
 * Resident requests reopening (must be RESOLVED).
 */
export const requestReopen = async (complaintId, userId, reason = "") => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw Object.assign(new Error("Complaint not found"), { statusCode: 404 });

  if (!canTransitionComplaint(complaint.status, COMPLAINT_STATUS.REOPEN_REQUESTED)) {
    throw Object.assign(new Error(`Cannot request reopen for complaint with status "${complaint.status}"`), { statusCode: 400 });
  }

  const prev = complaint.status;
  complaint.status = COMPLAINT_STATUS.REOPEN_REQUESTED;
  complaint.reopenReason = reason;
  await complaint.save();

  await recordHistory({
    complaintId: complaint._id,
    action: COMPLAINT_ACTIONS.REOPEN_REQUESTED,
    previousStatus: prev,
    newStatus: COMPLAINT_STATUS.REOPEN_REQUESTED,
    performedBy: userId,
    performedRole: "resident",
    remarks: reason,
  });

  eventBus.emit("complaint.reopen_requested", { complaint });
  return complaint;
};

/**
 * Admin approves reopen request → status goes back to OPEN.
 */
export const approveReopen = async (complaintId, userId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw Object.assign(new Error("Complaint not found"), { statusCode: 404 });

  if (complaint.status !== COMPLAINT_STATUS.REOPEN_REQUESTED) {
    throw Object.assign(new Error("Complaint does not have a pending reopen request"), { statusCode: 400 });
  }

  const prev = complaint.status;
  complaint.status = COMPLAINT_STATUS.OPEN;
  complaint.reopenReason = null;
  await complaint.save();

  await recordHistory({
    complaintId: complaint._id,
    action: COMPLAINT_ACTIONS.REOPEN_APPROVED,
    previousStatus: prev,
    newStatus: COMPLAINT_STATUS.OPEN,
    performedBy: userId,
    performedRole: "society_admin",
    remarks: "Reopen request approved. Complaint is now open for reassignment.",
  });

  eventBus.emit("complaint.reopen_approved", { complaint });
  return complaint;
};

/**
 * Admin rejects reopen request → status goes to CLOSED.
 */
export const rejectReopen = async (complaintId, userId, reason = "") => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw Object.assign(new Error("Complaint not found"), { statusCode: 404 });

  if (complaint.status !== COMPLAINT_STATUS.REOPEN_REQUESTED) {
    throw Object.assign(new Error("Complaint does not have a pending reopen request"), { statusCode: 400 });
  }

  const prev = complaint.status;
  complaint.status = COMPLAINT_STATUS.CLOSED;
  complaint.reopenReason = null;
  await complaint.save();

  await recordHistory({
    complaintId: complaint._id,
    action: COMPLAINT_ACTIONS.REOPEN_REJECTED,
    previousStatus: prev,
    newStatus: COMPLAINT_STATUS.CLOSED,
    performedBy: userId,
    performedRole: "society_admin",
    remarks: reason || "Reopen request rejected.",
  });

  eventBus.emit("complaint.closed", { complaint });
  return complaint;
};

/**
 * Resident closes complaint and optionally leaves feedback (must be RESOLVED).
 */
export const closeComplaint = async (complaintId, userId, { rating = null, feedback = "" } = {}) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw Object.assign(new Error("Complaint not found"), { statusCode: 404 });

  if (!canTransitionComplaint(complaint.status, COMPLAINT_STATUS.CLOSED)) {
    throw Object.assign(new Error(`Cannot close a complaint with status "${complaint.status}"`), { statusCode: 400 });
  }

  const prev = complaint.status;
  complaint.status = COMPLAINT_STATUS.CLOSED;
  if (rating) complaint.residentRating = rating;
  if (feedback) complaint.residentFeedback = feedback;
  await complaint.save();

  await recordHistory({
    complaintId: complaint._id,
    action: COMPLAINT_ACTIONS.CLOSED,
    previousStatus: prev,
    newStatus: COMPLAINT_STATUS.CLOSED,
    performedBy: userId,
    performedRole: "resident",
    remarks: feedback || "Complaint closed by resident.",
    metadata: { rating },
  });

  eventBus.emit("complaint.closed", { complaint });
  return complaint;
};

/**
 * Get a single complaint by ID (with tenant check).
 */
export const getComplaintById = async (complaintId, societyId) => {
  const complaint = await Complaint.findOne({ _id: complaintId, societyId, isArchived: false })
    .populate("residentId", "name email")
    .populate("flatId", "flatNumber");
  if (!complaint) throw Object.assign(new Error("Complaint not found"), { statusCode: 404 });
  return complaint;
};

/**
 * List complaints with filters (scoped by tenant and role).
 */
export const listComplaints = async ({ societyId, role, userId, status, category, page = 1, limit = 20 }) => {
  const filter = { societyId, isArchived: false };

  // Residents see only their own complaints
  if (role === "resident") filter.residentId = userId;

  if (status) filter.status = status;
  if (category) filter.category = category;

  const skip = (page - 1) * limit;

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate("residentId", "name email")
      .populate("flatId", "flatNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(filter),
  ]);

  return { complaints, total, page, pages: Math.ceil(total / limit) };
};
