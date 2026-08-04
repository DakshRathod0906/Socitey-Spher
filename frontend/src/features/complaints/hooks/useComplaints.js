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
  resolveComplaint,
  updateComplaintStatus,
} from "../api/complaintApi";
import { toast } from "sonner";
import api from "../../../services/api";

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
      toast.success(`Complaint ${data?.complaintNumber || ""} cancelled`);
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
      toast.success(`Complaint ${data?.complaintNumber || ""} rejected`);
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
      toast.success(`Requested reopen for ${data?.complaintNumber || ""}`);
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
      toast.success(`Reopen approved for ${data?.complaintNumber || ""}`);
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
      toast.success(`Reopen rejected for ${data?.complaintNumber || ""}`);
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
      toast.success(`Complaint ${data?.complaintNumber || ""} closed`);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to close complaint"),
  });
};

export const useResolveComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }) => resolveComplaint(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint marked as resolved");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to resolve complaint"),
  });
};

export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, remarks }) => updateComplaintStatus(id, status, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint status updated");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update complaint status"),
  });
};

export const useAssignWorkOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ complaintId, assignedTo, assignedDepartment }) =>
      api.post("/work-orders", { complaintId, assignedTo, assignedDepartment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Work order assigned successfully");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to assign work order"),
  });
};

export const useCancelWorkOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (workOrderId) => api.patch(`/work-orders/${workOrderId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Work order cancelled");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to cancel work order"),
  });
};


