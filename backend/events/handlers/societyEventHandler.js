import eventBus from "../eventBus.js";
import { EVENTS } from "../events.js";

// Setup event listeners
export const initSocietyEventHandlers = () => {
  eventBus.on(EVENTS.SOCIETY_APPROVED, (payload) => {
    const { society, adminUser } = payload;
    console.log(`[EVENT] Society Approved: ${society.name} (Code: ${society.societyCode})`);
    // Future: Send Email to Society Admin
    // Future: Setup default roles or permissions
  });

  eventBus.on(EVENTS.SOCIETY_REJECTED, (payload) => {
    const { society, adminUser, reason } = payload;
    console.log(`[EVENT] Society Rejected: ${society.name} - Reason: ${reason}`);
    // Future: Send Email to Society Admin
  });
  
  eventBus.on(EVENTS.SOCIETY_ACTIVATED, (payload) => {
    const { society } = payload;
    console.log(`[EVENT] Society Activated: ${society.name} - Setup Complete`);
  });
};
