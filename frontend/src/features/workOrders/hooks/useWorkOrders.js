import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getActiveWorkOrders,
  startWorkOrder,
  resolveWorkOrder,
} from "../api/workOrderApi";
import { toast } from "sonner";

// Query Keys
export const WORK_ORDER_KEYS = {
  all: ["workOrders"],
  active: () => [...WORK_ORDER_KEYS.all, "active"],
  detail: (id) => [...WORK_ORDER_KEYS.all, id],
};

// Queries
export const useActiveWorkOrders = () => {
  return useQuery({
    queryKey: WORK_ORDER_KEYS.active(),
    queryFn: getActiveWorkOrders,
  });
};

// Mutations
export const useStartWorkOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: startWorkOrder,
    // Server-first refresh strategy
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORK_ORDER_KEYS.active() });
      toast.success("Work started successfully");
    },
    onError: (err) => {
      handleApiError(err, "Failed to start work");
    },
  });
};

export const useResolveWorkOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, formData }) => resolveWorkOrder(id, formData),
    // Server-first refresh strategy
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORK_ORDER_KEYS.active() });
      queryClient.invalidateQueries({ queryKey: [...WORK_ORDER_KEYS.all, "history"] });
      toast.success("Work order resolved");
    },
    onError: (err) => {
      handleApiError(err, "Failed to resolve work order");
    },
  });
};

// Helper for Error Matrix mapping
const handleApiError = (err, fallbackMessage) => {
  const status = err.response?.status;
  const dataMessage = err.response?.data?.message;

  if (status === 400) {
    toast.error(dataMessage || "Validation error. Please check your input.");
  } else if (status === 401) {
    toast.error("Session expired. Please log in again.");
  } else if (status === 403) {
    toast.error("Permission denied to perform this action.");
  } else if (status === 404) {
    toast.error("Work order no longer exists or was removed.");
  } else if (status === 409) {
    toast.error(dataMessage || "Work order status conflict.");
  } else {
    toast.error(fallbackMessage || "An unexpected server error occurred.");
  }
};
