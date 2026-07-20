import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as userApi from "../api/user.api";
import { cacheHelpers } from "../../../lib/cacheHelpers";

export const useUsers = (filters = { status: "ACTIVE" }) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => userApi.fetchUsers(filters),
    keepPreviousData: true,
  });

  return {
    data: data || [],
    isLoading,
    isError,
    refetch,
  };
};

export const useDeactivateUser = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: userApi.deactivateUser,
    onSuccess: (data, variables, context) => {
      toast.success("User deactivated successfully.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      cacheHelpers.invalidateResidents();
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to deactivate user");
    },
    ...restOptions,
  });
};
