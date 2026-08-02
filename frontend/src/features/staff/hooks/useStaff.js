import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStaff, getStaffById, createStaff, updateStaff, toggleStaffStatus } from "../api/staffApi";
import { staffKeys } from "./staffKeys";
import { toast } from "sonner";

export const useStaff = (filters = {}) => {
  const queryClient = useQueryClient();

  // Fetch all staff with filters
  const staffQuery = useQuery({
    queryKey: staffKeys.list(filters),
    queryFn: () => getStaff(filters),
    keepPreviousData: true,
  });

  // Create Staff Mutation
  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      toast.success("Staff member created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create staff member");
    },
  });

  // Update Staff Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateStaff(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(variables.id) });
      toast.success("Staff member updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update staff member");
    },
  });

  // Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }) => toggleStaffStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(variables.id) });
      const action = variables.status === "ACTIVE" ? "activated" : "deactivated";
      toast.success(`Staff member ${action} successfully`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  return {
    staff: staffQuery.data?.data || [],
    pagination: staffQuery.data?.pagination || {},
    isLoading: staffQuery.isLoading,
    isFetching: staffQuery.isFetching,
    error: staffQuery.error,
    refetch: staffQuery.refetch,
    
    // Mutations
    createStaff: createMutation.mutate,
    isCreating: createMutation.isPending,
    
    updateStaff: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    
    toggleStatus: toggleStatusMutation.mutate,
    isToggling: toggleStatusMutation.isPending,
  };
};

export const useStaffDetail = (id) => {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: () => getStaffById(id),
    enabled: !!id,
  });
};
