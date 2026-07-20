import WorkOrder from "../../models/WorkOrder.js";
import Complaint from "../../models/Complaint.js";
import { WORK_ORDER_STATUS } from "../../constants/workOrderStatus.js";
import { COMPLAINT_STATUS, COMPLAINT_ACTIONS } from "../../constants/complaintStatus.js";
import { canTransitionWorkOrder } from "../../utils/workOrderTransitions.js";
import { recordHistory } from "../complaint/ComplaintHistoryService.js";
import eventBus from "../../events/eventBus.js";

/**
 * Assign a work order to a staff member.
 * This updates the Complaint status to ASSIGNED and records history.
 */
export const assignWorkOrder = async ({ societyId, complaintId, assignedTo, assignedBy, assignedDepartment = "General" }) => {
  const complaint = await Complaint.findOne({ _id: complaintId, societyId });
  if (!complaint) throw Object.assign(new Error("Complaint not found"), { statusCode: 404 });

  // Ensure complaint is open for assignment (OPEN or REOPENED/OPEN)
  if (complaint.status !== COMPLAINT_STATUS.OPEN) {
    throw Object.assign(new Error(`Cannot assign complaint with status "${complaint.status}"`), { statusCode: 400 });
  }

  // Create new WorkOrder (immutable record of this assignment)
  const workOrder = await WorkOrder.create({
    societyId,
    complaintId,
    assignedTo,
    assignedBy,
    assignedDepartment,
    status: WORK_ORDER_STATUS.ASSIGNED,
  });

  // Update Complaint
  const prevStatus = complaint.status;
  complaint.status = COMPLAINT_STATUS.ASSIGNED;
  await complaint.save();

  // Audit trail
  await recordHistory({
    complaintId,
    action: COMPLAINT_ACTIONS.ASSIGNED,
    previousStatus: prevStatus,
    newStatus: COMPLAINT_STATUS.ASSIGNED,
    performedBy: assignedBy,
    performedRole: "society_admin",
    remarks: `Assigned to staff ID: ${assignedTo}`,
    metadata: { workOrderId: workOrder._id, assignedTo },
  });

  // Emit event
  eventBus.emit("workorder.assigned", { workOrder, complaint });

  return workOrder;
};

/**
 * Start work on an assignment (Service Staff only).
 */
export const startWorkOrder = async (workOrderId, userId) => {
  const workOrder = await WorkOrder.findOne({ _id: workOrderId, assignedTo: userId });
  if (!workOrder) throw Object.assign(new Error("Work order not found or not assigned to you"), { statusCode: 404 });

  if (!canTransitionWorkOrder(workOrder.status, WORK_ORDER_STATUS.IN_PROGRESS)) {
    throw Object.assign(new Error(`Cannot start work order with status "${workOrder.status}"`), { statusCode: 400 });
  }

  workOrder.status = WORK_ORDER_STATUS.IN_PROGRESS;
  workOrder.startedAt = new Date();
  await workOrder.save();

  // Update Complaint
  const complaint = await Complaint.findById(workOrder.complaintId);
  const prevStatus = complaint.status;
  if (complaint.status !== COMPLAINT_STATUS.IN_PROGRESS) {
    complaint.status = COMPLAINT_STATUS.IN_PROGRESS;
    await complaint.save();

    await recordHistory({
      complaintId: complaint._id,
      action: COMPLAINT_ACTIONS.STARTED,
      previousStatus: prevStatus,
      newStatus: COMPLAINT_STATUS.IN_PROGRESS,
      performedBy: userId,
      performedRole: "service_staff",
      remarks: "Work started by assigned staff.",
      metadata: { workOrderId: workOrder._id },
    });
  }

  eventBus.emit("workorder.started", { workOrder, complaint });
  return workOrder;
};

/**
 * Resolve a work order (Service Staff only).
 */
export const resolveWorkOrder = async (workOrderId, userId, { resolutionNotes = "", completionPhotos = [] } = {}) => {
  const workOrder = await WorkOrder.findOne({ _id: workOrderId, assignedTo: userId });
  if (!workOrder) throw Object.assign(new Error("Work order not found or not assigned to you"), { statusCode: 404 });

  if (!canTransitionWorkOrder(workOrder.status, WORK_ORDER_STATUS.RESOLVED)) {
    throw Object.assign(new Error(`Cannot resolve work order with status "${workOrder.status}"`), { statusCode: 400 });
  }

  workOrder.status = WORK_ORDER_STATUS.RESOLVED;
  workOrder.resolvedAt = new Date();
  workOrder.resolutionNotes = resolutionNotes;
  if (completionPhotos.length > 0) {
    workOrder.completionPhotos = completionPhotos;
  }
  await workOrder.save();

  // Update Complaint
  const complaint = await Complaint.findById(workOrder.complaintId);
  const prevStatus = complaint.status;
  complaint.status = COMPLAINT_STATUS.RESOLVED;
  complaint.actualResolutionAt = new Date();
  await complaint.save();

  await recordHistory({
    complaintId: complaint._id,
    action: COMPLAINT_ACTIONS.RESOLVED,
    previousStatus: prevStatus,
    newStatus: COMPLAINT_STATUS.RESOLVED,
    performedBy: userId,
    performedRole: "service_staff",
    remarks: resolutionNotes || "Work order resolved.",
    metadata: { workOrderId: workOrder._id },
  });

  eventBus.emit("workorder.resolved", { workOrder, complaint });
  return workOrder;
};

/**
 * Cancel a work order (Admin only). Complaint goes back to OPEN for reassignment.
 */
export const cancelWorkOrder = async (workOrderId, userId, reason = "") => {
  const workOrder = await WorkOrder.findById(workOrderId);
  if (!workOrder) throw Object.assign(new Error("Work order not found"), { statusCode: 404 });

  if (!canTransitionWorkOrder(workOrder.status, WORK_ORDER_STATUS.CANCELLED)) {
    throw Object.assign(new Error(`Cannot cancel work order with status "${workOrder.status}"`), { statusCode: 400 });
  }

  workOrder.status = WORK_ORDER_STATUS.CANCELLED;
  workOrder.cancelledAt = new Date();
  if (reason) {
    workOrder.progressNotes.push({ note: `Cancelled: ${reason}` });
  }
  await workOrder.save();

  // Revert Complaint back to OPEN for reassignment
  const complaint = await Complaint.findById(workOrder.complaintId);
  const prevStatus = complaint.status;
  
  if (complaint.status !== COMPLAINT_STATUS.CLOSED && complaint.status !== COMPLAINT_STATUS.CANCELLED) {
    complaint.status = COMPLAINT_STATUS.OPEN;
    await complaint.save();
    
    await recordHistory({
      complaintId: complaint._id,
      action: COMPLAINT_ACTIONS.CANCELLED, // Note: This is cancelling the WORK ORDER, but we record it on the complaint history
      previousStatus: prevStatus,
      newStatus: COMPLAINT_STATUS.OPEN,
      performedBy: userId,
      performedRole: "society_admin",
      remarks: `Work order cancelled. Complaint ready for reassignment. ${reason}`,
      metadata: { workOrderId: workOrder._id },
    });
  }

  eventBus.emit("workorder.cancelled", { workOrder, complaint });
  return workOrder;
};

/**
 * Get active work orders for a specific staff member.
 */
export const getActiveWorkOrders = async (societyId, staffId) => {
  return WorkOrder.find({
    societyId,
    assignedTo: staffId,
    status: { $in: [WORK_ORDER_STATUS.ASSIGNED, WORK_ORDER_STATUS.IN_PROGRESS] },
    isArchived: false,
  }).populate("complaintId", "title description category status complaintNumber");
};
