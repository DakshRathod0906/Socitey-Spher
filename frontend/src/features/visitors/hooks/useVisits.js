import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "../../../services/queryKeys";
import { cacheHelpers } from "../../../lib/cacheHelpers";
import * as visitApi from "../api/visit.api";

/**
 * Standardized hook for listing visits with pagination and search.
 */
export const useVisits = (filters = {}) => {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [...queryKeys.visits, filters],
    queryFn: () => visitApi.fetchVisits(filters),
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
 * Mutation for creating a new visit (pre-approval).
 */
export const useCreateVisit = (options = {}) => {
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: visitApi.createVisit,
    onSuccess: (data, variables, context) => {
      toast.success("Visitor pre-approved successfully.");
      cacheHelpers.invalidateVisits();
      cacheHelpers.invalidateDashboard(); // Updates 'Visitors Today' stat
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions,
  });
};

/**
 * Mutation for cancelling a visit.
 */
export const useCancelVisit = (options = {}) => {
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: visitApi.cancelVisit,
    onSuccess: (data, variables, context) => {
      toast.success("Visit cancelled.");
      cacheHelpers.invalidateVisits();
      cacheHelpers.invalidateDashboard();
      if (onSuccess) onSuccess(data, variables, context);
    },
    ...restOptions,
  });
};
