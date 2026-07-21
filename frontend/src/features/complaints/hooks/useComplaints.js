import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComplaints,
  getComplaint,
  createComplaint,
  cancelComplaint,
  rejectComplaint,
  requestReopen,
  approveReopen,
  rejectReopen,
  closeComplaint,
} from "../api/complaintApi";
import { toast } from "sonner";

// Queries
export const useComplaints = (filters) => {
  return useQuery({
    queryKey: ["complaints", filters],
    queryFn: () => getComplaints(filters),
  });
};

export const useComplaint = (id) => {
  return useQuery({
    queryKey: ["complaints", id],
    queryFn: () => getComplaint(id),
    enabled: !!id,
  });
};



// Mutations
export const useCreateComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint created successfully");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create complaint"),
  });
};

export const useCancelComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelComplaint,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success(`Complaint ${data.complaintNumber} cancelled`);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to cancel complaint"),
  });
};

export const useRejectComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => rejectComplaint(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success(`Complaint ${data.complaintNumber} rejected`);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to reject complaint"),
  });
};

export const useRequestReopen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => requestReopen(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success(`Requested reopen for ${data.complaintNumber}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to request reopen"),
  });
};

export const useApproveReopen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveReopen,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success(`Reopen approved for ${data.complaintNumber}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to approve reopen"),
  });
};

export const useRejectReopen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => rejectReopen(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success(`Reopen rejected for ${data.complaintNumber}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to reject reopen"),
  });
};

export const useCloseComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating, feedback }) => closeComplaint(id, { rating, feedback }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success(`Complaint ${data.complaintNumber} closed`);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to close complaint"),
  });
};

