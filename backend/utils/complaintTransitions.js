import { COMPLAINT_STATUS } from "../constants/complaintStatus.js";

// After reopen approval, status goes back to OPEN (not a separate REOPENED state)
const VALID_TRANSITIONS = {
  [COMPLAINT_STATUS.OPEN]: [COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.CANCELLED, COMPLAINT_STATUS.REJECTED],
  [COMPLAINT_STATUS.ASSIGNED]: [COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.OPEN],
  [COMPLAINT_STATUS.IN_PROGRESS]: [COMPLAINT_STATUS.RESOLVED],
  [COMPLAINT_STATUS.RESOLVED]: [COMPLAINT_STATUS.CLOSED, COMPLAINT_STATUS.REOPEN_REQUESTED],
  [COMPLAINT_STATUS.REOPEN_REQUESTED]: [COMPLAINT_STATUS.OPEN, COMPLAINT_STATUS.CLOSED], // Admin approves (→ OPEN) or rejects (→ CLOSED)
  [COMPLAINT_STATUS.CLOSED]: [],     // Terminal
  [COMPLAINT_STATUS.CANCELLED]: [],  // Terminal
  [COMPLAINT_STATUS.REJECTED]: [],   // Terminal
};

export const canTransitionComplaint = (currentStatus, newStatus) => {
  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(newStatus);
};
