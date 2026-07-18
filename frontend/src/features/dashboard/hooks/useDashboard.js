import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../services/queryKeys";
import {
  fetchAdminDashboard,
  fetchResidentDashboard,
  fetchSuperAdminDashboard,
  fetchNotifications,
  markNotificationAsRead,
} from "../api/dashboard.api";

/**
 * Hook: Admin Dashboard data.
 * Returns aggregated metrics for the Society Admin dashboard.
 */
export const useAdminDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchAdminDashboard,
  });
};

/**
 * Hook: Resident Dashboard data.
 * Returns personal metrics for the logged-in resident.
 */
export const useResidentDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchResidentDashboard,
  });
};

/**
 * Hook: Super Admin Dashboard data.
 * Returns platform-wide metrics.
 */
export const useSuperAdminDashboard = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: fetchSuperAdminDashboard,
  });
};

/**
 * Hook: Notifications for the logged-in user.
 */
export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"], // Independent of dashboard
    queryFn: fetchNotifications,
  });
};

/**
 * Mutation: Mark a notification as read.
 * Invalidates the notifications cache.
 */
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
