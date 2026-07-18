/**
 * Central registry for React Query keys.
 * Freeze this hierarchy to prevent typo-induced cache invalidation failures.
 */
export const queryKeys = {
  auth: ["auth"],
  me: ["me"],
  dashboard: ["dashboard"],
  residents: ["residents"],
  resident: (id) => ["residents", id],
  visits: ["visits"],
  visit: (id) => ["visits", id],
  complaints: ["complaints"],
  complaint: (id) => ["complaints", id],
  complaintTimeline: (id) => ["complaints", id, "timeline"],
  serviceOrders: ["serviceOrders"],
  serviceOrder: (id) => ["serviceOrders", id],
  billing: ["billing"],
  parking: ["parking"],
  amenities: ["amenities"],
  notices: ["notices"],
  notice: (id) => ["notices", id],
  reports: ["reports"],
};
