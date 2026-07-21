import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchResidents, 
  fetchUsers, 
  deactivateUser, 
  inviteResident, 
  fetchInvitations, 
  revokeInvitation 
} from "../api/residentApi";

export const useResidents = (filters = {}) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["residents", filters],
    queryFn: () => fetchResidents(filters),
  });

  return {
    data: data?.data || [],
    meta: data?.meta || null,
    isLoading,
    isError,
    refetch,
  };
};

export const useUsers = (filters = { status: "ACTIVE" }) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => fetchUsers(filters),
  });

  return {
    data: data || [],
    isLoading,
    isError,
    refetch,
  };
};

export const useDeactivateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      toast.success("User deactivated successfully.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to deactivate user");
    },
  });
};

export const useInvitations = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["invitations"],
    queryFn: fetchInvitations,
  });

  return {
    data: data || [],
    isLoading,
    isError,
    refetch,
  };
};

export const useInviteResident = (options = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options;

  return useMutation({
    mutationFn: inviteResident,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      toast.success("Invitation sent successfully.");
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send invitation");
    },
    ...restOptions,
  });
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      queryClient.invalidateQueries({ queryKey: ["residents"] });
      toast.success("Invitation revoked successfully.");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to revoke invitation");
    },
  });
};
