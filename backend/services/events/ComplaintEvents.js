import eventBus from "../../events/eventBus.js";
import { notify } from "../notification/NotificationService.js";

/**
 * Initializes the event listeners for Complaint and WorkOrder lifecycles.
 * Keeps business logic entirely separate from event orchestration.
 */
export const initComplaintEvents = () => {
  eventBus.on("complaint.created", (payload) => notify("complaint.created", payload));
  eventBus.on("complaint.cancelled", (payload) => notify("complaint.cancelled", payload));
  eventBus.on("complaint.rejected", (payload) => notify("complaint.rejected", payload));
  
  eventBus.on("complaint.reopen_requested", (payload) => notify("complaint.reopen_requested", payload));
  eventBus.on("complaint.reopen_approved", (payload) => notify("complaint.reopen_approved", payload));
  eventBus.on("complaint.closed", (payload) => notify("complaint.closed", payload));

  eventBus.on("workorder.assigned", (payload) => notify("workorder.assigned", payload));
  eventBus.on("workorder.started", (payload) => notify("workorder.started", payload));
  eventBus.on("workorder.resolved", (payload) => notify("workorder.resolved", payload));
  eventBus.on("workorder.cancelled", (payload) => notify("workorder.cancelled", payload));
  
  console.log("Complaint event listeners initialized.");
};
