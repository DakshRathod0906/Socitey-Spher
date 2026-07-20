import Notification from "../../models/Notification.js";
import User from "../../models/User.js";

/**
 * Universal notification emitter for the system.
 * Allows extending to email/SMS in the future without changing business logic.
 */
export const notify = async (eventName, payload) => {
  try {
    switch (eventName) {
      case "complaint.created":
        await handleComplaintCreated(payload);
        break;
      case "workorder.assigned":
        await handleWorkOrderAssigned(payload);
        break;
      case "workorder.resolved":
        await handleWorkOrderResolved(payload);
        break;
      case "complaint.reopen_requested":
        await handleReopenRequested(payload);
        break;
      case "complaint.reopen_approved":
        await handleReopenApproved(payload);
        break;
      case "complaint.closed":
        await handleComplaintClosed(payload);
        break;
      default:
        console.warn(`[NotificationService] Unhandled event: ${eventName}`);
    }
  } catch (err) {
    console.error(`[NotificationService] Failed to process ${eventName}:`, err);
  }
};

// Internal Handlers

const handleComplaintCreated = async ({ complaint }) => {
  // Notify Society Admins
  const admins = await User.find({ societyId: complaint.societyId, role: "society_admin" });
  const notifications = admins.map(admin => ({
    societyId: complaint.societyId,
    userId: admin._id,
    title: "New Complaint",
    message: `A new complaint (${complaint.complaintNumber}) was submitted by a resident.`,
    type: "complaint",
    linkId: complaint._id,
  }));
  if (notifications.length > 0) await Notification.insertMany(notifications);
};

const handleWorkOrderAssigned = async ({ workOrder, complaint }) => {
  // Notify Staff
  await Notification.create({
    societyId: workOrder.societyId,
    userId: workOrder.assignedTo,
    title: "New Work Order",
    message: `You have been assigned to complaint ${complaint.complaintNumber}: ${complaint.title}`,
    type: "complaint",
    linkId: complaint._id,
  });

  // Notify Resident
  await Notification.create({
    societyId: complaint.societyId,
    userId: complaint.residentId,
    title: "Complaint Assigned",
    message: `Your complaint ${complaint.complaintNumber} has been assigned to staff.`,
    type: "complaint",
    linkId: complaint._id,
  });
};

const handleWorkOrderResolved = async ({ workOrder, complaint }) => {
  // Notify Resident
  await Notification.create({
    societyId: complaint.societyId,
    userId: complaint.residentId,
    title: "Work Order Resolved",
    message: `The work order for complaint ${complaint.complaintNumber} has been resolved. Please accept and leave feedback.`,
    type: "complaint",
    linkId: complaint._id,
  });
};

const handleReopenRequested = async ({ complaint }) => {
  // Notify Admins
  const admins = await User.find({ societyId: complaint.societyId, role: "society_admin" });
  const notifications = admins.map(admin => ({
    societyId: complaint.societyId,
    userId: admin._id,
    title: "Reopen Requested",
    message: `Resident requested to reopen complaint ${complaint.complaintNumber}. Reason: ${complaint.reopenReason}`,
    type: "complaint",
    linkId: complaint._id,
  }));
  if (notifications.length > 0) await Notification.insertMany(notifications);
};

const handleReopenApproved = async ({ complaint }) => {
  // Notify Resident
  await Notification.create({
    societyId: complaint.societyId,
    userId: complaint.residentId,
    title: "Reopen Approved",
    message: `Your request to reopen complaint ${complaint.complaintNumber} has been approved. It will be assigned shortly.`,
    type: "complaint",
    linkId: complaint._id,
  });
};

const handleComplaintClosed = async ({ complaint }) => {
  // Can notify admins or just log it
};
