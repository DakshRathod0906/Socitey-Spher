import { queryClient } from "../services/queryClient";
import { queryKeys } from "../services/queryKeys";

/**
 * Mutation Helpers
 * Centralized cache invalidation logic.
 * Components call these helpers after successful mutations instead of
 * manually tracking query keys.
 */

export const cacheHelpers = {
  // --- Dashboard ---
  invalidateDashboard: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  },
  invalidateNotifications: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
  },

  // --- Residents ---
  invalidateResidents: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.residents });
  },
  invalidateResident: (id) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.resident(id) });
  },

  // --- Visitors ---
  invalidateVisitors: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.visitors });
  },

  // --- Complaints ---
  invalidateComplaints: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.complaints });
  },

  // --- Billing ---
  invalidateBilling: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.billing });
  },

  // --- Notices ---
  invalidateNotices: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notices });
  },
};
