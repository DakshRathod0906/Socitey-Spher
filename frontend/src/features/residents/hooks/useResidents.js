import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "../../../services/queryKeys";
import { cacheHelpers } from "../../../lib/cacheHelpers";
import * as residentApi from "../api/resident.api";

/**
 * Standardized hook for listing residents with pagination and search.
 */
export const useResidents = (filters = {}) => {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [...queryKeys.residents, filters],
    queryFn: () => residentApi.fetchResidents(filters),
    keepPreviousData: true,
  });

  return {
    data: data?.data || [],
    meta: data?.meta || null,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
};

/**
 * Mutation for inviting a new resident.
 * Standard Mutation Pattern: Success -> Toast -> Invalidate -> (caller handles modal close)
 */
export const useInviteResident = (options = {}) => {
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: residentApi.inviteResident,
    onSuccess: (data, variables, context) => {
      toast.success("Invitation sent successfully.");
      cacheHelpers.invalidateResidents();
      cacheHelpers.invalidateDashboard(); // Invalidate dashboard since total count may change
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions,
  });
};

export const useInvitations = () => {
  return useQuery({
    queryKey: ["invitations"],
    queryFn: residentApi.fetchInvitations,
  });
};

export const useRevokeInvitation = (options = {}) => {
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: residentApi.revokeInvitation,
    onSuccess: (data, variables, context) => {
      toast.success("Invitation revoked successfully.");
      cacheHelpers.invalidateResidents();
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions,
  });
};

/**
 * Mutation for updating resident details.
 */
export const useUpdateResident = (options = {}) => {
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: ({ id, payload }) => residentApi.updateResident(id, payload),
    onSuccess: (data, variables, context) => {
      toast.success("Resident updated successfully.");
      cacheHelpers.invalidateResidents();
      cacheHelpers.invalidateResident(variables.id);
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions,
  });
};

/**
 * Mutation for deactivating a resident.
 */
export const useDeactivateResident = (options = {}) => {
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: residentApi.deactivateResident,
    onSuccess: (data, variables, context) => {
      toast.success("Resident deactivated.");
      cacheHelpers.invalidateResidents();
      cacheHelpers.invalidateDashboard();
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions,
  });
};
