export const notifyResident = async (userId, title, message) => {
  // Console.log placeholder for now. Later: WebSocket, Push, Email
  console.log(`[NOTIFICATION: RESIDENT ${userId}] ${title}: ${message}`);
};

export const notifySecurity = async (societyId, title, message) => {
  // Console.log placeholder for now. Later: WebSocket to security dashboard
  console.log(`[NOTIFICATION: SECURITY ${societyId}] ${title}: ${message}`);
};

export const notifyAdmin = async (societyId, title, message) => {
  console.log(`[NOTIFICATION: ADMIN ${societyId}] ${title}: ${message}`);
};
