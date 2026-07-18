import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "../../../services/queryKeys";
import { cacheHelpers } from "../../../lib/cacheHelpers";
import * as securityApi from "../api/securityVisit.api";

export const useTodayMetrics = () => {
  return useQuery({
    queryKey: [...queryKeys.visits, "today-metrics"],
    queryFn: securityApi.fetchTodayMetrics,
    refetchInterval: 30000, // refresh every 30 seconds
  });
};

export const useVerifyVisit = (options = {}) => {
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: securityApi.verifyVisit,
    onSuccess: (data, variables, context) => {
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Invalid QR Code");
    },
    ...restOptions,
  });
};

export const useCheckInVisit = (options = {}) => {
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: securityApi.checkInVisit,
    onSuccess: (data, variables, context) => {
      toast.success("Visitor Checked In!");
      cacheHelpers.invalidateVisits();
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Check-in failed");
    },
    ...restOptions,
  });
};

export const useCheckOutVisit = (options = {}) => {
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: securityApi.checkOutVisit,
    onSuccess: (data, variables, context) => {
      toast.success("Visitor Checked Out!");
      cacheHelpers.invalidateVisits();
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Check-out failed");
    },
    ...restOptions,
  });
};

export const useRequestWalkIn = (options = {}) => {
  const { onSuccess, ...restOptions } = options;
  return useMutation({
    mutationFn: securityApi.requestWalkIn,
    onSuccess: (data, variables, context) => {
      toast.success("Walk-in request sent to resident.");
      cacheHelpers.invalidateVisits();
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to send request");
    },
    ...restOptions,
  });
};
