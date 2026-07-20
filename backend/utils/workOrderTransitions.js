import { WORK_ORDER_STATUS } from "../constants/workOrderStatus.js";

const VALID_TRANSITIONS = {
  [WORK_ORDER_STATUS.ASSIGNED]: [WORK_ORDER_STATUS.IN_PROGRESS, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.IN_PROGRESS]: [WORK_ORDER_STATUS.RESOLVED, WORK_ORDER_STATUS.CANCELLED],
  [WORK_ORDER_STATUS.RESOLVED]: [],   // Terminal
  [WORK_ORDER_STATUS.CANCELLED]: [],  // Terminal
};

export const canTransitionWorkOrder = (currentStatus, newStatus) => {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(newStatus);
};
