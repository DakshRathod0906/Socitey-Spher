import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "../../../services/queryKeys.js";
import { 
  fetchComplaints, 
  fetchComplaint, 
  createComplaint, 
  assignComplaint, 
  submitFeedback,
  uploadAttachment
} from "./complaint.api.js";
import { cacheHelpers } from "../../../lib/cacheHelpers.js";

/**
 * Hook to fetch complaints
 */
export function useComplaints(filters = {}) {
  return useQuery({
    queryKey: [...queryKeys.complaints, filters],
    queryFn: () => fetchComplaints(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single complaint
 */
export function useComplaint(id) {
  return useQuery({
    queryKey: queryKeys.complaint(id),
    queryFn: () => fetchComplaint(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a complaint
 */
export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      toast.success("Complaint submitted successfully");
      cacheHelpers.invalidate(queryClient, queryKeys.complaints);
      cacheHelpers.invalidate(queryClient, queryKeys.dashboard);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit complaint");
    },
  });
}

/**
 * Hook to assign a complaint to staff
 */
export function useAssignComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignComplaint,
    onSuccess: (data, variables) => {
      toast.success("Complaint assigned successfully");
      cacheHelpers.invalidate(queryClient, queryKeys.complaints);
      cacheHelpers.invalidate(queryClient, queryKeys.complaint(variables.id));
      cacheHelpers.invalidate(queryClient, queryKeys.serviceOrders);
      cacheHelpers.invalidate(queryClient, queryKeys.dashboard);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to assign complaint");
    },
  });
}

/**
 * Hook to submit feedback
 */
export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitFeedback,
    onSuccess: (data, variables) => {
      toast.success("Feedback submitted successfully");
      cacheHelpers.invalidate(queryClient, queryKeys.complaints);
      cacheHelpers.invalidate(queryClient, queryKeys.complaint(variables.id));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit feedback");
    },
  });
}

/**
 * Hook to upload attachment
 */
export function useUploadComplaintAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (data, variables) => {
      toast.success("Attachment uploaded successfully");
      cacheHelpers.invalidate(queryClient, queryKeys.complaint(variables.id));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload attachment");
    },
  });
}
