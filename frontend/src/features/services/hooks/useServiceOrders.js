import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "../../../services/queryKeys.js";
import { 
  fetchServiceOrders, 
  acceptServiceOrder, 
  updateProgress, 
  completeServiceOrder, 
  uploadCompletionPhoto 
} from "./serviceOrder.api.js";
import { cacheHelpers } from "../../../lib/cacheHelpers.js";

export function useServiceOrders(filters = {}) {
  return useQuery({
    queryKey: [...queryKeys.serviceOrders, filters],
    queryFn: () => fetchServiceOrders(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAcceptServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptServiceOrder,
    onSuccess: (data, id) => {
      toast.success("Service order accepted");
      cacheHelpers.invalidate(queryClient, queryKeys.serviceOrders);
      cacheHelpers.invalidate(queryClient, queryKeys.serviceOrder(id));
      cacheHelpers.invalidate(queryClient, queryKeys.dashboard);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to accept order");
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProgress,
    onSuccess: (data, variables) => {
      toast.success("Progress updated successfully");
      cacheHelpers.invalidate(queryClient, queryKeys.serviceOrders);
      cacheHelpers.invalidate(queryClient, queryKeys.serviceOrder(variables.id));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update progress");
    },
  });
}

export function useCompleteServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeServiceOrder,
    onSuccess: (data, id) => {
      toast.success("Service order marked as complete");
      cacheHelpers.invalidate(queryClient, queryKeys.serviceOrders);
      cacheHelpers.invalidate(queryClient, queryKeys.serviceOrder(id));
      cacheHelpers.invalidate(queryClient, queryKeys.complaints); // Complaint status changed
      cacheHelpers.invalidate(queryClient, queryKeys.dashboard);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to complete service order");
    },
  });
}

export function useUploadCompletionPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadCompletionPhoto,
    onSuccess: (data, variables) => {
      toast.success("Photo uploaded successfully");
      cacheHelpers.invalidate(queryClient, queryKeys.serviceOrders);
      cacheHelpers.invalidate(queryClient, queryKeys.serviceOrder(variables.id));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload photo");
    },
  });
}
